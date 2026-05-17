<template lang="pug">
ui-input-combobox(v-model="model" :options="options" :multiple="multiple" :filter-function="filterFn" @search="onSearch")
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
import { Input, type Option } from '@/features/ui/inputs/model'
import { AsyncData } from '@/util/async-data.decorator'
import { debounceAsyncCancelable } from '@/util/debounce-cancelable'
import { Mixins } from '@/util/mixin'
import { BooleanProp } from '@/util/prop-decorators'
import { isArray } from 'lodash'
import { Component, Model } from 'vue-facing-decorator'

type ModelDefinition = HyperstrateServerInternalModulesAiDomainModelDefinition

@Component
export default class InputComboboxModelDefinition extends Mixins(ApiClientsMixin, ModelsMixin) implements Input {
  @Model()
  protected model?: Option<ModelDefinition> | Option<ModelDefinition>[]

  @BooleanProp(false)
  protected readonly multiple!: boolean

  private get hyperstrateApi(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  public items: ModelDefinition[] = []
  public search?: string

  private readonly debouncedFetch = debounceAsyncCancelable(() => this.asyncData(), 150)

  private get options(): Option<ModelDefinition>[] {
    return this.items.map((item) => ({
      value: item,
      label: item.displayName,
    }))
  }

  // Server already filters — skip Reka UI's client-side label filter.
  public get filterFn(): (options: Option<ModelDefinition>[]) => Option<ModelDefinition>[] {
    return (options) => options
  }

  public get normalizedValue(): Option<ModelDefinition> | Option<ModelDefinition>[] | undefined {
    return this.model
  }

  public get empty(): boolean {
    if (isArray(this.model)) return this.model.length === 0
    return !this.model
  }

  public get pristine(): boolean {
    return this.model === undefined
  }

  @AsyncData()
  protected async asyncData(): Promise<AsyncData<InputComboboxModelDefinition>> {
    const { data } = await this.hyperstrateApi.aiCatalogGet({ query: this.search })
    return { items: data }
  }

  public onSearch(value: string): void {
    this.search = value
    void this.debouncedFetch()
  }
}
</script>
