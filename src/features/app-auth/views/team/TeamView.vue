<template lang="pug">
ui-layout(use="core-default-layout")
  div(class="h-full flex flex-col")
    div(class="max-w-screen-lg w-full mx-auto px-4 pt-8 pb-4 shrink-0")
      div(class="flex items-center gap-3 mb-6")
        ui-clickable(
          tag="button"
          class="flex items-center justify-center w-7 h-7 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
          @click="$router.push({ name: 'AppAuth', query: { tab: 'teams' } })"
        )
          ui-icon(icon="arrow-left" :size="20")
        div(class="flex flex-col gap-0.5 min-w-0")
          div(v-if="team" class="flex items-center gap-2 min-w-0")
            h1(class="text-xl font-semibold text-gray-900 truncate") {{ team.name }}
            ui-badge(:variant="statusVariant" :dot="true" :size="Size.SM") {{ statusLabel }}
          div(v-else class="h-7 w-48 bg-gray-100 rounded animate-pulse")

    div(class="flex-1 overflow-y-auto min-h-0")
      div(class="max-w-screen-lg mx-auto px-4 pb-8 flex flex-col gap-6")
        div(v-if="loading" v-loading="true" class="py-20")

        template(v-else-if="team")
          div(class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4")
            ui-card(class="flex flex-col gap-1")
              ui-overline Max Requests
              p(class="text-2xl font-numeric font-semibold text-gray-900 tabular-nums") {{ maxRequestsLabel }}
            ui-card(class="flex flex-col gap-1")
              ui-overline Max Cost
              p(class="text-2xl font-numeric font-semibold text-gray-900 tabular-nums") {{ maxCostLabel }}
            ui-card(class="flex flex-col gap-1")
              ui-overline API Keys
              p(class="text-2xl font-numeric font-semibold text-gray-900 tabular-nums") {{ apiKeys.length }}
            ui-card(class="flex flex-col gap-1")
              ui-overline Description
              p(class="text-sm text-gray-500 truncate") {{ team.description || '—' }}

          ui-card(class="flex flex-col gap-4")
            div(class="flex items-center justify-between gap-3")
              h2(class="text-sm font-semibold text-gray-700") API Keys
              ui-badge(:variant="Variant.Gray" :size="Size.SM")
                span(class="type-badge-number") {{ apiKeys.length }}
            ui-empty-state(v-if="apiKeys.length === 0" heading="No API keys in this team" subheading="API keys assigned to this team will appear here.")
            ui-table(v-else :rows="apiKeys" :columns="apiKeyColumns" empty-message="No API keys in this team")
              template(#name="{ row }")
                div(class="flex items-center gap-2 min-w-0")
                  span(class="text-sm font-medium text-gray-900 truncate") {{ asApiKey(row).name || 'Untitled key' }}
                  ui-badge(:variant="asApiKey(row).isEnabled ? Variant.Green : Variant.Gray" :dot="true" :size="Size.SM")
                    | {{ asApiKey(row).isEnabled ? 'Enabled' : 'Disabled' }}
              template(#scope="{ value }")
                span(class="text-xs text-gray-500") {{ value || '—' }}
              template(#router="{ value }")
                span(class="font-mono text-xs text-gray-500") {{ value || '—' }}
              template(#expires="{ value }")
                span(class="text-xs text-gray-500 whitespace-nowrap") {{ value ? formatDate(String(value)) : 'Never' }}
              template(#id="{ value }")
                span(class="font-mono text-xs text-gray-400") {{ shortId(String(value || '')) }}

        ui-empty-state(v-else heading="Team not found" subheading="The team may have been deleted or you may not have access.")
</template>

<script lang="ts">
import {
  HyperstrateApi,
  HyperstrateServerInternalModulesAuthApplicationTeamResponse,
  InternalModulesAuthInterfacesHttpAPIKeyResponse,
} from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Size, Variant } from '@/features/ui/clickables/model'
import { type Column } from '@/features/ui/table/model'
import { AsyncData } from '@/util/async-data.decorator'
import { formatCurrency, formatDate as formatShortDate, formatNumber } from '@/util/format'
import { Mixins } from '@/util/mixin'
import { Component } from 'vue-facing-decorator'

type TeamResponse = HyperstrateServerInternalModulesAuthApplicationTeamResponse
type APIKeyResponse = InternalModulesAuthInterfacesHttpAPIKeyResponse

@Component
export default class TeamView extends Mixins(ApiClientsMixin, LoadingMixin) {
  public Variant = Variant
  public Size = Size
  public readonly formatDate = (d: string | Date | undefined): string => formatShortDate(d, { year: 'numeric', month: 'numeric', day: 'numeric' })

  public team?: TeamResponse = undefined
  public apiKeys: APIKeyResponse[] = []

  public readonly apiKeyColumns: Column<APIKeyResponse>[] = [
    { name: 'name', label: 'Name', accessor: (row) => row.name },
    { name: 'scope', label: 'Scope', accessor: (row) => row.scope },
    { name: 'router', label: 'Router', accessor: (row) => row.routerId },
    { name: 'expires', label: 'Expires', accessor: (row) => row.expiresAt },
    { name: 'id', label: 'ID', accessor: (row) => row.id },
  ]

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  private get teamId(): string {
    return this.$route.params.id as string
  }

  public get statusVariant(): Variant {
    return this.team?.isEnabled ? Variant.Green : Variant.Gray
  }

  public get statusLabel(): string {
    return this.team?.isEnabled ? 'Enabled' : 'Disabled'
  }

  public get maxRequestsLabel(): string {
    return this.team?.maxRequests ? formatNumber(this.team.maxRequests) : '∞'
  }

  public get maxCostLabel(): string {
    return this.team?.maxCostUsd ? formatCurrency(this.team.maxCostUsd) : '∞'
  }

  public shortId(id: string): string {
    return id ? `${id.slice(0, 8)}...` : '—'
  }

  public asApiKey(row: unknown): APIKeyResponse {
    return row as APIKeyResponse
  }

  @AsyncData()
  public async asyncData(): Promise<AsyncData<TeamView>> {
    this.setLoading(true)
    try {
      const [teamRes, keysRes] = await Promise.allSettled([
        this.api.authTeamsGet({ ids: [this.teamId] }),
        this.api.authApiKeysGet({ teamId: this.teamId, perPage: 100 }),
      ])

      const team = teamRes.status === 'fulfilled' ? (teamRes.value.data.items ?? [])[0] : undefined
      const apiKeys = keysRes.status === 'fulfilled' ? (keysRes.value.data.items ?? []) : []

      return { team, apiKeys }
    } finally {
      this.setLoading(false)
    }
  }
}
</script>
