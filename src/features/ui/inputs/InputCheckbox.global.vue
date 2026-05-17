<template lang="pug">
label(:class="['flex gap-2 items-center shrink-0', { 'select-none': true, 'cursor-not-allowed': disabled, 'cursor-pointer': !disabled }]")
  input(
    v-bind="$attrs"
    v-model="model"
    :value="checkedValue"
    :disabled="disabled"
    type="checkbox"
    class="peer sr-only outline-hidden"
    role="checkbox"
    :readonly="readonly"
    @focus="pristine = false"
  )
  span(:class="checkBoxClasses" data-checkbox-box aria-hidden="true")
    ui-icon(icon="check" :size="12" class="shrink-0")
  slot(name="label" :value="model")
    span(class="text-sm font-normal text-zinc-700")
      | {{ label }}
</template>

<script lang="ts">
import { StringProp, OptionalProp, BooleanProp } from '@/util/prop-decorators'
import { isArray } from 'lodash'
import { Component, Vue, Model } from 'vue-facing-decorator'
import { type Input } from './model'
import { stripIndents } from 'common-tags'

// TODO: maybe refactor into a ui-checkbox component that can be used here?
type InputCheckboxEmits = {
  (e: 'update:modelValue', value: unknown): void
  (e: string): void
}

@Component({ inheritAttrs: false })
export default class InputCheckbox<T = unknown> extends Vue implements Input {
  declare public $emit: InputCheckboxEmits

  @Model
  private readonly value!: T | unknown[]

  @BooleanProp()
  private readonly disabled!: boolean

  @OptionalProp()
  private readonly checkedValue?: unknown

  @OptionalProp(false)
  private readonly falseValue!: T

  @OptionalProp(true)
  private readonly trueValue!: T

  @StringProp('')
  private readonly label!: string

  @BooleanProp()
  private readonly readonly!: boolean

  public pristine = true

  private get model(): boolean | unknown[] {
    return isArray(this.value) ? this.value : this.value === this.trueValue
  }

  private set model(value) {
    this.$emit('update:modelValue', isArray(value) ? value : this.normalizeValue(value))
  }

  public get normalizedValue(): T | unknown[] {
    return isArray(this.model) ? this.model : this.normalizeValue(this.model)
  }

  public get empty(): boolean {
    return false
  }

  private normalizeValue(value: boolean): T {
    return value ? this.trueValue : this.falseValue
  }

  private get checkBoxClasses(): string {
    const bgColor = this.disabled
      ? `bg-zinc-100 border-zinc-200 text-transparent opacity-60 peer-checked:text-zinc-400`
      : `bg-white border-zinc-300 text-transparent peer-checked:bg-indigo-600 peer-checked:border-indigo-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-zinc-400/20`

    return stripIndents(`
      flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors
      ${bgColor}
    `)
  }
}
</script>
