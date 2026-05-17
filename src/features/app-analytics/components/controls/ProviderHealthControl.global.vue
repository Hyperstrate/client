<template lang="pug">
section(class="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden")
  div(class="px-6 py-4 border-b border-gray-100 flex items-center justify-between")
    h2(class="text-sm font-semibold text-gray-700") Provider health
    ui-button(:busy="loading" :variant="Variant.Gray" @click="refresh") Refresh
  ui-table(:rows="rows" :columns="columns" :loading="loading" empty-message="No models configured")
    template(#status="{ row }")
      div(class="flex items-center gap-2")
        span(class="w-2 h-2 rounded-full shrink-0" :class="row.isHealthy ? 'bg-green-500' : 'bg-red-500'")
        span(class="text-xs" :class="row.isHealthy ? 'text-green-700' : 'text-red-600'")
          | {{ row.isHealthy ? 'healthy' : 'down' }}
    template(#latency="{ value }")
      span(class="font-numeric tabular-nums text-xs") {{ value ? `${value}ms` : '—' }}
    template(#checked="{ value }")
      span(class="text-xs text-gray-400") {{ value ? formatDate(value) : '—' }}
    template(#error="{ row }")
      span(v-if="row.errorMessage" class="text-xs text-red-500 font-mono") {{ row.errorMessage }}
      span(v-else class="text-xs text-gray-300") —
</template>

<script lang="ts">
import { Component } from 'vue-facing-decorator'
import { Mixins } from '@/util/mixin'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import { AsyncData } from '@/util/async-data.decorator'
import { HyperstrateApi, HyperstrateServerInternalModulesObservabilityDomainProviderHealth } from '@/__generated__/hyperstrate-api'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Variant } from '@/features/ui/clickables/model'
import { type Column } from '@/features/ui/table/model'
import { formatDate } from '@/util/format'

@Component
export default class ProviderHealthControl extends Mixins(ApiClientsMixin, LoadingMixin) {
  public readonly Variant = Variant
  public readonly formatDate = formatDate
  public rows: HyperstrateServerInternalModulesObservabilityDomainProviderHealth[] = []

  public readonly columns: Column<HyperstrateServerInternalModulesObservabilityDomainProviderHealth>[] = [
    { name: 'status', label: 'Status', accessor: (row) => row },
    { name: 'model', label: 'Model', accessor: (row) => row.modelDefKey },
    { name: 'provider', label: 'Provider', accessor: (row) => row.provider },
    { name: 'latency', label: 'Latency', align: 'right', accessor: (row) => row.latencyMs },
    { name: 'checked', label: 'Last check', align: 'right', accessor: (row) => row.checkedAt },
    { name: 'error', label: 'Error', accessor: (row) => row },
  ]

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  public async refresh(): Promise<void> {
    await this.asyncData()
  }

  @AsyncData()
  public async asyncData(): Promise<AsyncData<ProviderHealthControl>> {
    this.setLoading(true)
    try {
      const { data } = await this.api.healthProvidersGet()
      return { rows: data.data ?? [] }
    } finally {
      this.setLoading(false)
    }
  }
}
</script>
