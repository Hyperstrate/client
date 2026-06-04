<template lang="pug">
div(v-bind="attrs" class="[&>[data-reka-popper-content-wrapper]]:w-[inherit]")
  select-root(v-bind="attrs" v-model="model" :multiple="multiple")
    select-trigger(
      :disabled="disabled"
      class="group flex items-center w-full border rounded-md overflow-hidden outline-hidden cursor-pointer transition-all"
      :class="classes"
    )
      select-value(:placeholder="placeholder" class="flex-1 min-w-0 text-left text-sm px-3 text-zinc-900" :class="{ '!text-zinc-400': empty }")
        slot(name="trigger")
          template(v-if="displayValue")
            span(class="truncate")
              | {{ displayValue }}
      div(class="flex items-center px-2.5 border-l h-full shrink-0 transition-colors" :class="triggerBorderClass")
        ui-icon(icon="chevron-down" class="text-zinc-400 transition-transform duration-200 group-data-[state=open]:rotate-180" size="16")
    select-content(
      v-if="options.length"
      position="popper"
      class="z-50 bg-white rounded-xl border border-zinc-200 shadow-lg min-w-[var(--reka-popper-anchor-width)] overflow-hidden"
    )
      select-viewport(class="p-1.5 max-h-64")
        select-item(
          v-for="(option, index) in options"
          :key="index"
          :value="optionValue(option)"
          class="flex items-center gap-2 px-2.5 py-2 text-sm text-zinc-700 rounded-lg cursor-pointer outline-hidden transition-colors data-[highlighted]:bg-zinc-50 data-[highlighted]:text-zinc-900 data-[state=checked]:bg-zinc-100 data-[state=checked]:text-zinc-900"
        )
          slot(name="option" v-bind="{ option }")
            span(class="flex-1 truncate") {{ optionLabel(option) }}
          select-item-indicator(class="shrink-0 text-zinc-500")
            ui-icon(icon="check" size="16")
</template>

<script lang="ts">
import { ArrayProp, BooleanProp, EnumProp, FunctionProp, OptionalProp, StringProp } from '@/util/prop-decorators'
import { isArray, isEqual, isPlainObject, isString } from 'lodash'
import { SelectContent, SelectItem, SelectItemIndicator, SelectPortal, SelectRoot, SelectTrigger, SelectValue, SelectViewport } from 'reka-ui'
import { Component, Model, Vue } from 'vue-facing-decorator'
import { Size } from '../clickables/model'
import { type Input, type Option, type OptionLabel, type OptionValue } from './model'

type InputSelectEmits = {
  (e: 'update:modelValue', value: unknown): void
  (e: string): void
}

type InputSelectValue<T = unknown> = Option<T> | Option<T>[] | T | T[] | undefined

@Component({
  inheritAttrs: false,
  components: {
    SelectRoot,
    SelectValue,
    SelectTrigger,
    SelectPortal,
    SelectViewport,
    SelectContent,
    SelectItem,
    SelectItemIndicator,
  },
})
export default class InputSelect<T = unknown> extends Vue implements Input {
  declare public $emit: InputSelectEmits

  @Model
  private readonly value!: InputSelectValue<T>

  @ArrayProp(() => [])
  private options!: Option<T>[]

  @OptionalProp()
  private readonly initialValue?: Option<T>

  @BooleanProp()
  public readonly error!: boolean

  @BooleanProp()
  public readonly readonly!: boolean

  @BooleanProp()
  public readonly multiple!: boolean

  @FunctionProp((option?: Option<T>) => option?.label)
  private readonly optionLabel!: OptionLabel<T>

  @FunctionProp((option: Option<T>) => option)
  private readonly optionValue!: OptionValue<T>

  @OptionalProp()
  private readonly unselectedValue?: Option<T>

  @StringProp('Select option')
  private readonly placeholder!: string

  @EnumProp(Size.MD, ...Object.values(Size))
  private readonly size!: Size

  private get model(): InputSelectValue<T> {
    return this.value
  }

  private set model(value: InputSelectValue<T>) {
    this.$emit('update:modelValue', value ?? this.unselectedValue)
  }

  public pristine = true

  private get disabled(): boolean {
    return this.$attrs.disabled !== undefined && this.$attrs.disabled !== false
  }

  private get attrs(): Record<string, unknown> {
    return {
      ...this.$attrs,
      open: this.readonly ? false : undefined,
    }
  }

  public get normalizedValue(): unknown {
    return this.value
  }

  public get empty(): boolean {
    if (isArray(this.value)) return this.value.length === 0
    return this.value === undefined || this.value === null
  }

  private get displayValue(): string {
    const selected = isArray(this.model) ? this.model : [this.model]
    return selected
      .filter((value) => value !== undefined && value !== null)
      .map((value) => this.displayLabel(value))
      .filter((label) => label !== '')
      .join(', ')
  }

  private displayLabel(value: unknown): string {
    if (this.isOption(value)) return this.optionLabel(value)
    const option = this.options.find((candidate) => isEqual(this.optionValue(candidate), value) || isEqual(candidate.value, value) || isEqual(candidate, value))
    if (option) return this.optionLabel(option)
    return isString(value) ? value : ''
  }

  private isOption(value: unknown): value is Option<T> {
    if (!isPlainObject(value)) return false
    const record = value as Record<string, unknown>
    return 'label' in record && 'value' in record
  }

  private get classes(): Array<unknown> {
    return [...this.defaultClasses, this.sizeClasses]
  }

  private get defaultClasses(): Array<string> {
    if (this.disabled) {
      return ['bg-zinc-50', 'border-zinc-200', 'cursor-not-allowed', 'text-zinc-400']
    }
    if (this.readonly) {
      return ['bg-zinc-50', 'border-zinc-200', 'cursor-default', 'text-zinc-500']
    }
    if (this.error) {
      return [
        'bg-white',
        'border-red-400',
        'text-zinc-900',
        'hover:border-red-500',
        'focus:border-red-500',
        'focus:ring-2',
        'focus:ring-red-400/20',
        'data-[state=open]:border-red-500',
        'data-[state=open]:ring-2',
        'data-[state=open]:ring-red-400/20',
      ]
    }
    return [
      'bg-white',
      'border-zinc-300',
      'hover:border-zinc-400',
      'focus:border-zinc-400',
      'focus:ring-2',
      'focus:ring-zinc-400/20',
      'data-[state=open]:border-zinc-400',
      'data-[state=open]:ring-2',
      'data-[state=open]:ring-zinc-400/20',
      'text-zinc-900',
    ]
  }

  private get triggerBorderClass(): string {
    if (this.disabled || this.readonly) return 'border-zinc-200'
    if (this.error) return 'border-red-300'
    return 'border-zinc-300'
  }

  private get sizeClasses(): JsonObject {
    return {
      'min-h-6 max-h-6': this.size === Size.SM,
      'min-h-8 max-h-8': this.size === Size.MD,
      'min-h-10 max-h-10': this.size === Size.LG,
    }
  }

  private mounted(): void {
    if (this.initialValue) {
      this.model = this.initialValue
    }
  }
}
</script>
