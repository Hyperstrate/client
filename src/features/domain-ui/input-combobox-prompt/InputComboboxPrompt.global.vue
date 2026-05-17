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
      span(v-if="count > 1" class="shrink-0 bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full text-xs font-medium")
        | {{ count }} selected
  template(#selected="{ option }")
    div(class="flex items-center gap-2 w-full min-w-0")
      ui-icon(icon="document-text" :size="16" class="shrink-0")
      span(class="flex-1 min-w-0 truncate text-sm text-zinc-900") {{ option?.label }}
      span(v-if="option?.value?.variables?.length" class="shrink-0 bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full text-xs font-medium")
        | {{ option.value.variables.length }} var{{ option.value.variables.length === 1 ? '' : 's' }}
  template(#option="{ option }")
    div(class="flex items-center gap-2 flex-1 min-w-0")
      ui-icon(icon="document-text" :size="16" class="shrink-0")
      div(class="flex flex-col flex-1 min-w-0")
        span(class="truncate text-sm text-zinc-900") {{ option?.label }}
        span(v-if="option?.value?.description" class="truncate text-xs text-gray-400") {{ option.value.description }}
      span(v-if="option?.value?.variables?.length" class="shrink-0 bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full text-xs font-medium")
        | {{ option.value.variables.length }} var{{ option.value.variables.length === 1 ? '' : 's' }}
</template>

<script lang="ts">
import { HyperstrateApi, HyperstrateServerInternalModulesPromptsApplicationPromptResponse } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { InputComboboxSearch, SearchFnArgs, SearchFnReturnType } from '@/features/ui/inputs/InputComboboxSearch'
import { Input } from '@/features/ui/inputs/model'
import { Mixins } from '@/util/mixin'
import { Component } from 'vue-facing-decorator'

type PromptResponse = HyperstrateServerInternalModulesPromptsApplicationPromptResponse

@Component
export default class InputComboboxPrompt extends Mixins(ApiClientsMixin, InputComboboxSearch<PromptResponse>) implements Input {
  private get hyperstrateApi(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  protected async searchFn(args: SearchFnArgs): Promise<SearchFnReturnType<PromptResponse>> {
    const { data } = await this.hyperstrateApi.promptsGet({ page: args.page, perPage: args.perPage, query: args.search })
    return { items: data.items, meta: data.meta }
  }

  protected getOptionLabel(item: PromptResponse): string {
    return item.name
  }

  protected getOptionId(item: PromptResponse): string {
    return item.id
  }

  protected async getInitialValue(id: string): Promise<PromptResponse | undefined> {
    const { data } = await this.hyperstrateApi.promptsIdGet({ id })
    return data
  }
}
</script>
