<template lang="pug">
div(class="flex flex-col gap-1.5")
  ui-clickable(
    v-for="(option, index) in options"
    :key="index"
    tag="button"
    type="button"
    :class="['flex items-start gap-3 p-3 rounded-lg border text-left transition-colors', isSelected(option.value) ? 'border-violet-500 bg-violet-50' : 'border-zinc-200 hover:border-zinc-300']"
    @click="select(option.value)"
  )
    div(
      :class="['mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center', isSelected(option.value) ? 'border-violet-500' : 'border-zinc-300']"
    )
      div(v-if="isSelected(option.value)" class="w-2 h-2 rounded-full bg-violet-500")
    div(class="flex flex-col gap-0.5")
      span(class="text-sm font-medium text-zinc-900") {{ option.label }}
      span(v-if="option.description" class="text-xs text-zinc-500") {{ option.description }}
</template>

<script lang="ts">
import { ArrayProp, OptionalProp } from '@/util/prop-decorators'
import { isEqual } from 'lodash'
import { Component, Vue } from 'vue-facing-decorator'
import { type Input } from '../inputs/model'

export interface OptionPickerItem<T = unknown> {
  label: string
  description?: string
  value: T
}

@Component({ emits: ['update:modelValue'] })
export default class OptionPicker extends Vue implements Input {
  @OptionalProp()
  private readonly modelValue!: unknown

  @ArrayProp(() => [])
  private readonly options!: OptionPickerItem[]

  public get normalizedValue(): unknown {
    return this.modelValue
  }

  public get empty(): boolean {
    return this.modelValue == null
  }

  private isSelected(value: unknown): boolean {
    return isEqual(this.modelValue, value)
  }

  private select(value: unknown): void {
    this.$emit('update:modelValue', value)
  }
}
</script>
