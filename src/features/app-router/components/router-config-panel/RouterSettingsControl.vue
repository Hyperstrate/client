<template lang="pug">
div(class="p-4 flex flex-col gap-5")
  //- Webhook
  div(class="flex flex-col gap-3")
    ui-overline Webhook

    div(class="flex flex-col gap-1.5")
      div(class="flex items-center justify-between")
        span(class="text-sm font-medium text-gray-700") Notification URL
        ui-status(v-if="savedWebhookUrl" :value="true" active-label="Configured" inactive-label="")
      ui-input-text(v-model="webhookUrl" type="url" placeholder="https://your-server.com/webhook")
      p(class="text-xs text-gray-400 leading-relaxed")
        | Receives a POST when: budget exceeded, all targets failed, rate limit hit, or
        | budget alert threshold crossed. Leave blank to disable.

    div(class="flex flex-col gap-1.5")
      span(class="text-sm font-medium text-gray-700") Budget alert threshold
      div(class="flex items-center gap-2")
        ui-input-text(v-model.number="alertPercent" type="number" min="1" max="99" placeholder="80" class="!w-fit min-w-fit")
        span(class="text-sm text-gray-500") % of budget used triggers alert
      p(class="text-xs text-gray-400")
        | Set this in the Budget feature config as
        code(class="bg-gray-100 px-1 rounded font-mono") alert_percent
        | . The webhook URL above is used to send the alert.

    div(class="flex items-center justify-end gap-2")
      ui-button(:disabled="!webhookChanged || saveBusy" :busy="saveBusy" @click="saveWebhook") Save webhook

  //- Budget Status
  div(v-if="budgetStatus" class="flex flex-col gap-3 border-t border-gray-100 pt-4")
    ui-overline Budget usage
    div(class="flex flex-col gap-2")
      div(class="flex items-center justify-between text-xs text-gray-500")
        span Period: {{ budgetStatus.periodKey }}
        span(class="font-numeric tabular-nums") {{ formatNumber(budgetStatus.requests) }} req / {{ formatCurrency(budgetStatus.estimatedCostUsd ?? 0) }}
      div(v-if="hasBudgetCostLimit" class="flex flex-col gap-1")
        div(class="flex items-center justify-between text-xs")
          span(class="text-gray-400") Cost used
          span(class="font-numeric tabular-nums" :class="costPct > 80 ? 'text-red-500 font-semibold' : 'text-gray-600'") {{ formatPercent(costPct) }}
        div(class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden")
          div(
            class="h-full rounded-full transition-all"
            :class="costPct > 80 ? 'bg-red-500' : costPct > 60 ? 'bg-amber-400' : 'bg-indigo-500'"
            :style="{ width: Math.min(costPct, 100) + '%' }"
          )

  //- Team access
  div(class="flex flex-col gap-3 border-t border-gray-100 pt-4")
    ui-overline Team access
    div(class="flex flex-col gap-1.5")
      span(class="text-sm font-medium text-gray-700") Allowed teams
      domain-ui-input-combobox-team(v-model="selectedTeams" multiple)
      p(class="text-xs text-gray-400 leading-relaxed")
        | Empty means any authenticated caller can use this router. Add teams to enforce a router-level allow-list.
    div(v-if="teamAccess.length" class="flex flex-wrap gap-1.5")
      ui-badge(v-for="team in selectedTeams" :key="team.value.id" :variant="Variant.Indigo") {{ team.label }}
    div(class="flex items-center justify-end gap-2")
      ui-button(:disabled="!teamAccessChanged || accessBusy" :busy="accessBusy" @click="saveTeamAccess") Save team access

  //- Export
  div(class="flex flex-col gap-3 border-t border-gray-100 pt-4")
    ui-overline Export
    div(class="flex items-center justify-between")
      div(class="flex flex-col gap-0.5")
        span(class="text-sm font-medium text-gray-700") Export configuration
        span(class="text-xs text-gray-400") Download this router's targets, features, and interceptors as JSON
      ui-button(:variant="Variant.Gray" :busy="exporting" @click="exportRouter") Export JSON

  //- Danger
  div(class="flex flex-col gap-3 border-t border-gray-100 pt-4")
    ui-overline Danger Zone
    div(class="flex items-center justify-between")
      div(class="flex flex-col gap-0.5")
        span(class="text-sm font-medium text-gray-700") Delete router
        span(class="text-xs text-gray-400") Permanently removes this router and all its configuration
      domain-ui-confirm-delete-modal(
        :name="routerName"
        description="This will also delete all targets, features, interceptors and their configuration."
        @confirm="onDelete"
      )
        template(#trigger="{ open }")
          ui-button(:variant="Variant.Red" @click="open") Delete
</template>

<script lang="ts">
import {
  HyperstrateApi,
  type HyperstrateServerInternalModulesAuthApplicationTeamResponse as TeamResponse,
  type HyperstrateServerInternalModulesRouterDomainRouterTeamAccess as RouterTeamAccess,
} from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Mixins } from '@/util/mixin'
import { Variant } from '@/features/ui/clickables/model'
import { AsyncData } from '@/util/async-data.decorator'
import { formatCurrency, formatNumber, formatPercent } from '@/util/format'
import { Component } from 'vue-facing-decorator'
import { NumberProp, StringProp } from '@/util/prop-decorators'
import type { Option } from '@/features/ui/inputs/model'

type Emits = {
  deleted: []
  (e: string): void
}

@Component({ emits: ['deleted'] })
export default class RouterSettingsControl extends Mixins(ApiClientsMixin) {
  public Variant = Variant

  @StringProp(true)
  public readonly routerId!: string

  @StringProp(true)
  public readonly routerName!: string

  @StringProp('')
  public readonly initialWebhookUrl!: string

  @NumberProp(0)
  public readonly budgetMaxCostUsd!: number

  declare public $emit: Emits

  public webhookUrl: string = ''
  public savedWebhookUrl: string = ''
  public alertPercent: number = 80
  public saveBusy = false
  public readonly formatCurrency = formatCurrency
  public readonly formatNumber = formatNumber
  public readonly formatPercent = formatPercent

  public budgetStatus?: { periodKey: string; requests: number; estimatedCostUsd: number } = undefined
  public teamAccess: RouterTeamAccess[] = []
  public selectedTeams: Option<TeamResponse>[] = []
  public accessBusy = false

  public get hasBudgetCostLimit(): boolean {
    return this.budgetMaxCostUsd > 0
  }

  public get costPct(): number {
    if (!this.budgetStatus || !this.budgetMaxCostUsd) return 0
    return (this.budgetStatus.estimatedCostUsd / this.budgetMaxCostUsd) * 100
  }

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  @AsyncData()
  public async asyncData(): Promise<AsyncData<RouterSettingsControl>> {
    const [budgetResult, accessResult] = await Promise.all([
      this.api.routerIdBudgetGet({ id: this.routerId }).catch(() => undefined),
      this.api.routerIdAccessGet({ id: this.routerId }).catch(() => undefined),
    ])
    const teamAccess = accessResult?.data ?? []
    return {
      webhookUrl: this.initialWebhookUrl,
      savedWebhookUrl: this.initialWebhookUrl,
      budgetStatus: budgetResult?.data as typeof this.budgetStatus,
      teamAccess,
      selectedTeams: teamAccess.map((row) => ({ label: row.teamId ?? '', value: { id: row.teamId ?? '', name: row.teamId ?? '' } }) as Option<TeamResponse>),
    }
  }

  public get webhookChanged(): boolean {
    return this.webhookUrl !== this.savedWebhookUrl
  }

  public async saveWebhook(): Promise<void> {
    if (this.saveBusy) return
    this.saveBusy = true
    try {
      await this.api.routerIdPatch({
        id: this.routerId,
        body: { webhookUrl: this.webhookUrl || '' },
      })
      this.savedWebhookUrl = this.webhookUrl
    } finally {
      this.saveBusy = false
    }
  }

  public get teamAccessChanged(): boolean {
    const before = [...new Set(this.teamAccess.map((row) => row.teamId).filter(Boolean))].sort().join(',')
    const after = [...new Set(this.selectedTeams.map((team) => team.value.id).filter(Boolean))].sort().join(',')
    return before !== after
  }

  public async saveTeamAccess(): Promise<void> {
    if (this.accessBusy) return
    this.accessBusy = true
    try {
      const before = new Set(this.teamAccess.map((row) => row.teamId).filter((id): id is string => Boolean(id)))
      const after = new Set(this.selectedTeams.map((team) => team.value.id).filter((id): id is string => Boolean(id)))
      await Promise.all([
        ...[...after].filter((id) => !before.has(id)).map((teamId) => this.api.routerIdAccessPost({ id: this.routerId, body: { teamId } })),
        ...[...before].filter((id) => !after.has(id)).map((teamId) => this.api.routerIdAccessTeamIdDelete({ id: this.routerId, teamId })),
      ])
      const { data } = await this.api.routerIdAccessGet({ id: this.routerId })
      this.teamAccess = data
      this.selectedTeams = data.map((row) => ({ label: row.teamId ?? '', value: { id: row.teamId ?? '', name: row.teamId ?? '' } }) as Option<TeamResponse>)
    } finally {
      this.accessBusy = false
    }
  }

  public exporting = false

  public async exportRouter(): Promise<void> {
    if (this.exporting) return
    this.exporting = true
    try {
      const { data } = await this.api.routerIdExportGet({ id: this.routerId })
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = (data.router?.name || 'router') + '-export.json'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      this.exporting = false
    }
  }

  public async onDelete(): Promise<void> {
    await this.api.routerIdDelete({ id: this.routerId })
    this.$emit('deleted')
  }
}
</script>
