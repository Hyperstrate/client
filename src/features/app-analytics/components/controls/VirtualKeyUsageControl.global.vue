<template lang="pug">
section(class="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden")
  div(class="px-6 py-4 border-b border-gray-100")
    h2(class="text-sm font-semibold text-gray-700") Usage by virtual key
  ui-table(:rows="rows" :columns="columns" :loading="loading" empty-message="No virtual key usage for this period")
    template(#requests="{ value }")
      span(class="font-numeric tabular-nums") {{ formatNumber(value) }}
    template(#tokens="{ value }")
      span(class="font-numeric tabular-nums") {{ formatNumber(value) }}
    template(#cost="{ value }")
      span(class="font-numeric tabular-nums" :class="Number(value) > 0 ? 'text-emerald-600' : 'text-gray-400'")
        | {{ Number(value) > 0 ? formatCurrency(value) : '—' }}
    template(#errors="{ value }")
      span(class="font-numeric tabular-nums" :class="Number(value) > 0 ? 'text-red-500' : 'text-gray-400'") {{ value }}
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
import { type Column } from '@/features/ui/table/model'
import { formatCurrency, formatNumber } from '@/util/format'

interface VKRow {
  virtualKeyId: string
  requests: number
  totalTokens: number
  costUsd: number
  errorCount: number
}

@Component
export default class VirtualKeyUsageControl extends Mixins(ApiClientsMixin, LoadingMixin) {
  @StringProp(true)
  public readonly from!: string

  @StringProp(true)
  public readonly to!: string

  public rows: VKRow[] = []
  public readonly formatCurrency = formatCurrency
  public readonly formatNumber = formatNumber

  public readonly columns: Column[] = [
    { name: 'key', label: 'Virtual key', accessor: (row) => (row as VKRow).virtualKeyId },
    { name: 'requests', label: 'Requests', align: 'right', accessor: (row) => (row as VKRow).requests },
    { name: 'tokens', label: 'Tokens', align: 'right', accessor: (row) => (row as VKRow).totalTokens },
    { name: 'cost', label: 'Cost', align: 'right', accessor: (row) => (row as VKRow).costUsd },
    { name: 'errors', label: 'Errors', align: 'right', accessor: (row) => (row as VKRow).errorCount },
  ]

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  @Watch('from')
  @Watch('to')
  public onFiltersChange(): void {
    void this.asyncData()
  }

  @AsyncData()
  public async asyncData(): Promise<AsyncData<VirtualKeyUsageControl>> {
    this.setLoading(true)
    try {
      const { data } = await this.api.analyticsVirtualKeysGet({ from: this.from, to: this.to })
      return { rows: (data.data ?? []) as VKRow[] }
    } finally {
      this.setLoading(false)
    }
  }
}
</script>
