<template lang="pug">
div(
  class="flex items-center justify-stretch min-w-48 text-sm font-normal border rounded-md outline-hidden transition-colors"
  :class="wrapperClasses"
  v-bind="$attrs"
  @click="onClick"
)
  div(v-if="$slots['before']" class="flex items-center px-2 select-none h-full border-r" :class="slotBorderClass")
    slot(name="before")
  input(
    ref="inputRef"
    v-model="model"
    v-bind="$attrs"
    :class="inputClasses"
    :type="inputType"
    :placeholder="placeholder"
    :readonly="readonly"
    :disabled="disabled"
    class="h-full bg-transparent px-2 py-1 outline-hidden grow text-sm placeholder:text-zinc-400"
  )
  div(v-if="$slots['after']" class="flex items-center px-2 select-none h-full border-l" :class="slotBorderClass")
    slot(name="after")
</template>

<script lang="ts">
import { BooleanProp, EnumProp, StringProp } from '@/util/prop-decorators'
import { Component, Model, Ref, Vue } from 'vue-facing-decorator'
import { Size } from '../clickables/model'
import { InputTextType, type Input } from './model'

type InputTextEmits = {
  (e: 'update:modelValue', value: string): void
  (e: string): void
}

@Component({ inheritAttrs: false })
export default class InputText extends Vue implements Input {
  declare public $emit: InputTextEmits

  @Model
  protected readonly value!: string

  @BooleanProp()
  public readonly error!: boolean

  @BooleanProp()
  protected readonly password!: boolean

  @BooleanProp()
  protected readonly noTrim!: boolean

  @StringProp()
  protected readonly placeholder?: string

  @StringProp()
  protected readonly type?: InputTextType

  @BooleanProp()
  protected readonly readonly!: boolean

  @EnumProp(Size.MD, ...Object.values(Size))
  protected readonly size!: Size

  @Ref
  protected inputRef!: HTMLInputElement

  public pristine = true

  protected get model(): string {
    return this.value === undefined || this.value === null ? '' : String(this.value)
  }

  protected set model(value) {
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

  private get inputType(): string | InputTextType {
    if (this.type) return this.type
    if (this.password) return InputTextType.PASSWORD
    return InputTextType.TEXT
  }

  public get wrapperClasses(): Array<unknown> {
    return [this.stateClasses, this.sizeClasses]
  }

  private get stateClasses(): string {
    if (this.disabled) {
      return 'bg-zinc-50 border-zinc-200 text-zinc-400 cursor-not-allowed'
    }
    if (this.readonly) {
      return 'bg-zinc-50 border-zinc-200 text-zinc-500 cursor-default'
    }
    if (this.error) {
      return 'bg-white border-red-400 text-zinc-900 cursor-text hover:border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-400/20'
    }
    return 'bg-white border-zinc-300 text-zinc-900 cursor-text hover:border-zinc-400 focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-400/20'
  }

  public get slotBorderClass(): string {
    if (this.disabled || this.readonly) return 'border-zinc-200'
    if (this.error) return 'border-red-300'
    return 'border-zinc-300'
  }

  private get inputClasses(): JsonObject {
    return { 'cursor-[inherit]': true }
  }

  private get sizeClasses(): JsonObject {
    return {
      'min-h-6 max-h-6 h-6': this.size === Size.SM,
      'min-h-8 max-h-8 h-8': this.size === Size.MD,
      'min-h-10 max-h-10 h-10': this.size === Size.LG,
    }
  }

  private onClick(): void {
    this.inputRef.focus()
  }
}
</script>
