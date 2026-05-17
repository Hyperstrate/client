<template lang="pug">
div(class="flex flex-col gap-3" role="radiogroup" v-bind="$attrs")
  template(v-for="(option, index) of options" :key="index")
    label(:class="['flex gap-2 items-center', { 'select-none': true, 'cursor-not-allowed': disabled, 'cursor-pointer': !disabled }]")
      input(
        v-model="model"
        :value="option.value"
        :indeterminate.prop="indeterminate"
        :disabled="disabled || hidden"
        :hidden="hidden"
        :implicit="implicit"
        :checked="option.value === model"
        type="radio"
        class="peer sr-only"
        @focus="pristine = false"
      )
      span(:class="radioMarkClasses")
      slot(:name="option.value" :option="option" :index="index")
        ui-label(class="text-sm !text-zinc-700")
          | {{ option.label }}
</template>

<script lang="ts">
import { ArrayProp, BooleanProp } from '@/util/prop-decorators'
import { stripIndents } from 'common-tags'
import { Component, Model, Vue } from 'vue-facing-decorator'
import { type Input, type Option } from './model'

type InputRadioEmits = {
  (e: 'update:modelValue', value: unknown): void
  (e: string): void
}

@Component({ inheritAttrs: false })
export default class InputRadio<T = unknown> extends Vue implements Input {
  declare public $emit: InputRadioEmits

  @Model
  private readonly value!: T

  @BooleanProp()
  private readonly indeterminate!: boolean

  @BooleanProp()
  private readonly hidden!: boolean

  @BooleanProp()
  private readonly implicit!: boolean

  @BooleanProp()
  private readonly disabled!: boolean

  @ArrayProp(() => [])
  private options!: Option[]

  public pristine = true

  private get model(): T {
    return this.value
  }

  private set model(value) {
    this.$emit('update:modelValue', value)
  }

  public get normalizedValue(): T {
    return this.model
  }

  public get empty(): boolean {
    return false
  }

  private get radioMarkClasses(): string {
    const outer = this.disabled
      ? 'bg-zinc-100 border-zinc-200 opacity-60 cursor-not-allowed'
      : 'bg-white border-zinc-300 peer-checked:border-indigo-600 peer-checked:bg-white peer-focus-visible:ring-2 peer-focus-visible:ring-zinc-400/20'

    const after = stripIndents(`
      after:content-['']
      after:absolute after:rounded-full
      after:h-full after:w-full after:bg-indigo-600
      after:scale-0 peer-checked:after:scale-50
      after:transition-transform after:duration-150
    `)

    return stripIndents(`
      flex shrink-0 h-4 w-4 rounded-full border transition-colors relative
      ${outer}
      ${after}
    `)
  }
}
</script>
