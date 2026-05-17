<template lang="pug">
div(class="flex flex-col h-full gap-4 p-4")
  //- Filters bar
  div(class="flex items-center gap-2 shrink-0 flex-wrap")
    ui-button-group(:model-value="statusFilter" :options="statusOptions" @update:model-value="setStatusFilter")
    div(class="flex-1")
    input(
      v-model="from"
      type="date"
      class="text-xs font-numeric tabular-nums border border-gray-200 rounded px-2 py-1 text-gray-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
      @change="reload"
    )
    span(class="text-gray-300 text-xs") –
    input(
      v-model="to"
      type="date"
      class="text-xs font-numeric tabular-nums border border-gray-200 rounded px-2 py-1 text-gray-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
      @change="reload"
    )

  ui-divider

  //- Table
  div(class="flex-1 overflow-auto min-h-0")
    ui-empty-state(v-if="!loading && !items.length" heading="No requests yet" subheading="Requests routed through this router will appear here.")
    ui-table(
      v-else
      :rows="items"
      :columns="columns"
      :loading="loading"
      :is-row-expanded="isItemExpanded"
      :is-row-highlighted="isItemExpanded"
      :row-classes="rowClassesFn"
      @row-click="onRowClick"
    )
      template(#time="{ row }")
        span(class="text-gray-400 whitespace-nowrap text-xs") {{ formatDate(asLog(row).createdAt) }}
      template(#status="{ row }")
        ui-badge(:variant="asLog(row).status === 'error' ? Variant.Red : Variant.Green" :size="Size.SM") {{ asLog(row).status || '—' }}
      template(#model="{ row }")
        div(class="flex flex-col gap-0 min-w-0")
          span(class="text-gray-800 text-xs font-medium truncate") {{ modelDisplayName(asLog(row)) }}
          span(v-if="asLog(row).model?.provider" class="text-xs text-gray-400 font-mono truncate") {{ asLog(row).model?.provider }}
      template(#ab="{ row }")
        ui-badge(v-if="asLog(row).abVariant" :variant="Variant.Indigo" :size="Size.SM") {{ asLog(row).abVariant }}
        span(v-else class="text-gray-300") —
      template(#latency="{ row }")
        span(class="font-numeric tabular-nums text-gray-600 text-xs") {{ asLog(row).latencyMs != undefined ? asLog(row).latencyMs + 'ms' : '—' }}
      template(#tokens="{ row }")
        span(class="font-numeric tabular-nums text-gray-600 text-xs") {{ asLog(row).totalTokens != undefined ? formatNum(asLog(row).totalTokens ?? 0) : '—' }}
      template(#cost="{ row }")
        span(class="font-numeric tabular-nums text-gray-600 text-xs") {{ asLog(row).costUsd != undefined ? formatCurrency(asLog(row).costUsd, 5) : '—' }}
      template(#expand="{ expanded }")
        div(
          class="flex items-center justify-center w-6 h-6 rounded-md transition-all duration-150"
          :class="expanded ? 'bg-indigo-100 text-indigo-500' : 'text-gray-300 hover:text-gray-500'"
        )
          ui-icon(:icon="expanded ? 'chevron-up' : 'chevron-down'" :size="11")
      template(#[expandedRowSlot]="{ row }")
        div(class="bg-zinc-50/70 px-3 py-3")
          div(class="rounded-lg border border-zinc-200 bg-white shadow-xs ring-1 ring-zinc-950/5 overflow-hidden")
            div(class="flex flex-col gap-5 px-5 py-5")
              //- Flame graph + detailed trace
              domain-ui-pipeline-flame(:item="asLog(row)")
              domain-ui-pipeline-trace(:item="asLog(row)" class="py-2 test")

              //- Metadata
              div(class="flex flex-wrap gap-x-8 gap-y-4")
                div(v-if="asLog(row).model" class="flex flex-col gap-0.5 min-w-[130px]")
                  ui-overline(compact) Model
                  span(class="text-sm font-semibold text-gray-800 leading-tight") {{ asLog(row).model?.alias || asLog(row).model?.displayName }}
                  span(v-if="asLog(row).model?.alias" class="text-xs text-gray-500 leading-tight") {{ asLog(row).model?.displayName || asLog(row).model?.modelDefKey || asLog(row).model?.id || '—' }}
                  span(v-if="asLog(row).model?.provider" class="text-xs text-gray-400 font-mono") {{ asLog(row).model?.provider }}

                div(v-if="asLog(row).ttftMs" class="flex flex-col gap-0.5 min-w-[60px]")
                  ui-overline(compact) TTFT
                  span(class="text-sm font-numeric font-semibold text-gray-800 tabular-nums") {{ asLog(row).ttftMs }}ms

                div(class="flex flex-col gap-0.5 min-w-[80px]")
                  ui-overline(compact) Tokens
                  div(class="flex items-baseline gap-1 font-numeric tabular-nums")
                    span(class="text-sm font-semibold text-gray-800") {{ asLog(row).inputTokens ?? '—' }}
                    span(class="text-xs text-gray-400") in
                    span(class="text-gray-300 text-xs") /
                    span(class="text-sm font-semibold text-gray-800") {{ asLog(row).outputTokens ?? '—' }}
                    span(class="text-xs text-gray-400") out

                div(v-if="asLog(row).router" class="flex flex-col gap-0.5")
                  ui-overline(compact) Router
                  span(class="text-xs text-gray-700") {{ asLog(row).router?.name || asLog(row).router?.id }}

                div(v-if="asLog(row).source" class="flex flex-col gap-0.5")
                  ui-overline(compact) Source
                  span(class="text-xs font-mono bg-zinc-50 border border-gray-200 px-2 py-0.5 rounded text-gray-600 w-fit") {{ asLog(row).source }}

                div(v-if="asLog(row).selectedTargetId" class="flex flex-col gap-0.5")
                  ui-overline(compact) Target
                  span(class="text-xs font-mono bg-zinc-50 border border-gray-200 px-2 py-0.5 rounded text-gray-500 w-fit") {{ asLog(row).selectedTargetId }}

              //- Error banner
              div(v-if="asLog(row).errorMessage" class="flex flex-col gap-1 bg-red-50 border border-red-200 rounded-lg px-4 py-3")
                span(class="text-xs font-semibold uppercase tracking-wide text-red-500") Error
                span(class="text-xs text-red-700") {{ asLog(row).errorMessage }}

              //- Request ID footer
              div(class="flex items-center justify-between gap-3 pt-1 border-t border-zinc-100")
                span(class="text-xs text-gray-300 font-mono select-all") {{ asLog(row).id }}
                ui-clickable(
                  tag="button"
                  type="button"
                  class="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
                  @click.stop="openDetail(asLog(row))"
                ) View full log

  //- Pagination
  div(v-if="meta && meta.pages > 1" class="px-4 py-2 border-t border-gray-100 shrink-0")
    ui-pagination(v-model="page" :pages="pages" :per-page="perPage" :total="total" @update:per-page="onPerPageChange")

  app-analytics-inference-log-detail-drawer(:log="selectedLog" @close="selectedLog = undefined" @feedback="submitFeedback")
</template>

<script lang="ts">
import {
  HyperstrateApi,
  InternalModulesObservabilityInterfacesHttpInferenceLogResponse,
  HyperstrateServerInternalSharedPaginationPaginatedMeta,
} from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import { PaginationMixin } from '@/features/core/components/mixins/pagination.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { AsyncData } from '@/util/async-data.decorator'
import { formatCompactNumber, formatCurrency, formatDate as formatShortDate } from '@/util/format'
import { Mixins } from '@/util/mixin'
import { Size, Variant } from '@/features/ui/clickables/model'
import { type Option } from '@/features/ui/inputs/model'
import { type Column } from '@/features/ui/table/model'
import { Component, Watch } from 'vue-facing-decorator'
import { StringProp } from '@/util/prop-decorators'

type InferenceLog = InternalModulesObservabilityInterfacesHttpInferenceLogResponse
type PaginatedMeta = HyperstrateServerInternalSharedPaginationPaginatedMeta

const toISODate = (d: Date): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

@Component
export default class RouterLogsTab extends Mixins(ApiClientsMixin, LoadingMixin, PaginationMixin) {
  @StringProp(true)
  public readonly routerId!: string

  public items: InferenceLog[] = []
  public meta?: PaginatedMeta
  public expandedId?: string = undefined
  public selectedLog?: InferenceLog = undefined
  public submittingIds: string[] = []
  public statusFilter: Option<string> = { value: '', label: 'All' }
  public from = toISODate(new Date(Date.now() - 7 * 86_400_000))
  public to = toISODate(new Date())

  public Variant = Variant
  public Size = Size
  public readonly formatCurrency = formatCurrency
  public readonly formatNum = formatCompactNumber
  public readonly formatDate = (iso: string | undefined): string =>
    formatShortDate(iso, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }) || '—'

  public readonly columns: Column[] = [
    { name: 'time', label: 'Time' },
    { name: 'status', label: 'Status' },
    { name: 'model', label: 'Model' },
    { name: 'ab', label: 'A/B' },
    { name: 'latency', label: 'Latency', align: 'right' },
    { name: 'tokens', label: 'Tokens', align: 'right' },
    { name: 'cost', label: 'Cost', align: 'right' },
    { name: 'expand', label: '', width: 40 },
  ]

  protected pageSize = 30
  protected get total(): number {
    return this.meta?.total ?? 0
  }

  public readonly statusOptions = [
    { value: '', label: 'All' },
    { value: 'success', label: 'Success' },
    { value: 'error', label: 'Error' },
  ]
  public readonly expandedRowSlot = 'row.expanded'

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  @Watch('page')
  protected async onPageChange(): Promise<void> {
    await this.asyncData()
  }

  public setStatusFilter(val: Option<string>): void {
    this.statusFilter = val
    this.page = 1
    void this.asyncData()
  }

  public reload(): void {
    this.page = 1
    void this.asyncData()
  }

  public asLog(row: unknown): InferenceLog {
    return row as InferenceLog
  }

  public rowClassesFn(_row: unknown): string[] {
    return ['cursor-pointer']
  }

  public isItemExpanded(row: unknown): boolean {
    return (row as InferenceLog).id === this.expandedId
  }

  public onRowClick({ row }: { row: unknown }): void {
    this.toggleExpand((row as InferenceLog).id)
  }

  public toggleExpand(id: string | undefined): void {
    if (!id) return
    this.expandedId = this.expandedId === id ? undefined : id
  }

  public openDetail(log: InferenceLog): void {
    this.selectedLog = log
  }

  public async submitFeedback(log: InferenceLog, feedback: number): Promise<void> {
    if (!log.id || this.submittingIds.includes(log.id)) return
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
  public async asyncData(): Promise<AsyncData<RouterLogsTab>> {
    this.setLoading(true)
    try {
      const { data } = await this.api.analyticsInferenceLogsGet({
        routerId: this.routerId,
        status: this.statusFilter.value || undefined,
        from: this.from,
        to: this.to,
        page: this.page,
        perPage: this.perPage,
      })
      return { items: data.items ?? [], meta: data.meta }
    } finally {
      this.setLoading(false)
    }
  }

  public onPerPageChange(value: number): void {
    this.pageSize = value
    this.page = 1
    void this.asyncData()
  }

  public modelDisplayName(item: InferenceLog): string {
    if (item.model) return item.model.displayName || item.model.modelDefKey || item.model.id || '—'
    return ((item as Record<string, unknown>)['modelDefKey'] as string) || ((item as Record<string, unknown>)['modelId'] as string) || '—'
  }
}
</script>
