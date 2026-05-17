<template lang="pug">
ui-input-text(
  v-bind="$attrs"
  v-model="model"
  :error="error"
  :no-trim="noTrim"
  :placeholder="placeholder"
  :readonly="readonly"
  :size="size"
  :disabled="disabled"
  @focus="pristine = false"
)
  template(#after)
    ui-icon(icon="search" size="16")
</template>

<script lang="ts">
import { BooleanProp, EnumProp, NumberProp, StringProp } from '@/util/prop-decorators'
import { Component, Model, Vue } from 'vue-facing-decorator'
import { Size } from '../clickables/model'
import { debounce, DebouncedFunc } from 'lodash'

type InputSearchEmits = {
  (e: 'update:modelValue', value: string): void
  (e: string): void
}

@Component({ inheritAttrs: false })
export default class InputSearch extends Vue {
  declare public $emit: InputSearchEmits

  @Model
  protected readonly value!: string

  @BooleanProp()
  public readonly error!: boolean

  @BooleanProp()
  protected readonly noTrim!: boolean

  @StringProp()
  protected readonly placeholder?: string

  @BooleanProp()
  protected readonly readonly!: boolean

  @EnumProp(Size.MD, ...Object.values(Size))
  protected readonly size!: Size

  @NumberProp(200)
  protected readonly debounceMs!: number

  public pristine = true

  protected get model(): string {
    return this.value === undefined || this.value === null ? '' : String(this.value)
  }

  protected set model(value) {
    this.debouncedUpdateModelValue(value)
  }

  private get debouncedUpdateModelValue(): DebouncedFunc<(value: string) => void> {
    return debounce((value: string) => this.$emit('update:modelValue', value), this.debounceMs)
  }

  private get disabled(): boolean {
    return this.$attrs.disabled !== undefined && this.$attrs.disabled !== false
  }

  public get normalizedValue(): string {
    return this.model
  }

  public get empty(): boolean {
    return this.normalizedValue === ''
  }
}
</script>
