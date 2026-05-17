<template lang="pug">
div(class="p-4 flex flex-col gap-4 h-full")
  div(class="flex items-center justify-between gap-3 shrink-0")
    div(class="flex flex-col gap-0.5")
      span(class="text-sm font-semibold text-gray-800") Webhook deliveries
      span(class="text-xs text-gray-400") Recent attempts to POST events to this router's webhook URL
    ui-button(:busy="loading" :variant="Variant.Gray" @click="reload") Refresh

  ui-empty-state(
    v-if="!loading && !items.length"
    heading="No webhook deliveries"
    subheading="Configure a webhook URL in router settings and fire events like budget exceeded, rate limit, all targets failed, or loop detected."
  )

  div(v-else class="flex-1 overflow-y-auto min-h-0 flex flex-col gap-2")
    div(v-for="d in items" :key="d.id" class="rounded-lg border px-4 py-3 flex items-center justify-between gap-3" :class="deliveryClass(d)")
      div(class="flex items-center gap-3 min-w-0")
        span(class="w-2 h-2 rounded-full shrink-0" :class="deliveryDot(d)")
        div(class="flex flex-col min-w-0")
          span(class="text-xs font-semibold text-gray-800") {{ eventLabel(d.event) }}
          span(v-if="d.errorMsg" class="text-xs text-red-600 font-mono truncate") {{ d.errorMsg }}
      div(class="flex items-center gap-3 shrink-0")
        span(
          v-if="d.statusCode"
          class="text-xs font-mono px-1.5 py-0.5 rounded"
          :class="d.statusCode < 400 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
        ) {{ d.statusCode }}
        span(v-if="d.createdAt" class="text-xs text-gray-400") {{ formatDate(d.createdAt) }}

  div(v-if="total > perPage" class="shrink-0")
    ui-pagination(v-model="page" :pages="pages" :per-page="perPage" :total="total" @update:per-page="onPerPageChange")
</template>

<script lang="ts">
import { HyperstrateApi, HyperstrateServerInternalModulesObservabilityDomainWebhookDelivery } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import { PaginationMixin } from '@/features/core/components/mixins/pagination.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Variant } from '@/features/ui/clickables/model'
import { AsyncData } from '@/util/async-data.decorator'
import { formatDate as formatShortDate } from '@/util/format'
import { Mixins } from '@/util/mixin'
import { StringProp } from '@/util/prop-decorators'
import { Component, Watch } from 'vue-facing-decorator'

type WebhookDelivery = HyperstrateServerInternalModulesObservabilityDomainWebhookDelivery

@Component
export default class RouterWebhooksTab extends Mixins(ApiClientsMixin, LoadingMixin, PaginationMixin) {
  @StringProp(true)
  public readonly routerId!: string

  public readonly Variant = Variant
  public readonly formatDate = (iso: string): string =>
    formatShortDate(iso, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  public items: WebhookDelivery[] = []
  public totalItems = 0
  protected pageSize = 20

  protected get total(): number {
    return this.totalItems
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

  public async reload(): Promise<void> {
    this.page = 1
    await this.asyncData()
  }

  public eventLabel(event: string | undefined): string {
    const labels: Record<string, string> = {
      loop_detected: 'Loop/anomaly intervention',
      budget_threshold: 'Budget threshold',
      budget_exceeded: 'Budget exceeded',
      rate_limited: 'Rate limited',
      all_targets_failed: 'All targets failed',
    }
    return labels[event ?? ''] ?? event ?? 'Webhook event'
  }

  public deliveryClass(d: WebhookDelivery): string {
    if (!d.success) return 'border-red-100 bg-red-50'
    if (d.event === 'loop_detected') return 'border-orange-100 bg-orange-50'
    return 'border-green-100 bg-green-50'
  }

  public deliveryDot(d: WebhookDelivery): string {
    if (!d.success) return 'bg-red-500'
    if (d.event === 'loop_detected') return 'bg-orange-500'
    return 'bg-green-500'
  }

  @AsyncData()
  public async asyncData(): Promise<AsyncData<RouterWebhooksTab>> {
    this.setLoading(true)
    try {
      const { data } = await this.api.analyticsRoutersRouterIdWebhookDeliveriesGet({
        routerId: this.routerId,
        limit: this.perPage,
        offset: (this.page - 1) * this.perPage,
      })
      return { items: data.data ?? [], totalItems: data.total ?? 0 }
    } finally {
      this.setLoading(false)
    }
  }
}
</script>
