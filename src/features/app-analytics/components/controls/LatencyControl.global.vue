<template lang="pug">
section(class="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden flex flex-col max-h-[520px]")
  div(class="px-6 py-4 border-b border-gray-100 shrink-0")
    h2(class="text-sm font-semibold text-gray-700") Latency percentiles by model
  div(class="flex-1 overflow-auto min-h-0")
    ui-table(:rows="pagedRows" :columns="columns" :loading="loading" empty-message="No latency data for this period")
      template(#model="{ value }")
        span(class="font-mono text-gray-700 text-xs") {{ value }}
      template(#p50="{ value }")
        span(class="font-numeric tabular-nums") {{ value }}ms
      template(#p95="{ value }")
        span(class="font-numeric tabular-nums" :class="Number(value) > 2000 ? 'text-amber-600' : ''") {{ value }}ms
      template(#p99="{ value }")
        span(class="font-numeric tabular-nums" :class="Number(value) > 5000 ? 'text-red-500' : ''") {{ value }}ms
      template(#avg="{ value }")
        span(class="font-numeric tabular-nums text-gray-500") {{ formatLatency(value) }}
  div(v-if="pages > 1" class="px-6 py-3 border-t border-gray-100 shrink-0")
    ui-pagination(v-model="page" :pages="pages" :per-page="perPage" :total="total" @update:per-page="onPerPageChange")
</template>

<script lang="ts">
import { Component, Watch } from 'vue-facing-decorator'
import { StringProp } from '@/util/prop-decorators'
import { Mixins } from '@/util/mixin'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import { PaginationMixin } from '@/features/core/components/mixins/pagination.mixin'
import { AsyncData } from '@/util/async-data.decorator'
import { HyperstrateApi } from '@/__generated__/hyperstrate-api'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { type Column } from '@/features/ui/table/model'
import { formatDurationMs } from '@/util/format'

interface LatencyRow {
  modelDefKey: string
  provider: string
  count: number
  avgMs: number
  p50Ms: number
  p95Ms: number
  p99Ms: number
}

@Component
export default class LatencyControl extends Mixins(ApiClientsMixin, LoadingMixin, PaginationMixin) {
  @StringProp(true)
  public readonly from!: string

  @StringProp(true)
  public readonly to!: string

  public allRows: LatencyRow[] = []
  public readonly formatLatency = (value: number | string): string => formatDurationMs(Math.round(Number(value ?? 0)))

  protected pageSize = 10

  protected get total(): number {
    return this.allRows.length
  }

  public get pagedRows(): LatencyRow[] {
    const start = (this.page - 1) * this.perPage
    return this.allRows.slice(start, start + this.perPage)
  }

  public readonly columns: Column[] = [
    { name: 'model', label: 'Model', accessor: (row: unknown) => (row as LatencyRow).modelDefKey },
    { name: 'p50', label: 'p50', align: 'right', accessor: (row: unknown) => (row as LatencyRow).p50Ms },
    { name: 'p95', label: 'p95', align: 'right', accessor: (row: unknown) => (row as LatencyRow).p95Ms },
    { name: 'p99', label: 'p99', align: 'right', accessor: (row: unknown) => (row as LatencyRow).p99Ms },
    { name: 'avg', label: 'Avg', align: 'right', accessor: (row: unknown) => (row as LatencyRow).avgMs },
    { name: 'count', label: 'Samples', align: 'right', accessor: (row: unknown) => (row as LatencyRow).count },
  ]

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  @Watch('from')
  @Watch('to')
  public onFiltersChange(): void {
    this.page = 1
    void this.asyncData()
  }

  public onPerPageChange(value: number): void {
    this.pageSize = value
    this.page = 1
  }

  @AsyncData()
  public async asyncData(): Promise<AsyncData<LatencyControl>> {
    this.setLoading(true)
    try {
      const { data } = await this.api.analyticsLatencyGet({ from: this.from, to: this.to })
      return { allRows: (data.data ?? []) as LatencyRow[] }
    } finally {
      this.setLoading(false)
    }
  }
}
</script>
