<template lang="pug">
div(class="flex flex-col h-full overflow-hidden")
  //- Header bar with date range
  div(class="flex items-center gap-3 px-4 py-3 border-b border-gray-200 shrink-0")
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

  //- Empty state
  div(v-if="!loading && !variants.length" class="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center")
    div(class="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center")
      ui-icon(icon="bar-chart" :size="22" class="text-indigo-400")
    div(class="flex flex-col gap-1")
      p(class="text-sm font-semibold text-gray-700") No A/B data yet
      p(class="text-xs text-gray-400 max-w-xs")
        | Add an
        strong(class="font-medium text-gray-600") A/B Test
        |
        | interceptor in the pipeline configuration, then send requests to see variant results here.
    ui-button(:variant="Variant.Gray" :size="Size.SM" @click="$emit('go-to-interceptors')")
      ui-icon(icon="arrow-left" :size="14")
      | Go to Interceptors

  //- Content
  div(v-else-if="!loading" class="flex-1 overflow-y-auto")
    div(class="px-5 py-5 flex flex-col gap-5")
      div(v-for="(group, gIdx) in variantGroups" :key="gIdx" class="border border-gray-200 bg-white")
        div(class="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3")
          div(class="flex flex-col gap-0.5")
            span(class="text-sm font-semibold text-gray-800") {{ variantGroups.length > 1 ? `A/B test ${gIdx + 1}` : 'A/B test' }}
            span(v-if="group.partitionKey" class="text-xs text-gray-400")
              | Sticky by
              span(class="font-mono text-gray-600 ml-1") {{ group.partitionKey }}
          span(class="text-xs text-gray-400 font-numeric tabular-nums") {{ formatNum(groupRequests(group)) }} requests

        div(class="px-4 py-4 border-b border-gray-100 flex flex-col gap-2")
          ui-stacked-bar(:segments="trafficSegments(group)" :height="12" :rounded="false" track-class="bg-gray-100" :duration-ms="520" :stagger-ms="65")
          div(class="flex flex-wrap gap-x-4 gap-y-1")
            div(v-for="(v, i) in group.variants" :key="v.variant" class="flex items-center gap-1.5")
              span(class="w-2 h-2" :class="variantBarBg(i)")
              span(class="text-xs font-medium text-gray-700") {{ v.variant }}
              span(class="text-xs font-numeric tabular-nums text-gray-400") {{ trafficShare(v, group.variants) }}%

        div(class="overflow-x-auto")
          table(class="w-full min-w-[760px] text-left")
            thead(class="bg-gray-50 border-b border-gray-100")
              tr
                th(class="px-4 py-2 text-xs font-medium text-gray-400") Variant
                th(class="px-4 py-2 text-xs font-medium text-gray-400") Model
                th(class="px-4 py-2 text-xs font-medium text-gray-400 text-right") Share
                th(class="px-4 py-2 text-xs font-medium text-gray-400 text-right") Requests
                th(class="px-4 py-2 text-xs font-medium text-gray-400 text-right") Error
                th(class="px-4 py-2 text-xs font-medium text-gray-400 text-right") Latency
                th(class="px-4 py-2 text-xs font-medium text-gray-400 text-right") Tokens
                th(class="px-4 py-2 text-xs font-medium text-gray-400 text-right") Cost
            tbody
              tr(v-for="(v, i) in group.variants" :key="v.variant" class="border-b border-gray-100 last:border-b-0")
                td(class="px-4 py-3")
                  div(class="flex items-center gap-2 min-w-0")
                    span(class="w-6 h-6 flex items-center justify-center text-xs font-semibold text-white shrink-0" :class="variantBarBg(i)") {{ variantLetter(i) }}
                    span(class="text-sm font-medium text-gray-800 truncate") {{ v.variant }}
                td(class="px-4 py-3")
                  div(v-if="variantModelInfo(v.variant)" class="flex flex-col min-w-0")
                    span(class="text-xs text-gray-700 truncate") {{ variantModelInfo(v.variant)?.alias || variantModelInfo(v.variant)?.displayName }}
                    span(v-if="variantModelInfo(v.variant)?.modelDefinitionKey" class="text-xs text-gray-400 font-mono truncate") {{ variantModelInfo(v.variant)?.modelDefinitionKey }}
                  span(v-else class="text-xs text-gray-400") No model assigned
                td(class="px-4 py-3 text-right text-xs font-numeric tabular-nums text-gray-600") {{ trafficShare(v, group.variants) }}%
                td(class="px-4 py-3 text-right text-xs font-numeric tabular-nums text-gray-700") {{ formatNum(v.requests ?? 0) }}
                td(class="px-4 py-3 text-right text-xs font-numeric tabular-nums" :class="errorRateClass(v)") {{ formatPercent(errorRate(v)) }}
                td(class="px-4 py-3 text-right text-xs font-numeric tabular-nums" :class="latencyClass(v, group.variants)") {{ v.avgLatencyMs !== undefined ? Math.round(v.avgLatencyMs) + 'ms' : '—' }}
                td(class="px-4 py-3 text-right text-xs font-numeric tabular-nums text-gray-600") {{ formatNum(v.totalTokens ?? 0) }}
                td(class="px-4 py-3 text-right text-xs font-numeric tabular-nums" :class="costClass(v, group.variants)") {{ formatCost(v.costUsd ?? 0) }}
</template>

<script lang="ts">
import {
  HyperstrateApi,
  HyperstrateServerInternalModulesObservabilityDomainABVariantStats,
  HyperstrateServerInternalModulesRouterApplicationRouterInterceptorResponse,
  HyperstrateServerInternalModulesRouterDomainRouterInterceptorType,
  InternalModulesRouterInterfacesHttpRouterTargetResponse,
} from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { AsyncData } from '@/util/async-data.decorator'
import { ArrayProp, StringProp } from '@/util/prop-decorators'
import { Mixins } from '@/util/mixin'
import { Size, Variant } from '@/features/ui/clickables/model'
import { formatCompactNumber, formatCurrency, formatPercent } from '@/util/format'
import { Component, Watch } from 'vue-facing-decorator'
import type { StackedBarSegment } from '@/features/ui/stacked-bar/StackedBar.global.vue'

type ABVariantStats = HyperstrateServerInternalModulesObservabilityDomainABVariantStats
type RouterTarget = InternalModulesRouterInterfacesHttpRouterTargetResponse
const InterceptorType = HyperstrateServerInternalModulesRouterDomainRouterInterceptorType
type VariantModelInfo = { id: string; alias?: string; displayName?: string; modelDefinitionKey?: string }

interface VariantGroup {
  variants: ABVariantStats[]
  partitionKey?: string
}

const VARIANT_COLORS = [
  { headerBg: 'bg-indigo-50/60', badgeBg: 'bg-indigo-50 border-indigo-100', badgeText: 'text-indigo-500', bar: 'bg-indigo-400' },
  { headerBg: 'bg-violet-50/60', badgeBg: 'bg-violet-50 border-violet-100', badgeText: 'text-violet-500', bar: 'bg-violet-400' },
  { headerBg: 'bg-sky-50/60', badgeBg: 'bg-sky-50 border-sky-100', badgeText: 'text-sky-500', bar: 'bg-sky-400' },
  { headerBg: 'bg-amber-50/60', badgeBg: 'bg-amber-50 border-amber-100', badgeText: 'text-amber-500', bar: 'bg-amber-400' },
]

const toISODate = (d: Date): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

type RouterABTabEmits = { (e: 'go-to-interceptors'): void; (e: string): void }

@Component
export default class RouterABTab extends Mixins(ApiClientsMixin, LoadingMixin) {
  @StringProp(true)
  public readonly routerId!: string

  @ArrayProp(() => [])
  public readonly interceptors!: HyperstrateServerInternalModulesRouterApplicationRouterInterceptorResponse[]

  @ArrayProp(() => [])
  public readonly targets!: RouterTarget[]

  public Variant = Variant
  public Size = Size
  public readonly formatCost = (v: number): string => formatCurrency(v, 5)
  public readonly formatNum = formatCompactNumber
  public readonly formatPercent = formatPercent

  public variants: ABVariantStats[] = []
  public from = toISODate(new Date(Date.now() - 7 * 86_400_000))
  public to = toISODate(new Date())

  declare public $emit: RouterABTabEmits

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  // Group variants by the AB test interceptor they belong to, preserving partition key context.
  public get variantGroups(): VariantGroup[] {
    const abInterceptors = this.interceptors.filter((ic) => ic.type === InterceptorType.InterceptorABTest)
    if (!abInterceptors.length) {
      return this.variants.length ? [{ variants: this.variants }] : []
    }
    const groups: VariantGroup[] = []
    for (const ic of abInterceptors) {
      const declaredVariants = (ic.config?.['variants'] as Array<{ name: string }> | undefined) ?? []
      const names = new Set(declaredVariants.map((v) => v.name))
      const matched = this.variants.filter((v) => v.variant && names.has(v.variant))
      if (matched.length) {
        groups.push({
          variants: matched,
          partitionKey: ic.config?.['partition_key'] as string | undefined,
        })
      }
    }
    // Fallback: unmatched variants shown as a single ungrouped set
    const matched = new Set(groups.flatMap((g) => g.variants.map((v) => v.variant)))
    const unmatched = this.variants.filter((v) => !matched.has(v.variant))
    if (unmatched.length) groups.push({ variants: unmatched })
    return groups
  }

  public variantLetter(i: number): string {
    return String.fromCharCode(65 + i)
  }

  public variantModelInfo(variantName: string | undefined): VariantModelInfo | undefined {
    if (!variantName) return undefined
    for (const ic of this.interceptors) {
      const variants = ic.config?.['variants'] as Array<{ name: string; model_id: string }> | undefined
      if (!variants) continue
      const v = variants.find((v) => v.name === variantName)
      if (v?.model_id) {
        const target = this.targets.find((target) => target.modelId === v.model_id)
        return {
          id: v.model_id,
          alias: target?.model?.alias,
          displayName: target?.model?.displayName ?? v.model_id,
          modelDefinitionKey: target?.model?.modelDefKey,
        }
      }
    }
    return undefined
  }

  public variantHeaderBg(i: number): string {
    return VARIANT_COLORS[i % VARIANT_COLORS.length].headerBg
  }
  public variantBadgeBg(i: number): string {
    return VARIANT_COLORS[i % VARIANT_COLORS.length].badgeBg
  }
  public variantBadgeText(i: number): string {
    return VARIANT_COLORS[i % VARIANT_COLORS.length].badgeText
  }
  public variantBarBg(i: number): string {
    return VARIANT_COLORS[i % VARIANT_COLORS.length].bar
  }

  public groupRequests(group: VariantGroup): number {
    return group.variants.reduce((sum, v) => sum + (v.requests ?? 0), 0)
  }

  public trafficSegments(group: VariantGroup): StackedBarSegment[] {
    return group.variants.map((v, i) => ({
      value: v.requests ?? 0,
      colorClass: this.variantBarBg(i),
      label: v.variant ?? this.variantLetter(i),
    }))
  }

  public errorRate(v: ABVariantStats): number {
    if (!v.requests) return 0
    return ((v.errorCount ?? 0) / v.requests) * 100
  }

  public errorRateClass(v: ABVariantStats): string {
    return this.errorRate(v) > 5 ? 'text-red-600 font-semibold' : 'text-gray-600'
  }

  public latencyClass(v: ABVariantStats, group: ABVariantStats[]): string {
    const latencies = group.map((x) => x.avgLatencyMs).filter((x): x is number => x !== undefined)
    if (!latencies.length || v.avgLatencyMs === undefined) return 'text-gray-600'
    return v.avgLatencyMs === Math.min(...latencies) ? 'text-emerald-600 font-semibold' : 'text-gray-600'
  }

  public costClass(v: ABVariantStats, group: ABVariantStats[]): string {
    const costs = group.map((x) => x.costUsd ?? 0)
    if (!costs.length || !v.costUsd) return 'text-gray-600'
    return v.costUsd === Math.max(...costs) && v.costUsd > 0 ? 'text-amber-600 font-semibold' : 'text-gray-600'
  }

  public trafficShare(v: ABVariantStats, group: ABVariantStats[]): number {
    const total = group.reduce((s, x) => s + (x.requests ?? 0), 0)
    if (!total) return 0
    return Math.round(((v.requests ?? 0) / total) * 100)
  }

  @Watch('interceptors', { deep: true })
  public onInterceptorsChange(): void {
    void this.asyncData()
  }

  public reload(): void {
    void this.asyncData()
  }

  @AsyncData()
  public async asyncData(): Promise<AsyncData<RouterABTab>> {
    this.setLoading(true)
    try {
      const { data } = await this.api.analyticsAbTestGet({
        routerId: this.routerId,
        from: this.from,
        to: this.to,
      })
      return { variants: data.data ?? [] }
    } finally {
      this.setLoading(false)
    }
  }
}
</script>
