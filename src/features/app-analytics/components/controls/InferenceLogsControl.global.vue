<template lang="pug">
section(class="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden flex flex-col max-h-[520px]")
  div(class="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0")
    h2(class="text-sm font-semibold text-gray-700") Recent inference logs
    span(class="text-xs text-gray-400") Click 👍 / 👎 to rate response quality
  div(class="flex-1 overflow-auto min-h-0")
    ui-table(
      :rows="logRows"
      :columns="columns"
      :loading="loading"
      empty-message="No logs in this period"
      :row-classes="() => ['cursor-pointer']"
      @row-click="openDetail(rowAsLog($event.row))"
    )
      template(#status="{ value }")
        ui-badge(:variant="String(value) === 'error' ? Variant.Red : Variant.Green") {{ value }}
      template(#created-at="{ value }")
        span(class="text-xs text-gray-500 whitespace-nowrap") {{ formatDate(String(value)) }}
      template(#model="{ value }")
        span(class="text-xs font-mono text-gray-700") {{ value }}
      template(#source="{ value }")
        ui-pill(:variant="Variant.Gray") {{ value }}
      template(#latency-ms="{ value }")
        span(class="font-numeric tabular-nums text-xs text-gray-400") {{ value }}ms
      template(#cost-usd="{ value }")
        span(class="font-numeric tabular-nums text-xs text-gray-400") {{ formatCurrency(value) }}
      template(#feedback="{ row }")
        div(class="flex items-center gap-1")
          ui-tooltip(:content="rowAsLog(row).feedback === 1 ? 'Remove positive rating' : 'Mark as good'")
            ui-button(
              :variant="rowAsLog(row).feedback === 1 ? Variant.Green : Variant.Gray"
              :outlined="rowAsLog(row).feedback !== 1"
              :size="Size.SM"
              square
              :disabled="submittingIds.includes(rowAsLog(row).id)"
              @click.stop="submitFeedback(rowAsLog(row), rowAsLog(row).feedback === 1 ? 0 : 1)"
            ) 👍
          ui-tooltip(:content="rowAsLog(row).feedback === -1 ? 'Remove negative rating' : 'Mark as bad'")
            ui-button(
              :variant="rowAsLog(row).feedback === -1 ? Variant.Red : Variant.Gray"
              :outlined="rowAsLog(row).feedback !== -1"
              :size="Size.SM"
              square
              :disabled="submittingIds.includes(rowAsLog(row).id)"
              @click.stop="submitFeedback(rowAsLog(row), rowAsLog(row).feedback === -1 ? 0 : -1)"
            ) 👎
  div(v-if="meta && meta.pages > 1" class="px-6 py-3 border-t border-gray-100 shrink-0")
    ui-pagination(v-model="page" :pages="pages" :per-page="perPage" :total="total" @update:per-page="onPerPageChange")

app-analytics-inference-log-detail-drawer(:log="selectedLog" @close="selectedLog = undefined" @feedback="submitFeedback")
</template>

<script lang="ts">
import { Component, Watch } from 'vue-facing-decorator'
import { StringProp } from '@/util/prop-decorators'
import { Mixins } from '@/util/mixin'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import { PaginationMixin } from '@/features/core/components/mixins/pagination.mixin'
import { AsyncData } from '@/util/async-data.decorator'
import { HyperstrateApi, HyperstrateServerInternalSharedPaginationPaginatedMeta } from '@/__generated__/hyperstrate-api'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { type Column } from '@/features/ui/table/model'
import { Size, Variant } from '@/features/ui/clickables/model'
import { formatCurrency, formatDate } from '@/util/format'

type PaginatedMeta = HyperstrateServerInternalSharedPaginationPaginatedMeta

interface LogRow {
  id: string
  modelId: string
  modelDefKey: string
  source: string
  status: string
  latencyMs: number
  costUsd: number
  feedback: number
  createdAt: string
}

@Component
export default class InferenceLogsControl extends Mixins(ApiClientsMixin, LoadingMixin, PaginationMixin) {
  public readonly Size = Size
  public readonly Variant = Variant
  public readonly formatCurrency = formatCurrency
  public readonly formatDate = formatDate

  @StringProp(true)
  public readonly from!: string

  @StringProp(true)
  public readonly to!: string

  public logRows: LogRow[] = []
  public meta?: PaginatedMeta = undefined

  protected pageSize = 10

  protected get total(): number {
    return this.meta?.total ?? 0
  }

  public readonly columns: Column[] = [
    { name: 'status', label: 'Status', accessor: (row: unknown) => (row as LogRow).status },
    { name: 'createdAt', label: 'Time', accessor: (row: unknown) => (row as LogRow).createdAt },
    { name: 'model', label: 'Model', accessor: (row: unknown) => (row as LogRow).modelDefKey || (row as LogRow).modelId },
    { name: 'source', label: 'Source', accessor: (row: unknown) => (row as LogRow).source },
    { name: 'latencyMs', label: 'Latency', align: 'right', accessor: (row: unknown) => (row as LogRow).latencyMs },
    { name: 'costUsd', label: 'Cost', align: 'right', accessor: (row: unknown) => (row as LogRow).costUsd },
    { name: 'feedback', label: '', accessor: (row: unknown) => (row as LogRow).feedback },
  ]

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  public rowAsLog(row: unknown): LogRow {
    return row as LogRow
  }

  @Watch('from')
  @Watch('to')
  public onFiltersChange(): void {
    this.page = 1
    void this.asyncData()
  }

  @Watch('page')
  protected async onPageChange(): Promise<void> {
    await this.asyncData()
  }

  public onPerPageChange(value: number): void {
    this.pageSize = value
    this.page = 1
    void this.asyncData()
  }

  public selectedLog?: LogRow = undefined
  public submittingIds: string[] = []

  public openDetail(log: LogRow): void {
    this.selectedLog = log
  }

  public async submitFeedback(log: LogRow, feedback: number): Promise<void> {
    if (this.submittingIds.includes(log.id)) return
    const prev = log.feedback
    log.feedback = feedback
    this.submittingIds.push(log.id)
    try {
      await this.api.analyticsInferenceLogsIdFeedbackPatch({ id: log.id, body: { feedback } })
    } catch {
      log.feedback = prev
    } finally {
      this.submittingIds = this.submittingIds.filter((id) => id !== log.id)
    }
  }

  @AsyncData()
  public async asyncData(): Promise<AsyncData<InferenceLogsControl>> {
    this.setLoading(true)
    try {
      const { data } = await this.api.analyticsInferenceLogsGet({
        from: this.from,
        to: this.to,
        page: this.page,
        perPage: this.perPage,
      })
      return { logRows: (data.items ?? []) as LogRow[], meta: data.meta }
    } finally {
      this.setLoading(false)
    }
  }
}
</script>
