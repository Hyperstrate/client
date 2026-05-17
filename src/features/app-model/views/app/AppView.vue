<template lang="pug">
ui-layout(use="core-default-layout")
  div(class="h-full flex flex-col")
    div(class="max-w-screen-lg w-full mx-auto px-4 pt-8 pb-4 shrink-0")
      domain-ui-page-header(title="Models" subtitle="Registered AI models available for routing")
        template(#actions)
          app-model-create-model-modal(@registered="onRegistered")
            template(#trigger)
              ui-button(:size="Size.SM")
                template(#before)
                  ui-icon(icon="plus" :size="16")
                | Register Model

    div(class="flex-1 overflow-y-auto min-h-0")
      div(class="max-w-screen-lg mx-auto px-4 pb-6")
        div(v-if="loading" v-loading="true")
        div(v-else-if="items.length === 0" class="py-12 text-center")
          div(class="flex flex-col gap-1")
            p(class="text-gray-400 font-medium") No models registered yet
            p(class="text-gray-400 text-sm") Register a model to start routing requests.
        div(v-else class="flex flex-col gap-3 pt-2")
          div(
            v-for="model in items"
            :key="model.id"
            :class="['bg-white rounded-xl border p-4 flex items-center justify-between gap-4', isConfigured(model.id) ? 'border-gray-200' : 'border-orange-200 bg-orange-50/40']"
          )
            div(class="min-w-0 flex-1 flex flex-col gap-1.5")
              div(class="flex items-center gap-2")
                ui-icon(v-if="modelBrandIcon(model.provider)" :key="model.id" :icon="modelBrandIcon(model.provider)" :size="18" class="shrink-0")
                div(v-else class="w-[18px] h-[18px] shrink-0")
                span(class="text-sm font-semibold text-gray-900 truncate") {{ model.alias || model.displayName }}
                ui-badge(:variant="Variant.Blue") {{ model.modelDefinitionKey }}
                ui-pill(v-if="!configLoading && !isConfigured(model.id)" :variant="Variant.Orange") Not configured
                ui-tooltip(v-if="model.id in healthMap" :content="healthMap[model.id] ? 'Provider healthy' : 'Provider unreachable'")
                  span(class="w-2 h-2 rounded-full shrink-0" :class="healthMap[model.id] ? 'bg-green-500' : 'bg-red-500'")
              div(class="text-xs text-gray-400 flex gap-3")
                span(v-if="model.alias") {{ model.displayName }}
                span Created {{ formatDate(model.createdAt) }}
            div(class="shrink-0")
              ui-dropdown
                template(#trigger)
                  ui-clickable
                    ui-icon(icon="dots-horizontal" class="text-zinc-700")
                template(#content)
                  div(class="flex flex-col")
                    app-model-configure-model-modal(
                      :model-id="model.id"
                      :credential-fields="model.credentialFields"
                      :default-base-url="model.defaultBaseUrl"
                      @configured="onConfigured(model.id)"
                    )
                      template(#trigger)
                        ui-clickable(
                          tag="button"
                          class="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-left text-zinc-900 rounded-md hover:bg-gray-50 transition-colors"
                        )
                          ui-icon(icon="switches" :size="20" class="text-zinc-900 shrink-0")
                          | Configure
                    ui-divider
                    domain-ui-confirm-delete-modal(:name="model.alias || model.displayName" @confirm="deleteModel(model.id)")
                      template(#trigger)
                        ui-clickable(
                          tag="button"
                          :disabled="deleting === model.id"
                          class="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-left text-red-600 rounded-md hover:bg-red-50 transition-colors disabled:opacity-40"
                        )
                          ui-icon(icon="trash" :size="20" class="shrink-0")
                          | Delete

    div(v-if="!loading && items.length > 0" class="shrink-0 border-t border-gray-100")
      div(class="max-w-screen-lg mx-auto px-4 py-3")
        ui-pagination(v-model="page" :pages="pages" :per-page="perPage" :total="total" @update:per-page="onPerPageChange")
</template>

<script lang="ts">
import type {
  HyperstrateServerInternalModulesAiApplicationModelResponse,
  HyperstrateServerInternalSharedPaginationPaginatedMeta,
} from '@/__generated__/hyperstrate-api'
import { HyperstrateApi } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import ModelsMixin from '@/features/core/components/mixins/models.mixin'
import { PaginationMixin } from '@/features/core/components/mixins/pagination.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Size, Variant } from '@/features/ui/clickables/model'
import { AsyncData } from '@/util/async-data.decorator'
import { formatDate as formatShortDate } from '@/util/format'
import { Mixins } from '@/util/mixin'
import { Component, Watch } from 'vue-facing-decorator'

@Component
export default class AppView extends Mixins(ApiClientsMixin, LoadingMixin, ModelsMixin, PaginationMixin) {
  public items: HyperstrateServerInternalModulesAiApplicationModelResponse[] = []
  public meta?: HyperstrateServerInternalSharedPaginationPaginatedMeta
  protected pageSize = 10
  public deleting?: string = undefined
  public configuredIds: string[] = []
  public configLoading = false
  public healthMap: Record<string, boolean> = {}

  public Variant = Variant
  public Size = Size
  public readonly formatDate = (iso: string): string => formatShortDate(iso, { month: 'short', day: 'numeric', year: 'numeric' })

  protected get total(): number {
    return this.meta?.total ?? 0
  }

  private get hyperstrateApi(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  @Watch('page')
  private async onPageChange(): Promise<void> {
    await this.asyncData()
  }

  @AsyncData()
  public async asyncData(): Promise<AsyncData<AppView>> {
    this.setLoading(true)
    try {
      const { data } = await this.hyperstrateApi.aiModelsGet({
        page: this.page,
        perPage: this.perPage,
      })
      void this.loadConfigStatus(data.items.map((m) => m.id))
      void this.loadHealthStatus()
      return { items: data.items, meta: data.meta }
    } finally {
      this.setLoading(false)
    }
  }

  private async loadConfigStatus(ids: string[]): Promise<void> {
    if (ids.length === 0) return
    this.configLoading = true
    try {
      const { data } = await this.hyperstrateApi.aiModelsConfigurationsGet({ ids })
      this.configuredIds = data.map((c) => c.modelId)
    } finally {
      this.configLoading = false
    }
  }

  private async loadHealthStatus(): Promise<void> {
    try {
      const { data } = await this.hyperstrateApi.healthProvidersGet()
      const map: Record<string, boolean> = {}
      for (const h of data.data ?? []) {
        if (h.modelId) map[h.modelId] = h.isHealthy ?? true
      }
      this.healthMap = map
    } catch {}
  }

  public isConfigured(id: string): boolean {
    return this.configuredIds.includes(id)
  }

  public async onRegistered(): Promise<void> {
    await this.asyncData()
  }

  public onConfigured(id: string): void {
    if (!this.configuredIds.includes(id)) this.configuredIds.push(id)

    void this.asyncData()
  }

  public async deleteModel(id: string): Promise<void> {
    this.deleting = id
    try {
      await this.hyperstrateApi.aiModelsIdDelete({ id })
      await this.asyncData()
    } finally {
      this.deleting = undefined
    }
  }

  public onPerPageChange(value: number): void {
    this.pageSize = value
    this.page = 1
    void this.asyncData()
  }
}
</script>
