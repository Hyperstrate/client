<template lang="pug">
ui-input-combobox(v-model="model" :options="options" :loading="loading" :multiple="multiple" :filter-function="filterFn" @search="onSearch")
  template(#selected-multiple="{ displayValue, count }")
    div(class="flex items-center gap-2 w-full min-w-0")
      span(class="flex-1 min-w-0 truncate text-sm text-zinc-900") {{ displayValue }}
      span(v-if="count > 1" class="shrink-0 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium")
        | {{ count }} selected
  template(#selected="{ option }")
    div(class="flex items-center gap-2 w-full min-w-0")
      ui-icon(v-if="modelBrandIcon(option?.value?.provider)" :icon="modelBrandIcon(option?.value?.provider)" :size="16" class="shrink-0")
      div(v-else class="w-4 h-4 shrink-0")
      span(class="flex-1 min-w-0 truncate text-sm text-zinc-900") {{ option?.label }}
      span(v-if="option?.value?.key" class="shrink-0 max-w-[50%] truncate bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium")
        | {{ option.value.key }}
  template(#option="{ option }")
    div(class="flex items-center gap-2 flex-1 min-w-0")
      ui-icon(v-if="modelBrandIcon(option?.value?.provider)" :icon="modelBrandIcon(option?.value?.provider)" :size="16" class="shrink-0")
      div(v-else class="w-4 h-4 shrink-0")
      span(class="flex-1 min-w-0 truncate text-sm text-zinc-900") {{ option?.label }}
      span(v-if="option?.value?.key" class="shrink-0 max-w-[50%] truncate bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium")
        | {{ option.value.key }}
</template>

<script lang="ts">
import { HyperstrateApi, HyperstrateServerInternalModulesAiDomainModelDefinition } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import ModelsMixin from '@/features/core/components/mixins/models.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { InputComboboxSearch, SearchFnArgs, SearchFnReturnType } from '@/features/ui/inputs/InputComboboxSearch'
import { Mixins } from '@/util/mixin'
import { Component } from 'vue-facing-decorator'

type ModelDefinition = HyperstrateServerInternalModulesAiDomainModelDefinition

@Component
export default class InputComboboxModelDefinition extends Mixins(ApiClientsMixin, ModelsMixin, InputComboboxSearch<ModelDefinition>) {
  private get hyperstrateApi(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  protected pageSize = 1000

  protected async searchFn(args: SearchFnArgs): Promise<SearchFnReturnType<ModelDefinition>> {
    const { data } = await this.hyperstrateApi.aiCatalogGet({ query: args.search })
    return {
      items: data,
      meta: {
        count: data.length,
        page: 1,
        pages: 1,
        perPage: data.length,
        total: data.length,
      },
    }
  }

  protected getOptionLabel(item: ModelDefinition): string {
    return item.displayName
  }

  protected getOptionId(item: ModelDefinition): string {
    return item.key
  }
}
</script>
