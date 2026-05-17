<template lang="pug">
div(class="rounded-xl border bg-white shadow-xs" :class="panelClass")
  div(class="flex items-center justify-between gap-3 px-3 py-2.5 border-b" :class="headerClass")
    div(class="flex items-center gap-2 min-w-0")
      span(class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" :class="iconClass")
        ui-icon(:icon="statusIcon" :size="14")
      div(class="min-w-0")
        p(class="text-sm font-semibold text-zinc-900") Compatibility
        p(class="text-xs text-zinc-500 truncate") {{ summary }}
    ui-icon-button(icon="refresh" :variant="Variant.Gray" :size="Size.SM" :icon-size="12" :disabled="loading" @click="load")
  div(v-if="loading" class="px-3 py-3 text-xs text-zinc-400") Checking router…
  div(v-else-if="issues.length === 0" class="px-3 py-3 text-xs text-emerald-700 bg-emerald-50/50")
    | No blocking combinations found.
  div(v-else class="max-h-64 overflow-y-auto divide-y divide-zinc-100")
    div(v-for="(issue, index) in issues" :key="`${issue.code ?? 'issue'}-${index}`" class="px-3 py-2.5 flex gap-2")
      span(class="mt-0.5 h-2 w-2 shrink-0 rounded-full" :class="severityDot(issue.severity)")
      div(class="min-w-0 flex-1")
        div(class="flex items-center gap-2")
          span(class="text-xs font-semibold text-zinc-800 truncate") {{ issueTitle(issue.code) }}
          span(class="text-[10px] uppercase tracking-wide" :class="severityText(issue.severity)") {{ issue.severity }}
        p(class="mt-0.5 text-xs leading-4 text-zinc-500") {{ issue.message }}
</template>

<script lang="ts">
import { HyperstrateApi, type HyperstrateServerInternalModulesRouterApplicationRouterLintIssue as LintIssue } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Size, Variant } from '@/features/ui/clickables/model'
import { Mixins } from '@/util/mixin'
import { NumberProp, RequiredProp } from '@/util/prop-decorators'
import { Component, Watch } from 'vue-facing-decorator'

@Component
export default class RouterLintPanel extends Mixins(ApiClientsMixin) {
  public readonly Size = Size
  public readonly Variant = Variant
  public loading = false
  public issues: LintIssue[] = []

  @RequiredProp()
  public readonly routerId!: string

  @NumberProp(0)
  public readonly refreshKey!: number

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  public mounted(): void {
    void this.load()
  }

  @Watch('refreshKey')
  public onRefreshKeyChange(): void {
    void this.load()
  }

  public async load(): Promise<void> {
    if (!this.routerId) return
    this.loading = true
    try {
      const { data } = await this.api.routerIdLintGet({ id: this.routerId })
      this.issues = data.issues ?? []
    } finally {
      this.loading = false
    }
  }

  public get errorCount(): number {
    return this.issues.filter((issue) => issue.severity === 'error').length
  }

  public get warningCount(): number {
    return this.issues.filter((issue) => issue.severity === 'warning').length
  }

  public get summary(): string {
    if (this.loading) return 'Scanning feature combinations'
    if (this.errorCount) return `${this.errorCount} blocking issue${this.errorCount === 1 ? '' : 's'}`
    if (this.warningCount) return `${this.warningCount} warning${this.warningCount === 1 ? '' : 's'}`
    if (this.issues.length) return `${this.issues.length} notice${this.issues.length === 1 ? '' : 's'}`
    return 'Router looks compatible'
  }

  public get statusIcon(): string {
    if (this.errorCount || this.warningCount) return 'circle-alert'
    return 'check'
  }

  public get panelClass(): string {
    if (this.errorCount) return 'border-red-200'
    if (this.warningCount) return 'border-amber-200'
    return 'border-emerald-200'
  }

  public get headerClass(): string {
    if (this.errorCount) return 'border-red-100 bg-red-50/50'
    if (this.warningCount) return 'border-amber-100 bg-amber-50/50'
    return 'border-emerald-100 bg-emerald-50/50'
  }

  public get iconClass(): string {
    if (this.errorCount) return 'bg-red-100 text-red-600'
    if (this.warningCount) return 'bg-amber-100 text-amber-600'
    return 'bg-emerald-100 text-emerald-600'
  }

  public severityDot(severity?: string): string {
    if (severity === 'error') return 'bg-red-500'
    if (severity === 'warning') return 'bg-amber-400'
    return 'bg-sky-400'
  }

  public severityText(severity?: string): string {
    if (severity === 'error') return 'text-red-600'
    if (severity === 'warning') return 'text-amber-600'
    return 'text-sky-600'
  }

  public issueTitle(code?: string): string {
    return (code ?? 'notice')
      .split('_')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }
}
</script>
