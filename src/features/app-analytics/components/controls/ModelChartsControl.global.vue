<template lang="pug">
div(class="flex flex-col gap-6")
  div(class="grid grid-cols-1 md:grid-cols-2 gap-6")
    section(class="bg-white rounded-xl border border-gray-100 shadow-xs p-6 flex flex-col gap-4")
      h2(class="text-sm font-semibold text-gray-700") Top models by requests
      div(v-if="loading" v-loading="true" class="h-[220px]")
      p(v-else-if="!modelsByRequests.length" class="text-sm text-gray-400 text-center py-12") No data for this period
      app-analytics-bar-chart(v-else :data="modelsByRequests" :height="220" color="#6366f1" :format-y="formatNum")
    section(class="bg-white rounded-xl border border-gray-100 shadow-xs p-6 flex flex-col gap-4")
      h2(class="text-sm font-semibold text-gray-700") Top models by cost (USD)
      div(v-if="loading" v-loading="true" class="h-[220px]")
      p(v-else-if="!modelsByCost.length" class="text-sm text-gray-400 text-center py-12") No data for this period
      app-analytics-bar-chart(v-else :data="modelsByCost" :height="220" color="#10b981" :format-y="formatCostBar")
  section(v-if="modelsByTokens.length > 0" class="bg-white rounded-xl border border-gray-100 shadow-xs p-6 flex flex-col gap-4")
    h2(class="text-sm font-semibold text-gray-700") Top models by tokens
    app-analytics-bar-chart(:data="modelsByTokens" :height="180" color="#8b5cf6" :format-y="formatNum")
</template>

<script lang="ts">
import { Component, Watch } from 'vue-facing-decorator'
import { StringProp } from '@/util/prop-decorators'
import { Mixins } from '@/util/mixin'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import { AsyncData } from '@/util/async-data.decorator'
import { HyperstrateApi } from '@/__generated__/hyperstrate-api'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { formatCompactNumber, formatCurrency } from '@/util/format'
import { type BarChartItem } from '../charts/BarChart.global.vue'

interface ModelRow {
  modelId: string
  modelDefKey: string
  requests: number
  costUsd: number
  totalTokens?: number
}

@Component
export default class ModelChartsControl extends Mixins(ApiClientsMixin, LoadingMixin) {
  @StringProp(true)
  public readonly from!: string

  @StringProp(true)
  public readonly to!: string

  public modelRows: ModelRow[] = []

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  @Watch('from')
  @Watch('to')
  public onFiltersChange(): void {
    void this.asyncData()
  }

  public get modelsByRequests(): BarChartItem[] {
    return this.modelRows.slice(0, 10).map((m) => ({ label: m.modelDefKey?.split('/')[1] ?? m.modelId, value: m.requests }))
  }

  public get modelsByCost(): BarChartItem[] {
    return [...this.modelRows]
      .sort((a, b) => b.costUsd - a.costUsd)
      .slice(0, 10)
      .map((m) => ({ label: m.modelDefKey?.split('/')[1] ?? m.modelId, value: m.costUsd }))
  }

  public get modelsByTokens(): BarChartItem[] {
    const withTokens = this.modelRows.filter((m) => (m.totalTokens ?? 0) > 0)
    if (!withTokens.length) return []
    return [...withTokens]
      .sort((a, b) => (b.totalTokens ?? 0) - (a.totalTokens ?? 0))
      .slice(0, 10)
      .map((m) => ({ label: m.modelDefKey?.split('/')[1] ?? m.modelId, value: m.totalTokens ?? 0 }))
  }

  public readonly formatNum = formatCompactNumber
  public readonly formatCostBar = (v: number): string => formatCurrency(v, 2)

  @AsyncData()
  public async asyncData(): Promise<AsyncData<ModelChartsControl>> {
    this.setLoading(true)
    try {
      const { data } = await this.api.analyticsModelsGet({ from: this.from, to: this.to })
      return { modelRows: (data.data ?? []) as ModelRow[] }
    } finally {
      this.setLoading(false)
    }
  }
}
</script>
