<template lang="pug">
div(class="flex flex-col gap-2 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3")
  div(class="flex items-center justify-between")
    div(class="flex items-center gap-2")
      div(class="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0")
        span(class="text-xs font-bold text-indigo-500 leading-none") {{ label }}
      span(class="text-xs font-semibold text-gray-500") {{ title }}
      span(v-if="pct !== null" class="text-xs font-numeric text-gray-400 tabular-nums") {{ pct }}%
    ui-icon-button(v-if="removable" icon="close" :icon-size="16" :size="Size.SM" :variant="Variant.Gray" class="!text-red-600" @click="$emit('remove')")
  div(class="grid grid-cols-2 gap-2")
    ui-form-field(input="ui-input-text" :path="path + '.name'" label="Name" required placeholder="control" :default-value="defaultName")
    ui-form-field(input="ui-input-text" :path="path + '.weight'" label="Weight" placeholder="50" :default-value="defaultWeight || '50'")
  ui-form-field(
    input="ui-input-combobox"
    :path="path + '.modelId'"
    label="Target"
    required
    transformer="value"
    :default-value="defaultTarget"
    :input-props="{ options: targetOptions, placeholder: 'Select a target...' }"
  )
</template>

<script lang="ts">
import { Size, Variant } from '@/features/ui/clickables/model'
import type { Option } from '@/features/ui/inputs/model'
import type { InternalModulesRouterInterfacesHttpRouterTargetResponse as RouterTarget } from '@/__generated__/hyperstrate-api'
import { Component, Vue } from 'vue-facing-decorator'
import { ArrayProp, BooleanProp, OptionalProp, StringProp } from '@/util/prop-decorators'

@Component
export default class InterceptorABVariantItem extends Vue {
  public Variant = Variant
  public Size = Size

  @StringProp(true)
  public readonly path!: string

  @StringProp(true)
  public readonly label!: string

  @StringProp(true)
  public readonly title!: string

  @OptionalProp(null)
  public readonly pct!: number | null

  @BooleanProp()
  public readonly removable!: boolean

  @StringProp()
  public readonly defaultName?: string

  @ArrayProp(() => [])
  public readonly targetOptions!: Option<RouterTarget>[]

  @StringProp()
  public readonly defaultWeight?: string

  @StringProp()
  public readonly defaultModelId?: string

  public get defaultTarget(): Option<RouterTarget> | undefined {
    if (!this.defaultModelId) return undefined
    return this.targetOptions.find((option) => option.value.modelId === this.defaultModelId)
  }

  declare public $emit: { (event: 'remove'): void; (e: string): void }
}
</script>
