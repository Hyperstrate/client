<template lang="pug">
ui-layout(use="core-default-layout")
  div(class="h-full flex flex-col")
    div(class="max-w-screen-lg w-full mx-auto px-4 pt-8 pb-4 shrink-0")
      domain-ui-page-header(title="Routers" subtitle="Route LLM requests to models using configurable strategies")
        template(#actions)
          ui-button(:size="Size.SM" :variant="Variant.Gray" @click="triggerImport") Import JSON
          input(ref="importInput" type="file" accept=".json,application/json" class="hidden" @change="onImportFile")
          app-router-create-router-modal(@created="onCreated")
            template(#trigger)
              ui-button(:size="Size.SM")
                ui-icon(icon="plus" size="16")
                | New Router

    div(class="flex-1 overflow-y-auto min-h-0")
      div(class="max-w-screen-lg mx-auto px-4 pb-6")
        div(v-if="loading" v-loading="loading" class="flex items-center justify-center py-20")

        div(v-else-if="routers.length === 0" class="flex flex-col items-center gap-1 py-20")
          p(class="text-gray-400 font-medium") No routers yet
          p(class="text-gray-400 text-sm") Create a router to start routing LLM requests across models.

        div(v-else class="grid gap-4 pt-2")
          div(
            v-for="router in routers"
            :key="router.id"
            class="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer"
            @click="openDetail(router.id)"
          )
            div(class="flex flex-col gap-3")
              div(class="flex items-center justify-between")
                div(class="flex items-center gap-3")
                  div(class="w-2.5 h-2.5 rounded-full shrink-0" :class="statusDot(router.status)")
                  div(class="flex flex-col gap-0.5")
                    h2(class="text-sm font-semibold text-gray-900") {{ router.name }}
                    p(v-if="router.description" class="text-xs text-gray-500 line-clamp-1") {{ router.description }}
                div(class="flex items-center gap-2 shrink-0")
                  ui-badge(:variant="Variant.Blue") {{ strategyLabel(router.strategy) }}
                  ui-badge(:variant="statusPillVariant(router.status)" :dot="true") {{ statusLabel(router.status) }}
                  domain-ui-confirm-delete-modal(:name="router.name || 'router'" @confirm="deleteRouter(router.id)" @click.stop)
                    template(#trigger)
                      ui-button(:variant="Variant.Red" :outlined="true" :size="Size.XS") Delete

              div(class="flex items-center gap-4 text-xs text-gray-400")
                span
                  | Created {{ formatDate(router.createdAt) }}

    div(v-if="!loading && routers.length > 0" class="shrink-0 border-t border-gray-100")
      div(class="max-w-screen-lg mx-auto px-4 py-3")
        ui-pagination(v-model="page" :pages="pages" :per-page="perPage" :total="total" @update:per-page="onPerPageChange")
</template>

<script lang="ts">
import {
  HyperstrateApi,
  HyperstrateServerInternalModulesRouterApplicationRouterResponse,
  HyperstrateServerInternalModulesRouterDomainRouterStatus,
  HyperstrateServerInternalModulesRouterDomainRoutingStrategy,
  HyperstrateServerInternalSharedPaginationPaginatedMeta,
} from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import { PaginationMixin } from '@/features/core/components/mixins/pagination.mixin'
import { Mixins } from '@/util/mixin'
import { Component, Ref, Watch } from 'vue-facing-decorator'
import { ROUTING_STRATEGY_OPTIONS } from '../../model'
import { AsyncData } from '@/util/async-data.decorator'
import { Size, Variant } from '@/features/ui/clickables/model'
import { formatDate as formatShortDate } from '@/util/format'

@Component
export default class AppView extends Mixins(ApiClientsMixin, LoadingMixin, PaginationMixin) {
  public routers: HyperstrateServerInternalModulesRouterApplicationRouterResponse[] = []
  public meta?: HyperstrateServerInternalSharedPaginationPaginatedMeta = undefined
  public deleting?: string = undefined

  public Variant = Variant
  public Size = Size
  public readonly formatDate = (dateString: string | undefined): string => formatShortDate(dateString, { year: 'numeric', month: 'numeric', day: 'numeric' })

  protected pageSize = 10

  protected get total(): number {
    return this.meta?.total ?? 0
  }

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  @Watch('page')
  protected async onPageChange(): Promise<void> {
    await this.asyncData()
  }

  @AsyncData()
  public async asyncData(): Promise<AsyncData<AppView>> {
    this.setLoading(true)
    try {
      const { data } = await this.api.routerGet({ page: this.page, perPage: this.perPage })
      return { routers: data.items, meta: data.meta }
    } finally {
      this.setLoading(false)
    }
  }

  @Ref()
  public readonly importInput!: HTMLInputElement

  public importing = false

  public triggerImport(): void {
    this.importInput.value = ''
    this.importInput.click()
  }

  public async onImportFile(e: Event): Promise<void> {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file || this.importing) return
    this.importing = true
    try {
      const text = await file.text()
      const payload = JSON.parse(text)
      const { data } = await this.api.routerImportPost({ body: payload })
      this.routers = [data, ...this.routers]
    } catch {
      // parse/network errors silently dropped; list unchanged
    } finally {
      this.importing = false
    }
  }

  public async onCreated(): Promise<void> {
    await this.asyncData()
  }

  public openDetail(id: string | undefined): void {
    if (!id) return
    void this.$router.push({ name: 'AppRouter/Router', params: { id } })
  }

  public async deleteRouter(id: string | undefined): Promise<void> {
    if (!id) return
    this.deleting = id
    try {
      await this.api.routerIdDelete({ id })
      await this.asyncData()
    } catch (err) {
      console.error('Failed to delete router', err)
    } finally {
      this.deleting = undefined
    }
  }

  public onPerPageChange(value: number): void {
    this.pageSize = value
    this.page = 1
    void this.asyncData()
  }

  public statusDot(status?: HyperstrateServerInternalModulesRouterDomainRouterStatus): string {
    if (!status) return 'bg-gray-400'
    return (
      {
        [HyperstrateServerInternalModulesRouterDomainRouterStatus.RouterStatusActive]: 'bg-green-500',
        [HyperstrateServerInternalModulesRouterDomainRouterStatus.RouterStatusDraft]: 'bg-yellow-400',
        [HyperstrateServerInternalModulesRouterDomainRouterStatus.RouterStatusInactive]: 'bg-gray-400',
      }[status] ?? 'bg-gray-400'
    )
  }

  public statusPillVariant(status?: HyperstrateServerInternalModulesRouterDomainRouterStatus): Variant {
    if (!status) return Variant.Gray
    return (
      {
        [HyperstrateServerInternalModulesRouterDomainRouterStatus.RouterStatusActive]: Variant.Green,
        [HyperstrateServerInternalModulesRouterDomainRouterStatus.RouterStatusDraft]: Variant.Orange,
        [HyperstrateServerInternalModulesRouterDomainRouterStatus.RouterStatusInactive]: Variant.Gray,
      }[status] ?? Variant.Gray
    )
  }

  public statusLabel(status?: HyperstrateServerInternalModulesRouterDomainRouterStatus): string {
    if (!status) return ''
    return (
      {
        [HyperstrateServerInternalModulesRouterDomainRouterStatus.RouterStatusActive]: 'Active',
        [HyperstrateServerInternalModulesRouterDomainRouterStatus.RouterStatusDraft]: 'Draft',
        [HyperstrateServerInternalModulesRouterDomainRouterStatus.RouterStatusInactive]: 'Inactive',
      }[status] ?? status
    )
  }

  public strategyLabel(strategy?: HyperstrateServerInternalModulesRouterDomainRoutingStrategy): string {
    if (!strategy) return ''
    return ROUTING_STRATEGY_OPTIONS.find((o) => o.value === strategy)?.label ?? strategy
  }
}
</script>
