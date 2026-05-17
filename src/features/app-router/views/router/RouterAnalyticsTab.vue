<template lang="pug">
div(class="flex flex-col h-full overflow-hidden")
  //- Filter bar
  div(class="flex items-center gap-3 px-5 py-3 border-b border-gray-200 bg-white shrink-0")
    span(class="text-xs font-medium text-gray-500") Date range
    div(class="flex items-center gap-2")
      input(
        v-model="from"
        type="date"
        class="text-xs font-numeric tabular-nums border border-gray-200 rounded-md px-2.5 py-1.5 text-gray-700 bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400"
        @change="reload"
      )
      span(class="text-gray-300 text-xs") –
      input(
        v-model="to"
        type="date"
        class="text-xs font-numeric tabular-nums border border-gray-200 rounded-md px-2.5 py-1.5 text-gray-700 bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400"
        @change="reload"
      )
    div(v-if="loading" class="flex items-center gap-1.5 text-gray-400")
      ui-indicator
      span(class="text-xs") Loading…

  //- Content area
  div(class="flex-1 overflow-y-auto min-h-0")
    ui-empty-state(
      v-if="!loading && !stats"
      heading="No pipeline data yet"
      subheading="Send requests through this router to see feature and cost breakdowns here."
    )

    div(v-else-if="!loading && stats" class="p-6 flex flex-col gap-6")
      //- Overview metric cards
      div(class="grid grid-cols-2 lg:grid-cols-4 gap-4")
        div(v-for="metric in overviewMetrics" :key="metric.label" class="bg-white rounded-xl border border-gray-100 shadow-xs p-4 flex flex-col gap-2")
          div(class="flex items-center justify-between gap-2")
            ui-overline {{ metric.label }}
            ui-icon(:icon="metric.icon" :size="14" class="text-gray-300")
          span(class="text-2xl font-semibold font-numeric tabular-nums" :class="metric.valueClass") {{ metric.value }}

      //- Cache distribution
      section(class="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden")
        div(class="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3")
          div(class="flex items-center gap-2")
            ui-icon(icon="database" :size="15" class="text-gray-500")
            span(class="text-sm font-semibold text-gray-800") Cache distribution
          span(class="text-xs text-gray-400 font-numeric tabular-nums") {{ formatNumber(stats.cache.totalRequests) }} requests
        div(class="px-5 py-5 flex flex-col gap-4")
          ui-stacked-bar(:segments="cacheStackSegments" :height="10" :rounded="true" track-class="bg-gray-100" :duration-ms="500" :stagger-ms="60")
          div(class="grid grid-cols-3 gap-4")
            div(v-for="segment in cacheSegments" :key="segment.key" class="flex flex-col gap-1 min-w-0")
              div(class="flex items-center gap-1.5")
                span(class="w-2 h-2 rounded-full shrink-0" :class="segment.dotClass")
                span(class="text-xs text-gray-500 truncate") {{ segment.label }}
              div(class="flex items-baseline gap-1.5")
                span(class="text-xl font-semibold font-numeric tabular-nums text-gray-900") {{ formatNumber(segment.count) }}
                span(class="text-xs text-gray-400 font-numeric tabular-nums") {{ formatPercent(segment.pct) }}

      //- Pipeline features
      section(v-if="stats.features.length" class="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden")
        div(class="px-5 py-4 border-b border-gray-100 flex items-center justify-between")
          span(class="text-sm font-semibold text-gray-800") Pipeline features
          span(class="text-xs text-gray-400") {{ formatNumber(stats.analyzedLogs) }} traced requests
        div(v-for="feat in stats.features" :key="feat.kind + feat.name" class="px-5 py-4 border-b border-gray-100 last:border-b-0")
          div(class="grid grid-cols-[minmax(180px,1fr)_minmax(220px,1.1fr)_72px_minmax(220px,300px)] gap-4 items-center")
            div(class="flex items-center gap-2.5 min-w-0")
              div(class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-50")
                ui-icon(:icon="featureIcon(feat.kind)" :size="14" :class="featureIconColor(feat.kind)")
              div(class="min-w-0")
                span(class="block text-sm font-medium text-gray-800 truncate") {{ feat.name }}
                span(class="block text-xs text-gray-400 truncate") {{ feat.kind || 'feature' }}
            div(class="flex flex-col gap-1.5 min-w-0")
              ui-stacked-bar(
                :segments="outcomeSegments(feat)"
                :max="totalOutcomes(feat)"
                :height="8"
                :rounded="true"
                track-class="bg-gray-100"
                :duration-ms="500"
                :stagger-ms="55"
              )
              span(class="text-xs text-gray-400 truncate") {{ outcomeSummary(feat) }}
            span(class="text-xs text-right font-numeric tabular-nums text-gray-500") {{ formatNumber(totalOutcomes(feat)) }}
            div(class="flex items-center justify-end gap-1.5 min-w-0 overflow-hidden flex-wrap")
              ui-badge(v-if="feat.extraAttempts" :variant="Variant.Orange" :size="Size.SM") +{{ feat.extraAttempts }} calls
              ui-badge(v-for="[outcome, count] in topOutcomeEntries(feat)" :key="outcome" :variant="outcomeVariant(outcome)" :size="Size.SM")
                span(data-test="outcome-badge-content" class="type-badge-inline")
                  span {{ outcomeLabel(outcome) }}
                  span(data-test="outcome-badge-value" class="type-badge-number") {{ formatNumber(count) }}

      //- Interceptors
      section(v-if="stats.interceptors.length" class="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden")
        div(class="px-5 py-4 border-b border-gray-100 flex items-center justify-between")
          div(class="flex items-center gap-2")
            ui-icon(icon="shield" :size="15" class="text-gray-500")
            span(class="text-sm font-semibold text-gray-800") Interceptors
          span(class="text-xs text-gray-400") Pre-routing policy outcomes
        div(v-for="ic in stats.interceptors" :key="ic.kind + ic.name" class="px-5 py-4 border-b border-gray-100 last:border-b-0")
          div(class="grid grid-cols-[minmax(180px,1fr)_minmax(220px,1.1fr)_72px_minmax(220px,300px)] gap-4 items-center")
            div(class="flex items-center gap-2.5 min-w-0")
              div(class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-50")
                ui-icon(icon="shield" :size="14" class="text-gray-500")
              div(class="min-w-0")
                span(class="block text-sm font-medium text-gray-800 truncate") {{ ic.name }}
                span(class="block text-xs font-numeric tabular-nums" :class="blockedPct(ic) > 5 ? 'text-red-500' : 'text-gray-400'") {{ formatPercent(blockedPct(ic)) }} blocked
            div(class="flex flex-col gap-1.5 min-w-0")
              ui-stacked-bar(
                :segments="outcomeSegments(ic)"
                :max="totalOutcomes(ic)"
                :height="8"
                :rounded="true"
                track-class="bg-gray-100"
                :duration-ms="500"
                :stagger-ms="55"
              )
              span(class="text-xs text-gray-400 truncate") {{ outcomeSummary(ic) }}
            span(class="text-xs text-right font-numeric tabular-nums text-gray-500") {{ formatNumber(totalOutcomes(ic)) }}
            div(class="flex items-center justify-end gap-1.5 min-w-0 overflow-hidden flex-wrap")
              ui-badge(v-for="[outcome, count] in topOutcomeEntries(ic)" :key="outcome" :variant="outcomeVariant(outcome)" :size="Size.SM")
                span(data-test="outcome-badge-content" class="type-badge-inline")
                  span {{ outcomeLabel(outcome) }}
                  span(data-test="outcome-badge-value" class="type-badge-number") {{ formatNumber(count) }}
</template>

<script lang="ts">
import { HyperstrateApi, HyperstrateServerInternalModulesObservabilityDomainPipelineStepStat as ApiStepStat } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { AsyncData } from '@/util/async-data.decorator'
import { StringProp } from '@/util/prop-decorators'
import { Mixins } from '@/util/mixin'
import { formatCurrency, formatNumber, formatPercent } from '@/util/format'
import { Component, Watch } from 'vue-facing-decorator'
import { Size, Variant } from '@/features/ui/clickables/model'
import type { StackedBarSegment } from '@/features/ui/stacked-bar/StackedBar.global.vue'

// Strict local types normalized from the generated (all-optional) API types.
interface StrictCacheBreakdown {
  totalRequests: number
  exactHits: number
  semanticHits: number
  misses: number
  hitRatePct: number
  estSavedUsd: number
}

interface StrictStepStat {
  kind: string
  name: string
  outcomes: Record<string, number>
  extraAttempts: number
}

interface StrictStats {
  totalRequests: number
  analyzedLogs: number
  cache: StrictCacheBreakdown
  features: StrictStepStat[]
  interceptors: StrictStepStat[]
}

interface OverviewMetric {
  label: string
  value: string
  icon: string
  valueClass: string
}

interface CacheSegment {
  key: string
  label: string
  count: number
  pct: number
  dotClass: string
}

const toISODate = (d: Date): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function normalizeStep(s: ApiStepStat): StrictStepStat {
  const outcomes: Record<string, number> = {}
  for (const [k, v] of Object.entries(s.outcomes ?? {})) {
    outcomes[k] = v ?? 0
  }
  return {
    kind: s.kind ?? '',
    name: s.name ?? '',
    outcomes,
    extraAttempts: s.extraAttempts ?? 0,
  }
}

@Component
export default class RouterAnalyticsTab extends Mixins(ApiClientsMixin, LoadingMixin) {
  @StringProp(true)
  public readonly routerId!: string

  public stats: StrictStats | undefined = undefined
  public from = toISODate(new Date(Date.now() - 7 * 86_400_000))
  public to = toISODate(new Date())
  public readonly formatCurrency = formatCurrency
  public readonly formatNumber = formatNumber
  public readonly formatPercent = formatPercent
  public readonly Variant = Variant
  public readonly Size = Size

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  @Watch('routerId')
  public onRouterIdChange(): void {
    void this.asyncData()
  }

  public reload(): void {
    void this.asyncData()
  }

  public get overviewMetrics(): OverviewMetric[] {
    if (!this.stats) return []
    return [
      { label: 'Requests', value: this.formatNumber(this.stats.totalRequests), icon: 'activity', valueClass: 'text-gray-900' },
      {
        label: 'Cache hit rate',
        value: this.formatPercent(this.stats.cache.hitRatePct),
        icon: 'database',
        valueClass: this.stats.cache.hitRatePct > 20 ? 'text-emerald-600' : 'text-gray-900',
      },
      { label: 'Cost saved', value: this.formatCurrency(this.stats.cache.estSavedUsd), icon: 'dollar-bill', valueClass: 'text-emerald-600' },
      { label: 'Analyzed logs', value: this.formatNumber(this.stats.analyzedLogs), icon: 'clipboard-list', valueClass: 'text-gray-900' },
    ]
  }

  public get cacheSegments(): CacheSegment[] {
    if (!this.stats) return []
    const total = this.stats.cache.totalRequests
    return [
      { key: 'exact', label: 'Exact hits', count: this.stats.cache.exactHits, pct: this.pct(this.stats.cache.exactHits, total), dotClass: 'bg-indigo-500' },
      {
        key: 'semantic',
        label: 'Semantic hits',
        count: this.stats.cache.semanticHits,
        pct: this.pct(this.stats.cache.semanticHits, total),
        dotClass: 'bg-violet-500',
      },
      { key: 'miss', label: 'Misses', count: this.stats.cache.misses, pct: this.pct(this.stats.cache.misses, total), dotClass: 'bg-gray-300' },
    ]
  }

  public get cacheStackSegments(): StackedBarSegment[] {
    return this.cacheSegments.map((segment) => ({
      value: segment.count,
      colorClass: segment.dotClass,
      label: segment.label,
    }))
  }

  @AsyncData()
  public async asyncData(): Promise<AsyncData<RouterAnalyticsTab>> {
    this.setLoading(true)
    try {
      const { data } = await this.api.analyticsRoutersRouterIdPipelineStatsGet({
        routerId: this.routerId,
        from: this.from,
        to: this.to,
      })
      const c = data.cache
      const stats: StrictStats = {
        totalRequests: data.totalRequests ?? 0,
        analyzedLogs: data.analyzedLogs ?? 0,
        cache: {
          totalRequests: c?.totalRequests ?? 0,
          exactHits: c?.exactHits ?? 0,
          semanticHits: c?.semanticHits ?? 0,
          misses: c?.misses ?? 0,
          hitRatePct: c?.hitRatePct ?? 0,
          estSavedUsd: c?.estSavedUsd ?? 0,
        },
        features: (data.features ?? []).map(normalizeStep),
        interceptors: (data.interceptors ?? []).map(normalizeStep),
      }
      return { stats }
    } finally {
      this.setLoading(false)
    }
  }

  public pct(part: number, total: number): number {
    if (!total) return 0
    return Math.max(0, Math.min(100, (part / total) * 100))
  }

  public outcomeEntries(stat: StrictStepStat): [string, number][] {
    return Object.entries(stat.outcomes).sort((a, b) => b[1] - a[1])
  }

  public topOutcomeEntries(stat: StrictStepStat): [string, number][] {
    return this.outcomeEntries(stat).slice(0, 3)
  }

  public outcomeSegments(stat: StrictStepStat): StackedBarSegment[] {
    return this.outcomeEntries(stat).map(([outcome, count]) => ({
      value: count,
      colorClass: this.outcomeBarColor(outcome),
      label: this.outcomeLabel(outcome),
    }))
  }

  public outcomeSummary(stat: StrictStepStat): string {
    const entries = this.topOutcomeEntries(stat)
    if (!entries.length) return 'no outcomes'
    return entries.map(([outcome, count]) => `${this.outcomeLabel(outcome)} ${this.formatNumber(count)}`).join(' / ')
  }

  public outcomeLabel(outcome: string): string {
    const map: Record<string, string> = {
      hit_exact: 'exact hit',
      hit_semantic: 'semantic hit',
      schema_injected: 'schema injected',
      examples_injected: 'examples injected',
      target_selected: 'target selected',
      variant_selected: 'variant selected',
      overflow_routed: 'overflow routed',
      skipped: 'skipped',
      winner_found: 'winner found',
      invalid_json: 'invalid JSON',
      low_quality: 'low quality',
      retried_or_flagged: 'retried/flagged',
    }
    return map[outcome] ?? outcome.replaceAll('_', ' ')
  }

  public totalOutcomes(stat: StrictStepStat): number {
    return Object.values(stat.outcomes).reduce((s, v) => s + v, 0)
  }

  public blockedPct(stat: StrictStepStat): number {
    const total = this.totalOutcomes(stat)
    if (!total) return 0
    return ((stat.outcomes['blocked'] ?? 0) / total) * 100
  }

  public outcomeVariant(outcome: string): Variant {
    const map: Record<string, Variant> = {
      passed: Variant.Green,
      success: Variant.Green,
      applied: Variant.Green,
      streaming: Variant.Green,
      enabled: Variant.Green,
      recorded: Variant.Green,
      stored: Variant.Green,
      blocked: Variant.Red,
      error: Variant.Red,
      retry: Variant.Orange,
      routed: Variant.Orange,
      masked: Variant.Orange,
      flagged: Variant.Orange,
      overflow_routed: Variant.Orange,
      filtered: Variant.Orange,
      skipped: Variant.Gray,
      miss: Variant.Gray,
      hit_exact: Variant.Indigo,
      hit_semantic: Variant.Purple,
      schema_injected: Variant.Blue,
      examples_injected: Variant.Blue,
      target_selected: Variant.Blue,
    }
    return map[outcome] ?? Variant.Gray
  }

  public outcomeBarColor(outcome: string): string {
    const map: Record<string, string> = {
      passed: 'bg-emerald-400',
      success: 'bg-emerald-400',
      applied: 'bg-emerald-400',
      streaming: 'bg-emerald-400',
      enabled: 'bg-emerald-400',
      blocked: 'bg-red-400',
      error: 'bg-red-400',
      retry: 'bg-amber-400',
      routed: 'bg-amber-400',
      masked: 'bg-amber-400',
      flagged: 'bg-amber-400',
      overflow_routed: 'bg-amber-400',
      filtered: 'bg-orange-400',
      skipped: 'bg-slate-400',
      miss: 'bg-gray-300',
      hit_exact: 'bg-indigo-400',
      hit_semantic: 'bg-violet-400',
      target_selected: 'bg-blue-400',
      variant_selected: 'bg-blue-400',
      winner_found: 'bg-emerald-400',
      valid: 'bg-emerald-400',
      invalid_json: 'bg-red-400',
      low_quality: 'bg-red-400',
      retried_or_flagged: 'bg-amber-400',
    }
    return map[outcome] ?? 'bg-gray-200'
  }

  public featureIcon(kind: string): string {
    const map: Record<string, string> = {
      rate_limit: 'gauge',
      budget: 'dollar-bill',
      transform: 'filter-3d',
      health_check: 'activity',
      hedging: 'git-branch',
      mcp_tools: 'wrench',
      quality_gate: 'circle',
      structured_output: 'code',
      retry: 'refresh',
    }
    return map[kind] ?? 'zap'
  }

  public featureIconColor(kind: string): string {
    const map: Record<string, string> = {
      rate_limit: 'text-orange-500',
      budget: 'text-emerald-500',
      transform: 'text-sky-500',
      health_check: 'text-green-500',
      hedging: 'text-violet-500',
      mcp_tools: 'text-indigo-500',
      quality_gate: 'text-teal-500',
      structured_output: 'text-blue-500',
      retry: 'text-amber-500',
    }
    return map[kind] ?? 'text-gray-400'
  }
}
</script>
