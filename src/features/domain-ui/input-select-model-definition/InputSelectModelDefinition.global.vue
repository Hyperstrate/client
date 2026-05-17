<template lang="pug">
ui-input-select(ref="inputSelectRef" v-model="value" :options="options")
  template(#trigger)
    template(v-if="value")
      div(class="flex items-center gap-2 w-full min-w-0")
        ui-icon(v-if="modelBrandIcon(value.value?.provider)" :icon="modelBrandIcon(value.value?.provider)" :size="16" class="shrink-0")
        div(v-else class="w-4 h-4 shrink-0")
        span(class="flex-1 truncate text-sm") {{ value.label }}
        ui-pill(v-if="value.value?.key" :variant="Variant.Gray") {{ value.value.key }}
  template(#option="{ option }")
    div(class="flex items-center gap-2 flex-1 min-w-0")
      ui-icon(v-if="modelBrandIcon(option.value?.provider)" :icon="modelBrandIcon(option.value?.provider)" :size="16" class="shrink-0")
      div(v-else class="w-4 h-4 shrink-0")
      span(class="flex-1 truncate") {{ option.label }}
      ui-pill(v-if="option.value?.key" :variant="Variant.Gray") {{ option.value.key }}
</template>

<script lang="ts">
import { HyperstrateApi, HyperstrateServerInternalModulesAiDomainModelDefinition } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import ModelsMixin from '@/features/core/components/mixins/models.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import InputSelect from '@/features/ui/inputs/InputSelect.global.vue'
import { Input, type Option } from '@/features/ui/inputs/model'
import { AsyncData } from '@/util/async-data.decorator'
import { Mixins } from '@/util/mixin'
import { Variant } from '@/features/ui/clickables/model'
import { Component, Model, Ref } from 'vue-facing-decorator'

type ModelDefinition = HyperstrateServerInternalModulesAiDomainModelDefinition

@Component
export default class InputSelectModelDefinition extends Mixins(ApiClientsMixin, ModelsMixin) implements Input {
  public Variant = Variant

  @Model
  protected readonly value!: Option<ModelDefinition>

  @Ref()
  private readonly inputSelectRef!: InputSelect

  private get hyperstrateApi(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  public items: ModelDefinition[] = []

  private get options(): Option<ModelDefinition>[] {
    return this.items.map((item) => ({
      value: item,
      label: item.displayName,
    }))
  }

  public get normalizedValue(): Option<ModelDefinition> | undefined {
    return this.value
  }

  public get empty(): boolean {
    return this.inputSelectRef.empty
  }

  public get pristine(): boolean {
    return this.inputSelectRef.pristine
  }

  @AsyncData()
  protected async asyncData(): Promise<AsyncData<InputSelectModelDefinition>> {
    const { data } = await this.hyperstrateApi.aiCatalogGet()
    return { items: data }
  }
}
</script>
