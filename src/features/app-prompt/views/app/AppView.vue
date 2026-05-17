<template lang="pug">
ui-layout(use="core-default-layout")
  //- Edit modal lives outside the layout so it isn't unmounted when the dropdown closes
  app-prompt-prompt-modal(ref="editModalRef" :prompt="editingItem" @saved="onEditSaved")
  app-prompt-prompt-version-drawer(
    :prompt-id="historyItem?.id"
    :prompt-name="historyItem?.name"
    :current-version="0"
    @close="historyItem = undefined"
    @restored="onEditSaved"
  )

  div(class="h-full flex flex-col")
    div(class="max-w-screen-lg w-full mx-auto px-4 pt-8 pb-4 shrink-0")
      domain-ui-page-header(title="System Prompts" subtitle="Reusable prompt templates with {{variable}} interpolation")
        template(#actions)
          app-prompt-prompt-modal(@saved="onSaved")
            template(#trigger)
              ui-button(:size="Size.SM")
                template(#before)
                ui-icon(icon="plus" :size="16")
                | New Prompt

    div(class="flex-1 overflow-y-auto min-h-0")
      div(class="max-w-screen-lg mx-auto px-4 pb-6")
        div(v-if="loading" v-loading="loading" class="py-20")
        ui-empty-state(v-else-if="items.length === 0" heading="No prompts yet" subheading="Create a system prompt to reuse it across multiple routers.")
        div(v-if="!loading && items.length > 0" class="flex flex-col gap-3 pt-2")
          div(v-for="item in items" :key="item.id" class="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between gap-4")
            div(class="min-w-0 flex-1 flex flex-col gap-1.5")
              div(class="flex items-center gap-2 flex-wrap")
                span(class="text-sm font-semibold text-gray-900") {{ item.name }}
                ui-badge(v-for="v in item.variables" :key="v" :variant="Variant.Blue" :size="Size.SM") {{ '{' }}{{ '{' }}+ v +{{ '}' }}{{ '}' }}
              p(v-if="item.description" class="text-xs text-gray-400") {{ item.description }}
              p(class="text-xs text-gray-500 font-mono line-clamp-2 bg-gray-50 rounded px-2 py-1") {{ item.content }}
            div(class="shrink-0")
              ui-dropdown
                template(#trigger)
                  ui-clickable
                    ui-icon(icon="dots-horizontal" class="text-zinc-700")
                template(#content)
                  div(class="flex flex-col")
                    ui-clickable(
                      tag="button"
                      class="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-left text-zinc-900 rounded-md hover:bg-gray-50 transition-colors"
                      @click="openEdit(item)"
                    )
                      ui-icon(icon="pencil" :size="20" class="shrink-0")
                      | Edit
                    ui-clickable(
                      tag="button"
                      class="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-left text-zinc-900 rounded-md hover:bg-gray-50 transition-colors"
                      @click="historyItem = item"
                    )
                      ui-icon(icon="clock" :size="20" class="shrink-0")
                      | History
                    ui-divider
                    domain-ui-confirm-delete-modal(:name="item.name" @confirm="deletePrompt(item.id)")
                      template(#trigger)
                        ui-clickable(
                          tag="button"
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
  HyperstrateServerInternalModulesPromptsApplicationPromptResponse,
  HyperstrateServerInternalSharedPaginationPaginatedMeta,
} from '@/__generated__/hyperstrate-api'
import { HyperstrateApi } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import { PaginationMixin } from '@/features/core/components/mixins/pagination.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import PromptModal from '@/features/app-prompt/components/prompt-modal/PromptModal.global.vue'
import { Size, Variant } from '@/features/ui/clickables/model'
import { AsyncData } from '@/util/async-data.decorator'
import { Mixins } from '@/util/mixin'
import { Component, Ref, Watch } from 'vue-facing-decorator'

type Prompt = HyperstrateServerInternalModulesPromptsApplicationPromptResponse
type PaginatedMeta = HyperstrateServerInternalSharedPaginationPaginatedMeta

@Component
export default class AppView extends Mixins(ApiClientsMixin, LoadingMixin, PaginationMixin) {
  public items: Prompt[] = []
  public meta?: PaginatedMeta
  public editingItem?: Prompt
  public historyItem?: Prompt
  protected pageSize = 20

  public Variant = Variant
  public Size = Size

  @Ref()
  public readonly editModalRef!: PromptModal

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
      const { data } = await this.api.promptsGet({ page: this.page, perPage: this.perPage })
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

  public openEdit(item: Prompt): void {
    this.editingItem = item
    this.editModalRef.open()
  }

  public onSaved(): void {
    void this.asyncData()
  }

  public onEditSaved(): void {
    void this.asyncData()
    this.editingItem = undefined
  }

  public async deletePrompt(id: string): Promise<void> {
    await this.api.promptsIdDelete({ id })
    void this.asyncData()
  }
}
</script>
