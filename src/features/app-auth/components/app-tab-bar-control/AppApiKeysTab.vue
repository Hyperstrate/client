<template lang="pug">
div(class="h-full flex flex-col gap-4")
  div(class="flex justify-between items-center shrink-0")
    span(class="text-sm font-semibold text-gray-700") API Keys
    app-auth-create-api-key-modal(@created="onCreated")
      template(#trigger)
        ui-button(:size="Size.SM")
          template(#before)
            ui-icon(icon="plus" :size="16")
          | New Key

  div(class="flex-1 overflow-y-auto min-h-0")
    div(v-if="loading" v-loading="true")
    div(v-else-if="items.length === 0" class="py-12 text-center")
      div(class="flex flex-col gap-1")
        p(class="text-gray-400 font-medium") No API keys yet
        p(class="text-gray-400 text-sm") Create a key to authenticate requests to the router endpoints.
    div(v-else class="flex flex-col gap-3")
      div(v-for="key in items" :key="key.id" class="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-4")
        div(class="min-w-0 flex-1 flex flex-col gap-1.5")
          div(class="flex items-center gap-2")
            span(class="text-sm font-semibold text-gray-900 truncate") {{ key.name }}
            ui-pill(:variant="key.scope === 'global' ? Variant.Blue : Variant.Purple") {{ key.scope }}
            ui-status(:value="key.isEnabled")
          div(class="text-xs text-gray-400 truncate")
            span(v-if="key.description") {{ key.description }} ·&nbsp;
            span Created {{ formatDate(key.createdAt) }}
            span(v-if="key.expiresAt") &nbsp;· Expires {{ formatDate(key.expiresAt) }}
        div(class="flex items-center gap-2 shrink-0")
          ui-dropdown(align="end")
            template(#trigger)
              ui-icon-button(icon="dots-horizontal" :icon-size="16" :size="Size.SM" :variant="Variant.Gray" :square="true")
            template(#content)
              div(class="flex flex-col")
                app-auth-rotate-api-key-modal(:key-id="key.id ?? ''")
                  template(#trigger)
                    ui-clickable(
                      tag="button"
                      class="flex items-center gap-2 w-full px-3 py-2 text-xs text-left text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    ) Rotate key
                ui-divider
                domain-ui-confirm-delete-modal(:name="key.name || 'API key'" @confirm="deleteItem(key.id)")
                  template(#trigger)
                    ui-clickable(
                      tag="button"
                      class="flex items-center gap-2 w-full px-3 py-2 text-xs text-left text-red-600 rounded-md hover:bg-red-50 transition-colors"
                    ) Delete
  div(v-if="!loading && items.length > 0" class="shrink-0 pt-3 border-t border-gray-100")
    ui-pagination(v-model="page" :pages="pages" :per-page="perPage" :total="total" @update:per-page="onPerPageChange")
</template>

<script lang="ts">
import {
  HyperstrateApi,
  InternalModulesAuthInterfacesHttpAPIKeyResponse,
  HyperstrateServerInternalSharedPaginationPaginatedMeta,
} from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import { PaginationMixin } from '@/features/core/components/mixins/pagination.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Size, Variant } from '@/features/ui/clickables/model'
import { AsyncData } from '@/util/async-data.decorator'
import { formatDate as formatShortDate } from '@/util/format'
import { Mixins } from '@/util/mixin'
import { Component, Watch } from 'vue-facing-decorator'

type APIKeyResponse = InternalModulesAuthInterfacesHttpAPIKeyResponse

@Component
export default class AppApiKeysTab extends Mixins(ApiClientsMixin, LoadingMixin, PaginationMixin) {
  public Variant = Variant
  public Size = Size
  public readonly formatDate = (iso?: string): string => formatShortDate(iso, { month: 'short', day: 'numeric', year: 'numeric' })

  public items: APIKeyResponse[] = []
  public meta?: HyperstrateServerInternalSharedPaginationPaginatedMeta
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
  public async asyncData(): Promise<AsyncData<AppApiKeysTab>> {
    this.setLoading(true)
    try {
      const { data } = await this.api.authApiKeysGet({ page: this.page, perPage: this.perPage })
      return { items: data.items, meta: data.meta }
    } finally {
      this.setLoading(false)
    }
  }

  public onPerPageChange(value: number): void {
    this.pageSize = value
    this.page = 1
    void this.asyncData()
  }

  public onCreated(key: APIKeyResponse): void {
    this.items = [key, ...this.items]
  }

  public async deleteItem(id?: string): Promise<void> {
    if (!id) return
    await this.api.authApiKeysIdDelete({ id })
    await this.asyncData()
  }
}
</script>
