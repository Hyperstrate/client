<template lang="pug">
div(class="flex flex-col gap-6")
  div(class="grid grid-cols-2 md:grid-cols-4 gap-4")
    div(class="bg-white rounded-xl border border-gray-100 shadow-xs p-4 flex flex-col gap-3")
      div(class="flex flex-col gap-1")
        ui-overline Total Requests
        p(class="text-2xl font-numeric font-bold text-gray-900 tabular-nums") {{ formatNum(displayTotals.requests) }}
      div(v-if="loading" class="h-14")
      app-analytics-line-chart(v-else :data="requestsOverTime" :height="56" color="#6366f1" :format-y="formatNum" :sparkline="true")
    div(class="bg-white rounded-xl border border-gray-100 shadow-xs p-4 flex flex-col gap-3")
      div(class="flex flex-col gap-1")
        ui-overline Total Tokens
        p(class="text-2xl font-numeric font-bold text-gray-900 tabular-nums") {{ formatNum(displayTotals.tokens) }}
      div(v-if="loading" class="h-14")
      app-analytics-line-chart(v-else :data="tokensOverTime" :height="56" color="#8b5cf6" :format-y="formatNum" :sparkline="true")
    div(class="bg-white rounded-xl border border-gray-100 shadow-xs p-4 flex flex-col gap-3")
      div(class="flex flex-col gap-1")
        ui-overline Total Cost
        p(class="text-2xl font-numeric font-bold text-emerald-600 tabular-nums") {{ formatCost(displayTotals.cost) }}
      div(v-if="loading" class="h-14")
      app-analytics-line-chart(v-else :data="costOverTime" :height="56" color="#10b981" :format-y="formatCost" :sparkline="true")
    div(class="bg-white rounded-xl border border-gray-100 shadow-xs p-4 flex flex-col gap-3")
      div(class="flex flex-col gap-1")
        ui-overline Error Rate
        p(class="text-2xl font-numeric font-bold tabular-nums" :class="displayTotals.errorRate > 1 ? 'text-red-500' : 'text-gray-900'") {{ formatErrorRate(displayTotals.errorRate) }}
      div(v-if="loading" class="h-14")
      app-analytics-line-chart(
        v-else
        :data="errorsOverTime"
        :height="56"
        :color="totals.errorRate > 1 ? '#ef4444' : '#94a3b8'"
        :format-y="formatErrorRate"
        :sparkline="true"
      )

  section(class="bg-white rounded-xl border border-gray-100 shadow-xs p-6 flex flex-col gap-4")
    h2(class="text-sm font-semibold text-gray-700") Requests over time
    div(v-if="loading" v-loading="true" class="h-[220px]")
    p(v-else-if="!requestsOverTime.length" class="text-sm text-gray-400 text-center py-12") No data for this period
    app-analytics-line-chart(v-else :data="requestsOverTime" :height="220" color="#6366f1" :format-y="formatNum")

  section(class="bg-white rounded-xl border border-gray-100 shadow-xs p-6 flex flex-col gap-4")
    h2(class="text-sm font-semibold text-gray-700") Cost (USD) over time
    div(v-if="loading" v-loading="true" class="h-[220px]")
    p(v-else-if="!costOverTime.length" class="text-sm text-gray-400 text-center py-12") No data for this period
    app-analytics-line-chart(v-else :data="costOverTime" :height="220" color="#10b981" :format-y="formatCost")

  section(class="bg-white rounded-xl border border-gray-100 shadow-xs p-6 flex flex-col gap-4")
    h2(class="text-sm font-semibold text-gray-700") Errors over time
    div(v-if="loading" v-loading="true" class="h-[180px]")
    p(v-else-if="!errorsOverTime.length" class="text-sm text-gray-400 text-center py-10") No data for this period
    app-analytics-line-chart(v-else :data="errorsOverTime" :height="180" color="#ef4444" :format-y="formatNum")
</template>

<script lang="ts">
import { Component, Watch } from 'vue-facing-decorator'
import { StringProp } from '@/util/prop-decorators'
import { Mixins } from '@/util/mixin'
import { countUp } from '@/util/count-up'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import { AsyncData } from '@/util/async-data.decorator'
import { HyperstrateApi } from '@/__generated__/hyperstrate-api'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { formatCompactNumber, formatCurrency, formatPercent } from '@/util/format'
import { type Granularity } from '../../model'
import { type LineChartPoint } from '../charts/LineChart.global.vue'

interface UsageRow {
  bucket: string
  requests: number
  inputTokens: number
  outputTokens: number
  costUsd: number
  errorCount: number
}

@Component
export default class OverviewControl extends Mixins(ApiClientsMixin, LoadingMixin) {
  @StringProp(true)
  public readonly from!: string

  @StringProp(true)
  public readonly to!: string

  @StringProp(true)
  public readonly granularity!: string

  public usageRows: UsageRow[] = []
  public displayTotals = { requests: 0, tokens: 0, cost: 0, errorRate: 0 }

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  @Watch('from')
  @Watch('to')
  @Watch('granularity')
  public onFiltersChange(): void {
    void this.asyncData()
  }

  public get requestsOverTime(): LineChartPoint[] {
    return this.usageRows.map((r) => ({ bucket: r.bucket, value: r.requests ?? 0 }))
  }

  public get costOverTime(): LineChartPoint[] {
    return this.usageRows.map((r) => ({ bucket: r.bucket, value: r.costUsd ?? 0 }))
  }

  public get errorsOverTime(): LineChartPoint[] {
    return this.usageRows.map((r) => ({ bucket: r.bucket, value: r.errorCount ?? 0 }))
  }

  public get tokensOverTime(): LineChartPoint[] {
    return this.usageRows.map((r) => ({ bucket: r.bucket, value: (r.inputTokens ?? 0) + (r.outputTokens ?? 0) }))
  }

  public get totals(): { requests: number; tokens: number; cost: number; errorRate: number } {
    const requests = this.usageRows.reduce((s, r) => s + (r.requests ?? 0), 0)
    const tokens = this.usageRows.reduce((s, r) => s + ((r.inputTokens ?? 0) + (r.outputTokens ?? 0)), 0)
    const cost = this.usageRows.reduce((s, r) => s + (r.costUsd ?? 0), 0)
    const errors = this.usageRows.reduce((s, r) => s + (r.errorCount ?? 0), 0)
    return { requests, tokens, cost, errorRate: requests > 0 ? (errors / requests) * 100 : 0 }
  }

  @Watch('totals', { deep: true })
  public onTotalsChange(): void {
    countUp(this.totals.requests, 700, (v) => {
      this.displayTotals.requests = v
    })
    countUp(this.totals.tokens, 700, (v) => {
      this.displayTotals.tokens = v
    })
    countUp(this.totals.cost, 700, (v) => {
      this.displayTotals.cost = v
    })
    countUp(this.totals.errorRate, 700, (v) => {
      this.displayTotals.errorRate = v
    })
  }

  public readonly formatNum = formatCompactNumber
  public readonly formatCost = (v: number): string => formatCurrency(v, 3)
  public readonly formatErrorRate = formatPercent

  @AsyncData()
  public async asyncData(): Promise<AsyncData<OverviewControl>> {
    this.setLoading(true)
    try {
      const { data } = await this.api.analyticsUsageGet({ from: this.from, to: this.to, granularity: this.granularity })
      return { usageRows: (data.data ?? []) as UsageRow[] }
    } finally {
      this.setLoading(false)
    }
  }
}
</script>
