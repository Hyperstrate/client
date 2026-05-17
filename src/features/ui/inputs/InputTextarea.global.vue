<template lang="pug">
textarea(
  v-model="model"
  class="min-w-80 p-3 text-sm font-normal rounded-lg border outline-hidden transition-colors duration-150"
  :class="classes"
  :placeholder="placeholder"
  :disabled="disabled"
  :readonly="readonly"
  :rows="rows"
  @focus="pristine = false"
)
</template>

<script lang="ts">
import { BooleanProp, EnumProp, NumberProp, StringProp } from '@/util/prop-decorators'
import { toCSSClass } from '@/util/to-class'
import { Component, Model, Vue } from 'vue-facing-decorator'
import { Size } from '../clickables/model'
import { type Input } from './model'

type InputTextareaEmits = {
  (e: 'update:modelValue', value: string): void
  (e: string): void
}

@Component
export default class InputTextarea extends Vue implements Input {
  declare public $emit: InputTextareaEmits

  @Model
  private readonly value!: string

  @BooleanProp()
  public readonly error!: boolean

  @BooleanProp()
  private readonly password!: boolean

  @BooleanProp()
  private readonly noTrim!: boolean

  @StringProp()
  private readonly placeholder?: string

  @BooleanProp()
  public readonly readonly!: boolean

  @EnumProp(Size.MD, ...Object.values(Size))
  private readonly size!: Size

  @NumberProp(3)
  public readonly rows!: number

  public pristine = true

  private get model(): string {
    return this.value === undefined || this.value === null ? '' : String(this.value)
  }

  private set model(value) {
    this.$emit('update:modelValue', value)
  }

  private get disabled(): boolean {
    return this.$attrs.disabled !== undefined && this.$attrs.disabled !== false
  }

  public get normalizedValue(): string {
    return this.noTrim || this.password ? this.model : this.model.trim()
  }

  public get empty(): boolean {
    return this.normalizedValue === ''
  }

  private get classes(): Array<string> {
    return toCSSClass(this.defaultClasses, this.sizeClasses, this.errorClasses, this.readonlyClasses, this.disabledClasses, this.interactionClasses)
  }

  private get defaultClasses(): Array<string> {
    if (this.error || this.disabled || this.readonly) {
      return []
    }
    return ['bg-white', 'text-zinc-900', 'placeholder:text-zinc-400', 'border-zinc-300']
  }

  private get errorClasses(): Array<string> {
    if (this.error) {
      return [
        'bg-white',
        'text-zinc-900',
        'placeholder:text-zinc-400',
        'border-red-400',
        'hover:border-red-500',
        'focus:border-red-500',
        'focus:ring-2',
        'focus:ring-red-400/20',
      ]
    }
    return []
  }

  private get readonlyClasses(): Array<string> {
    if (this.readonly) {
      return ['bg-zinc-50', 'text-zinc-500', 'border-zinc-200', 'cursor-default']
    }
    return []
  }

  private get disabledClasses(): Array<string> {
    if (this.disabled) {
      return ['bg-zinc-50', 'text-zinc-400', 'border-zinc-200', 'select-none', 'cursor-not-allowed']
    }
    return []
  }

  private get sizeClasses(): JsonObject {
    return {
      'min-h-16': this.size === Size.SM,
      'min-h-20': this.size === Size.MD,
      'min-h-24': this.size === Size.LG,
    }
  }

  private get interactionClasses(): Array<string> {
    if (this.disabled || this.readonly) {
      return []
    }
    return ['hover:border-zinc-400', 'focus:border-zinc-400', 'focus:ring-2', 'focus:ring-zinc-400/20']
  }
}
</script>
