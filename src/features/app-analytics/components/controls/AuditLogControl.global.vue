<template lang="pug">
section(class="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden flex flex-col max-h-[520px]")
  div(class="px-6 py-4 border-b border-gray-100 shrink-0")
    h2(class="text-sm font-semibold text-gray-700") Audit log
  div(class="flex-1 overflow-auto min-h-0")
    ui-table(:rows="rows" :columns="columns" :loading="loading" empty-message="No admin actions recorded yet" class="font-mono text-sm")
      template(#action="{ value }")
        ui-badge(:variant="actionVariant(value)") {{ value }}
      template(#resource="{ row }")
        span(class="font-mono text-xs text-gray-600") {{ row.resource }}
        span(v-if="row.resourceId" class="font-mono text-xs text-gray-400") &nbsp;{{ row.resourceId }}
      template(#time="{ value }")
        span(class="text-xs text-gray-400") {{ formatDate(value) }}
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
import { HyperstrateApi, HyperstrateServerInternalModulesObservabilityDomainAuditLog } from '@/__generated__/hyperstrate-api'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Variant } from '@/features/ui/clickables/model'
import { type Column } from '@/features/ui/table/model'
import { formatDate } from '@/util/format'

@Component
export default class AuditLogControl extends Mixins(ApiClientsMixin, LoadingMixin, PaginationMixin) {
  public readonly Variant = Variant
  public readonly formatDate = formatDate
  public allRows: HyperstrateServerInternalModulesObservabilityDomainAuditLog[] = []
  public totalItems = 0
  protected pageSize = 20

  protected get total(): number {
    return this.totalItems
  }

  public readonly columns: Column<HyperstrateServerInternalModulesObservabilityDomainAuditLog>[] = [
    { name: 'action', label: 'Action', accessor: (row) => row.action },
    { name: 'resource', label: 'Resource', accessor: (row) => row },
    { name: 'user', label: 'User', accessor: (row) => row.userEmail },
    { name: 'ip', label: 'IP', accessor: (row) => row.ipAddress ?? '—' },
    { name: 'time', label: 'Time', align: 'right', accessor: (row) => row.createdAt },
  ]

  public get rows(): HyperstrateServerInternalModulesObservabilityDomainAuditLog[] {
    const start = (this.page - 1) * this.perPage
    return this.allRows.slice(start, start + this.perPage)
  }

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  @Watch('page')
  public onPageChange(): void {
    void this.asyncData()
  }

  public onPerPageChange(value: number): void {
    this.pageSize = value
    this.page = 1
  }

  public actionVariant(action: string): Variant {
    if (action === 'delete' || action === 'revoke') return Variant.Red
    if (action === 'create') return Variant.Green
    return Variant.Gray
  }

  @AsyncData()
  public async asyncData(): Promise<AsyncData<AuditLogControl>> {
    this.setLoading(true)
    try {
      const { data } = await this.api.analyticsAuditGet({ limit: this.perPage, offset: (this.page - 1) * this.perPage })
      return { allRows: data.data ?? [], totalItems: data.total ?? 0 }
    } finally {
      this.setLoading(false)
    }
  }
}
</script>
