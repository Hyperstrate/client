<template lang="pug">
ui-input-combobox(
  v-model="model"
  :options="options"
  :loading="loading"
  :multiple="multiple"
  :filter-function="filterFn"
  @search="onSearch"
  @scrolled-to-bottom="onLoadMore"
)
  template(#selected-multiple="{ displayValue, count }")
    div(class="flex items-center gap-2 w-full min-w-0")
      span(class="flex-1 min-w-0 truncate text-sm text-zinc-900") {{ displayValue }}
      span(v-if="count > 1" class="shrink-0 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs font-medium")
        | {{ count }} selected
  template(#selected="{ option }")
    div(class="flex items-center gap-2 w-full min-w-0")
      ui-icon(v-if="modelBrandIcon(option?.value?.provider)" :icon="modelBrandIcon(option?.value?.provider)" :size="16" class="shrink-0")
      div(v-else class="w-4 h-4 shrink-0")
      span(class="flex-1 min-w-0 truncate text-sm text-zinc-900") {{ option?.label }}
      span(v-if="option?.value?.modelDefinitionKey" class="shrink-0 max-w-[50%] truncate bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs font-medium")
        | {{ option.value.modelDefinitionKey }}
  template(#option="{ option }")
    div(class="flex items-center gap-2 flex-1 min-w-0")
      ui-icon(v-if="modelBrandIcon(option?.value?.provider)" :icon="modelBrandIcon(option?.value?.provider)" :size="16" class="shrink-0")
      div(v-else class="w-4 h-4 shrink-0")
      div(class="flex flex-col flex-1 min-w-0")
        span(class="truncate text-sm text-zinc-900") {{ option?.label }}
        span(v-if="option?.value?.description" class="truncate text-xs text-gray-400") {{ option.value.description }}
      span(v-if="option?.value?.modelDefinitionKey" class="shrink-0 max-w-[45%] truncate bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs font-medium")
        | {{ option.value.modelDefinitionKey }}
</template>

<script lang="ts">
import { HyperstrateApi, HyperstrateServerInternalModulesAiApplicationModelResponse } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import ModelsMixin from '@/features/core/components/mixins/models.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { InputComboboxSearch, SearchFnArgs, SearchFnReturnType } from '@/features/ui/inputs/InputComboboxSearch'
import { Input } from '@/features/ui/inputs/model'
import { Mixins } from '@/util/mixin'
import { Component } from 'vue-facing-decorator'

type ModelResponse = HyperstrateServerInternalModulesAiApplicationModelResponse

@Component
export default class InputComboboxEmbeddingModel extends Mixins(ApiClientsMixin, ModelsMixin, InputComboboxSearch<ModelResponse>) implements Input {
  private get hyperstrateApi(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  protected async searchFn(args: SearchFnArgs): Promise<SearchFnReturnType<ModelResponse>> {
    const { data } = await this.hyperstrateApi.aiModelsGet({
      page: args.page,
      perPage: args.perPage,
      capabilities: ['embedding'],
      query: args.search,
    })
    return { items: data.items, meta: data.meta }
  }

  protected getOptionLabel(item: ModelResponse): string {
    return item.alias || item.displayName || item.id
  }

  protected getOptionId(item: ModelResponse): string {
    return item.id
  }

  protected async getInitialValue(id: string): Promise<ModelResponse | undefined> {
    const { data } = await this.hyperstrateApi.aiModelsIdGet({ id })
    return data
  }
}
</script>
