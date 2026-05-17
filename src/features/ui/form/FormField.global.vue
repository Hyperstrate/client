<template lang="pug">
ui-input-field(
  :label="$attrs.label"
  :error="(dirty && validationErrorMessages.length > 0) || apiFieldErrors.length > 0"
  :error-messages="allErrorMessages"
  :required="required"
  :optional="!required"
  v-bind="fieldProps"
)
  template(v-for="name of fieldSlotNames" #[name]="props")
    slot(:name="name" v-bind="props")
  template(#default)
    component(:is="input" ref="input" v-model="value" v-bind="inputBindingProps")
      template(v-for="(inputSlotName, name) of inputSlotNameMap" #[inputSlotName]="props")
        slot(:name="name" v-bind="props")
</template>

<script lang="ts">
import { isDef } from '@/util/lang'
import { Mixins } from '@/util/mixin'
import { ObjectProp, OptionalProp, StringProp } from '@/util/prop-decorators'
import { ComponentPublicInstance } from 'vue'
import { Component, Watch } from 'vue-facing-decorator'
import { type Input } from '../inputs/model'
import FormComponent from './form-component'

@Component({
  inheritAttrs: false,
})
export default class FormField extends Mixins(FormComponent) {
  @StringProp(true)
  private readonly input!: string

  @ObjectProp()
  private readonly fieldProps?: Record<string, unknown>

  @ObjectProp()
  private readonly inputProps?: Record<string, unknown>

  @OptionalProp(null)
  private readonly emptyValue?: unknown

  declare public readonly $refs: { input: ComponentPublicInstance & Input }

  private inputRef?: ComponentPublicInstance & Input

  private get fieldSlotNames(): string[] {
    return Object.keys(this.$slots).filter((name) => !name.startsWith('input'))
  }

  private get inputSlotNameMap(): Record<string, string> {
    return Object.fromEntries(
      Object.keys(this.$slots)
        .filter((name) => name.startsWith('input'))
        .map((name) => [name, name[5].toLowerCase() + name.slice(6)]),
    )
  }

  protected mounted(): void {
    this.inputRef = this.$refs.input
  }

  protected updated(): void {
    this.inputRef = this.$refs.input
  }

  private get validationErrorMessages(): string[] {
    const constraints = this.validationErrors.map(({ constraints }) => constraints).filter(isDef)

    return constraints.flatMap<string>(Object.values)
  }

  private get allErrorMessages(): string[] {
    return [...(this.dirty ? this.validationErrorMessages : []), ...this.apiFieldErrors]
  }

  @Watch('value')
  protected onValueChange(): void {
    this.clearApiFieldError()
  }

  protected resolveValue(): unknown {
    if (this.inputRef === undefined) {
      // inputRef not yet assigned (watcher fired before FormField.mounted ran);
      // fall back to the FormComponent value which reads from initialData / valueHolder.
      const fallback = this.value
      return fallback !== undefined && fallback !== null ? fallback : this.emptyValue
    }
    return this.inputRef.empty === false ? this.inputRef.normalizedValue : this.emptyValue
  }

  private get inputBindingProps(): Record<string, unknown> {
    const hasError = (this.dirty && this.validationErrorMessages.length > 0) || this.apiFieldErrors.length > 0
    if (this.inputProps) {
      const fromProps = this.inputProps
      return { ...this.$attrs, ...fromProps, error: Boolean(fromProps.error) || hasError }
    }
    return { ...this.$attrs, error: hasError }
  }
}
</script>
