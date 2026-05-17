<template lang="pug">
component(:is="ToggleGroupRoot" :model-value="value" type="single" class="relative flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5" @update:model-value="select")
  div(
    v-if="activeIndex >= 0"
    class="pointer-events-none absolute top-0.5 bottom-0.5 rounded-md bg-white shadow-xs transition-all duration-200 ease-out"
    :style="indicatorStyle"
  )
  component(:is="ToggleGroupItem" v-for="(option, index) in options" :key="String(option.value)" :value="option" as-child)
    ui-clickable(tag="button" :class="buttonClasses")
      slot(:option="option" :index="index" :active="isSelected(option)") {{ option.label }}
</template>

<script lang="ts">
import { type AnimatedIndicator, useAnimatedIndicator } from '@/features/ui/animated-indicator/use-animated-indicator'
import { type Option } from '@/features/ui/inputs/model'
import { ArrayProp, StringProp } from '@/util/prop-decorators'
import { ToggleGroupItem, ToggleGroupRoot } from 'reka-ui'
import { markRaw, nextTick } from 'vue'
import { Component, Model, Setup, Vue, Watch } from 'vue-facing-decorator'

type ButtonGroupEmits = {
  (e: 'update:modelValue', value: Option<unknown>): void
  (e: string): void
}

@Component({ emits: ['update:modelValue'] })
export default class ButtonGroup<T = unknown> extends Vue {
  public readonly ToggleGroupRoot = markRaw(ToggleGroupRoot)
  public readonly ToggleGroupItem = markRaw(ToggleGroupItem)

  @Setup(() => useAnimatedIndicator({ strategy: 'width' }))
  private readonly indicator!: AnimatedIndicator

  declare public $emit: ButtonGroupEmits

  @Model
  private readonly value?: Option<T>

  @ArrayProp(true)
  public readonly options!: Option<T>[]

  @StringProp('sm')
  public readonly size!: 'sm' | 'md'

  private get activeIndex(): number {
    return this.options.findIndex((o) => o.value === this.value?.value)
  }

  private get indicatorStyle(): Record<string, string> {
    return this.indicator.style.value
  }

  public isSelected(option: Option<T>): boolean {
    return option.value === this.value?.value
  }

  public get buttonClasses(): string {
    return [
      'relative z-10 flex-1 items-center justify-center rounded-md border border-transparent bg-transparent shadow-none',
      'font-medium whitespace-nowrap transition-colors duration-150',
      'text-gray-500 hover:text-gray-700 data-[state=on]:text-gray-900',
      'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-400',
      this.size === 'md' ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-1 text-xs',
    ].join(' ')
  }

  mounted(): void {
    this.updateIndicator()
    this.indicator.observe(this.$el as HTMLElement, () => this.updateIndicator())
  }

  beforeUnmount(): void {
    this.indicator.disconnect()
  }

  @Watch('value', { deep: true })
  @Watch('options', { deep: true })
  @Watch('size')
  public async onLayoutChange(): Promise<void> {
    await nextTick()
    this.updateIndicator()
  }

  private updateIndicator(): void {
    const root = this.$el as HTMLElement
    const buttons = root.querySelectorAll<HTMLElement>('button')
    const active = buttons[this.activeIndex]
    this.indicator.update(root, active)
  }

  public select(option: Option<T> | undefined): void {
    if (!option) return
    this.$emit('update:modelValue', option)
  }
}
</script>
