<template lang="pug">
div(class="h-full flex flex-col gap-4")
  div(class="flex justify-between items-center shrink-0")
    span(class="text-sm font-semibold text-gray-700") Virtual Keys
    app-auth-create-virtual-key-modal(@created="onCreated")
      template(#trigger)
        ui-button(:size="Size.SM")
          template(#before)
            ui-icon(icon="plus" :size="16")
          | New Virtual Key

  div(class="flex-1 overflow-y-auto min-h-0")
    div(v-if="loading" v-loading="true")
    div(v-else-if="items.length === 0" class="py-12 text-center")
      div(class="flex flex-col gap-1")
        p(class="text-gray-400 font-medium") No virtual keys yet
        p(class="text-gray-400 text-sm") Virtual keys carry per-key budget limits for request and cost tracking.
    div(v-else class="flex flex-col gap-3")
      ui-clickable(
        v-for="vk in items"
        :key="vk.id"
        tag="button"
        class="w-full text-left bg-white rounded-xl border border-gray-200 p-4 hover:border-indigo-200 hover:shadow-xs transition-all"
        @click="$router.push({ name: 'AppAuth/VirtualKey', params: { id: vk.id } })"
      )
        div(class="flex items-start justify-between gap-4 w-full")
          div(class="min-w-0 flex-1 flex flex-col gap-1.5")
            div(class="flex items-center gap-2")
              span(class="text-sm font-semibold text-gray-900 truncate") {{ vk.name }}
              ui-status(:value="vk.isEnabled")
            div(class="text-xs text-gray-400 truncate")
              span(v-if="vk.description") {{ vk.description }} ·&nbsp;
              span Created {{ formatDate(vk.createdAt) }}
            div(v-if="!!vk.maxRequests || !!vk.maxCostUsd || !!vk.resetPeriod || !!vk.rateLimitRps" class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500")
              span(v-if="vk.maxRequests")
                | Request limit:
                span(class="font-numeric tabular-nums") {{ formatNumber(vk.maxRequests) }}
              span(v-if="vk.maxCostUsd")
                | Cost limit:
                span(class="font-numeric tabular-nums") ${{ vk.maxCostUsd }}
              span(v-if="vk.resetPeriod") Reset: {{ vk.resetPeriod }}
              span(v-if="vk.rateLimitRps")
                | RPS:
                span(class="font-numeric tabular-nums") {{ vk.rateLimitRps }}/s
          div(class="flex items-center gap-2 shrink-0" @click.stop)
            ui-dropdown(align="end")
              template(#trigger)
                ui-icon-button(icon="dots-horizontal" :icon-size="16" :size="Size.SM" :variant="Variant.Gray" :square="true")
              template(#content="{ close }")
                div(class="flex flex-col")
                  ui-clickable(
                    tag="button"
                    class="flex items-center gap-2 w-full px-3 py-2 text-xs text-left text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    @click="toggleItem(vk), close()"
                  ) {{ vk.isEnabled ? 'Disable' : 'Enable' }}
                  ui-divider
                  domain-ui-confirm-delete-modal(:name="vk.name || 'virtual key'" @confirm="deleteItem(vk.id)")
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
  InternalModulesAuthInterfacesHttpVirtualKeyResponse,
  HyperstrateServerInternalSharedPaginationPaginatedMeta,
} from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import { PaginationMixin } from '@/features/core/components/mixins/pagination.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Size, Variant } from '@/features/ui/clickables/model'
import { AsyncData } from '@/util/async-data.decorator'
import { formatDate, formatNumber } from '@/util/format'
import { Mixins } from '@/util/mixin'
import { Component, Watch } from 'vue-facing-decorator'

type VirtualKeyResponse = InternalModulesAuthInterfacesHttpVirtualKeyResponse

@Component
export default class AppVirtualKeysTab extends Mixins(ApiClientsMixin, LoadingMixin, PaginationMixin) {
  public Variant = Variant
  public Size = Size
  public readonly formatNumber = formatNumber
  public readonly formatDate = formatDate

  public items: VirtualKeyResponse[] = []
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
  public async asyncData(): Promise<AsyncData<AppVirtualKeysTab>> {
    this.setLoading(true)
    try {
      const { data } = await this.api.authVirtualKeysGet({ page: this.page, perPage: this.perPage })
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

  public onCreated(vk: VirtualKeyResponse): void {
    this.items = [vk, ...this.items]
  }

  public async toggleItem(vk: VirtualKeyResponse): Promise<void> {
    if (!vk.id) return
    const { data: updated } = await this.api.authVirtualKeysIdPatch({ id: vk.id, body: { isEnabled: !vk.isEnabled } })
    this.items = this.items.map((k) => (k.id === updated.id ? updated : k))
  }

  public async deleteItem(id: string | undefined): Promise<void> {
    if (!id) return
    await this.api.authVirtualKeysIdDelete({ id })
    await this.asyncData()
  }
}
</script>
