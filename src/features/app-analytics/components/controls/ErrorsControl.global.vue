<template lang="pug">
section(class="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden flex flex-col max-h-[520px]")
  div(class="px-6 py-4 border-b border-gray-100 shrink-0")
    h2(class="text-sm font-semibold text-gray-700") Recent errors
  div(class="flex-1 overflow-auto min-h-0")
    ui-table(:rows="pagedRows" :columns="columns" :loading="loading" empty-message="No errors in this period")
      template(#created-at="{ value }")
        span(class="text-gray-400 text-xs whitespace-nowrap") {{ formatDate(String(value)) }}
      template(#model="{ value }")
        span(class="text-gray-700 font-mono text-xs") {{ value }}
      template(#source="{ value }")
        ui-pill(:variant="Variant.Gray") {{ value }}
      template(#error-message="{ value }")
        span(class="text-red-600 text-xs max-w-xs truncate") {{ value }}
  div(v-if="pages > 1" class="px-6 py-3 border-t border-gray-100 shrink-0")
    ui-pagination(v-model="page" :pages="pages" :per-page="perPage" :total="total" @update:per-page="onPerPageChange")
</template>

<script lang="ts">
import { Component, Watch } from 'vue-facing-decorator'
import { Mixins } from '@/util/mixin'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import { PaginationMixin } from '@/features/core/components/mixins/pagination.mixin'
import { AsyncData } from '@/util/async-data.decorator'
import { HyperstrateApi } from '@/__generated__/hyperstrate-api'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { type Column } from '@/features/ui/table/model'
import { Variant } from '@/features/ui/clickables/model'
import { formatDate } from '@/util/format'

interface ErrorRow {
  id: string
  modelId: string
  modelDefKey: string
  source: string
  errorMessage: string
  createdAt: string
}

@Component
export default class ErrorsControl extends Mixins(ApiClientsMixin, LoadingMixin, PaginationMixin) {
  public readonly Variant = Variant
  public readonly formatDate = formatDate

  public allRows: ErrorRow[] = []

  protected pageSize = 10

  protected get total(): number {
    return this.allRows.length
  }

  public get pagedRows(): ErrorRow[] {
    const start = (this.page - 1) * this.perPage
    return this.allRows.slice(start, start + this.perPage)
  }

  public readonly columns: Column[] = [
    { name: 'createdAt', label: 'Time' },
    {
      name: 'model',
      label: 'Model',
      accessor: (row: unknown) => {
        const r = row as ErrorRow
        return r.modelDefKey || r.modelId
      },
    },
    { name: 'source', label: 'Source' },
    { name: 'errorMessage', label: 'Error' },
  ]

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  @Watch('page')
  protected onPageChange(): void {
    // client-side pagination — no reload needed
  }

  public onPerPageChange(value: number): void {
    this.pageSize = value
    this.page = 1
  }

  @AsyncData()
  public async asyncData(): Promise<AsyncData<ErrorsControl>> {
    this.setLoading(true)
    try {
      const { data } = await this.api.analyticsErrorsGet({ limit: 100 })
      return { allRows: (data.data ?? []) as ErrorRow[] }
    } finally {
      this.setLoading(false)
    }
  }
}
</script>
