<template lang="pug">
combobox-root(
  v-bind="$attrs"
  v-model="model"
  v-model:open="isOpen"
  :filter-function="filterFunction ?? filter"
  :reset-search-term-on-blur="true"
  :reset-search-term-on-select="resetSearchOnSelect"
  :multiple="multiple"
  :by="compareOptions"
)
  combobox-anchor(class="flex items-center border rounded-md overflow-hidden transition-colors" :class="anchorClasses")
    //- Wrapper keeps input always in DOM (focusable); overlay sits on top when a value is selected
    div(class="relative flex-1 min-w-0 self-stretch")
      combobox-input(
        ref="inputRef"
        v-model="searchTerm"
        :placeholder="showSelectedDisplay ? '' : placeholderText"
        :disabled="disabled"
        :readonly="readonly"
        :title="inputTitle"
        :display-value="optionLabel"
        class="absolute inset-0 w-full h-full px-3 bg-transparent text-sm outline-hidden placeholder:text-zinc-400"
        :class="{ 'cursor-not-allowed text-zinc-400': disabled, 'cursor-default text-zinc-500': readonly && !disabled, 'text-zinc-900': !disabled && !readonly, '!text-transparent caret-transparent select-none': showSelectedDisplay }"
        @update:model-value="onSearch"
        @click.stop="openAndFocus"
      )
      //- Rich selected display — overlays the input when closed with a value
      div(v-if="showSelectedDisplay" v-loading="loading" class="absolute inset-0 flex items-center px-3 cursor-text" @mousedown.prevent="openAndFocus")
        slot(v-if="multiple && hasSelectedMultipleSlot" name="selected-multiple" v-bind="selectedSlotProps")
        slot(v-else-if="!multiple && hasSelectedSlot" name="selected" v-bind="selectedSlotProps")
        span(v-else data-testid="combobox-selected-display" class="truncate text-sm text-zinc-900") {{ selectedDisplayValue }}
    template(v-if="multiple && count")
      ui-icon-button(icon="close" :icon-size="14" :size="Size.XS" :variant="Variant.Gray" square class="mx-1 shrink-0" @click.stop="onClear")
    combobox-trigger(
      :disabled="disabled || readonly"
      class="flex items-center px-2.5 border-l h-full shrink-0 transition-colors"
      :class="[triggerBorderClass, { 'cursor-not-allowed': disabled }]"
    )
      ui-icon(icon="chevron-down" class="text-zinc-400 transition-transform duration-200" :class="{ 'rotate-180': isOpen }" size="16")
  combobox-content(
    position="popper"
    align="start"
    class="z-50 bg-white rounded-xl border border-zinc-200 shadow-lg w-[var(--reka-combobox-trigger-width)] overflow-hidden"
  )
    combobox-viewport(class="p-1.5 max-h-64" @scroll="onScroll")
      div(v-if="loading" v-loading="loading" class="flex items-center justify-center py-4")
      combobox-empty(v-if="!loading" class="px-2.5 py-2 text-sm text-zinc-400 text-center") No results found.
      combobox-item(
        v-for="(option, index) in options"
        :key="index"
        :value="optionValue(option)"
        class="flex items-center gap-2 px-2.5 py-2 text-sm text-zinc-700 rounded-lg cursor-pointer outline-hidden transition-colors data-[highlighted]:bg-zinc-50 data-[highlighted]:text-zinc-900 data-[state=checked]:bg-zinc-100 data-[state=checked]:text-zinc-900"
        :title="option.label"
      )
        slot(name="option" v-bind="{ option }")
          div(v-if="multiple" class="flex items-center gap-2 flex-1 min-w-0")
            ui-input-checkbox(:model-value="isSelected(option)" @click.stop.prevent)
            span(class="truncate") {{ optionLabel(option) }}
          template(v-else)
            span(class="flex-1 truncate") {{ optionLabel(option) }}
        combobox-item-indicator(v-if="!multiple" class="shrink-0 text-zinc-500")
          ui-icon(icon="check" size="16")
</template>

<script lang="ts">
import { isArray } from '@/util/lang'
import { ArrayProp, BooleanProp, EnumProp, FunctionProp, OptionalProp, StringProp } from '@/util/prop-decorators'
import { isEmpty, isEqual, isPlainObject, isString } from 'lodash'
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxViewport,
} from 'reka-ui'
import { Component, Model, Ref, Vue, Watch } from 'vue-facing-decorator'
import { Size, Variant } from '../clickables/model'
import { type FilterFunction, type Input, type Option, type OptionLabel, type OptionValue } from './model'

type InputComboboxEmits<T, K extends boolean = false> = {
  (e: 'update:modelValue', value: InputComboboxValue<T, K> | undefined): void
  (e: 'update:open', value: boolean): void
  (e: 'search', value: string): void
  (e: 'scrolled-to-bottom'): void
  (e: string): void
}

type InputComboboxValue<T = unknown, K extends boolean = false> = K extends true ? Option<T>[] : Option<T>

@Component({
  inheritAttrs: false,
  emits: ['update:modelValue', 'update:open', 'search', 'scrolled-to-bottom'],
  components: {
    ComboboxRoot,
    ComboboxAnchor,
    ComboboxInput,
    ComboboxTrigger,
    ComboboxViewport,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxItemIndicator,
  },
})
export default class InputCombobox<T = unknown, K extends boolean = false> extends Vue implements Input {
  public readonly Size = Size
  public readonly Variant = Variant

  @Model
  private readonly value!: InputComboboxValue<T, K>

  private isOpen = false

  @Watch('isOpen')
  private onIsOpenChange(val: boolean): void {
    this.$emit('update:open', val)
  }

  @Ref
  private readonly inputRef?: { $el: HTMLInputElement }

  @ArrayProp(() => [])
  private options!: Option<T>[]

  @BooleanProp()
  public readonly error!: boolean

  @BooleanProp()
  public readonly readonly!: boolean

  @BooleanProp()
  public readonly loading!: boolean

  @BooleanProp()
  public readonly multiple!: K

  @FunctionProp((option?: Option<T>) => option?.label)
  private readonly optionLabel!: OptionLabel<T>

  @FunctionProp((option: Option<T>) => option)
  private readonly optionValue!: OptionValue<T>

  @FunctionProp()
  private readonly filterFunction?: FilterFunction<T>

  @OptionalProp()
  private readonly unselectedValue?: Option<T>

  @StringProp('Search...')
  private readonly placeholder!: string

  @EnumProp(Size.MD, ...Object.values(Size))
  private readonly size!: Size

  @BooleanProp(false)
  public readonly resetSearchOnSelect!: boolean

  declare public $emit: InputComboboxEmits<T, K>

  private searchTerm?: string

  private mounted(): void {
    if (!this.multiple && this.model) {
      this.searchTerm = this.optionLabel(this.model as Option<T>)
    }
  }

  @Watch('value')
  private onValueChange(newValue: InputComboboxValue<T, K> | undefined): void {
    if (isEmpty(newValue)) {
      this.searchTerm = ''
    } else if (!this.multiple) {
      this.searchTerm = this.optionLabel(newValue as Option<T>)
    }
  }

  private get model(): InputComboboxValue<T, K> {
    return this.value
  }

  private set model(value) {
    this.$emit('update:modelValue', value ?? this.unselectedValue)
  }

  private filter(options: Option<T>[], searchTerm: string): Option<T>[] {
    return options.filter((option) => this.optionLabel(option).toLowerCase().includes(searchTerm.toLowerCase()))
  }

  private compareOptions(a: Option<T>, b: Option<T>): boolean {
    const aId = (a?.value as Record<string, unknown>)?.id
    const bId = (b?.value as Record<string, unknown>)?.id
    if (aId !== undefined && bId !== undefined) return aId === bId
    return isEqual(a, b)
  }

  public pristine = true

  private get disabled(): boolean {
    return this.$attrs.disabled !== undefined && this.$attrs.disabled !== false
  }

  private get anchorClasses(): Array<unknown> {
    return [...this.defaultClasses, this.sizeClasses]
  }

  private get defaultClasses(): Array<string> {
    if (this.disabled) {
      return ['bg-zinc-50', 'border-zinc-200', 'text-zinc-400', 'cursor-not-allowed']
    }
    if (this.readonly) {
      return ['bg-zinc-50', 'border-zinc-200', 'text-zinc-500', 'cursor-default']
    }
    if (this.error) {
      return [
        'bg-white',
        'border-red-400',
        'text-zinc-900',
        'hover:border-red-500',
        'focus-within:border-red-500',
        'focus-within:ring-2',
        'focus-within:ring-red-400/20',
      ]
    }
    return [
      'bg-white',
      'border-zinc-300',
      'text-zinc-900',
      'hover:border-zinc-400',
      'focus-within:border-zinc-400',
      'focus-within:ring-2',
      'focus-within:ring-zinc-400/20',
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

  private get hasSelectedSlot(): boolean {
    return !!this.$slots.selected
  }

  private get hasSelectedMultipleSlot(): boolean {
    return !!this.$slots['selected-multiple']
  }

  public get normalizedValue(): unknown {
    return this.value
  }

  public get empty(): boolean {
    if (isArray(this.value)) return this.value.length === 0
    return this.value === undefined || this.value === null
  }

  private get count(): number {
    if (isArray(this.model)) return this.model.length
    return 0
  }

  private get placeholderText(): string {
    if (this.multiple && this.count > 0) return `${this.count} selected`
    return this.placeholder
  }

  private get inputTitle(): string {
    return this.selectedDisplayValue
  }

  private get showSelectedDisplay(): boolean {
    return !this.isOpen && !this.empty && (this.hasSelectedSlot || this.hasSelectedMultipleSlot || this.multiple)
  }

  private get selectedSlotProps(): Record<string, unknown> {
    const options = this.selectedOptions
    return {
      option: options[0],
      options,
      selectedOptions: options,
      multiple: this.multiple,
      displayValue: this.selectedDisplayValue,
      count: options.length,
      loading: this.loading,
    }
  }

  private get selectedDisplayValue(): string {
    return this.selectedOptions
      .map((option) => this.optionLabel(option))
      .filter((label) => label !== '')
      .join(', ')
  }

  private get selectedOptions(): Option<T>[] {
    const selected = isArray(this.model) ? this.model : [this.model]
    return selected.filter((value) => value !== undefined && value !== null).map((value) => this.toDisplayOption(value))
  }

  private toDisplayOption(value: unknown): Option<T> {
    if (this.isOption(value)) return value
    const option = this.options.find((candidate) => isEqual(this.optionValue(candidate), value) || isEqual(candidate.value, value) || isEqual(candidate, value))
    if (option) return option
    return { value: value as T, label: isString(value) ? value : '' }
  }

  private isOption(value: unknown): value is Option<T> {
    if (!isPlainObject(value)) return false
    const record = value as Record<string, unknown>
    return 'label' in record && 'value' in record
  }

  private selectedValue(value: unknown): unknown {
    return this.isOption(value) ? this.optionValue(value) : value
  }

  private isSelected(option: Option<T>): boolean {
    if (!this.model) return false
    const currentValue = this.optionValue(option)
    if (isArray(this.model)) {
      return this.model.some((value) => isEqual(this.selectedValue(value), currentValue) || isEqual(value, currentValue))
    }
    return isEqual(this.selectedValue(this.model), currentValue) || isEqual(this.model, currentValue)
  }

  public openAndFocus(): void {
    this.isOpen = true
    void this.$nextTick(() => {
      this.inputRef?.$el?.focus()
    })
  }

  public toggle(): void {
    this.isOpen = !this.isOpen
  }

  public open(): void {
    this.isOpen = true
  }

  public close(): void {
    this.isOpen = false
  }

  private onSearch(value: string): void {
    if (!this.multiple && value === '' && !this.empty) {
      this.$emit('update:modelValue', this.unselectedValue as InputComboboxValue<T, K> | undefined)
    }
    this.$emit('search', value)
  }

  private onScroll(e: Event): void {
    const target = e.target as HTMLElement
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 10) {
      this.$emit('scrolled-to-bottom')
    }
  }

  private onClear(): void {
    if (this.multiple) {
      this.$emit('update:modelValue', [] as unknown as InputComboboxValue<T, K>)
    }
  }
}
</script>
