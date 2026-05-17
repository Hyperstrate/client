<template lang="pug">
input(
  ref="inputRef"
  v-model="model"
  v-bind="$attrs"
  :type="inputType"
  :placeholder="placeholder"
  :readonly="readonly"
  :disabled="disabled"
  class="h-full bg-transparent px-2 py-1 outline-hidden grow text-sm placeholder:text-zinc-400"
)
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
export default class InputBare extends Vue implements Input {
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

  @BooleanProp(false)
  public readonly autofocus!: boolean

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

  public mounted(): void {
    if (this.autofocus) this.inputRef?.focus()
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

  private onClick(): void {
    this.inputRef.focus()
  }
}
</script>
