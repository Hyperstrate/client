<template lang="pug">
div(ref="tabBarRef" :class="containerClasses")
  slot
  div(class="indicator absolute opacity-0 pointer-events-none" :class="[indicatorClasses, indicatorDesignClasses]" :style="indicatorStyle" role="presentation")
</template>

<script lang="ts">
import { type AnimatedIndicator, type AnimatedIndicatorClasses, useAnimatedIndicator } from '@/features/ui/animated-indicator/use-animated-indicator'
import { FunctionProp, StringProp } from '@/util/prop-decorators'
import { isEqual } from 'lodash'
import { type ComponentPublicInstance } from 'vue'
import { Component, Model, Ref, Setup, Vue, Watch } from 'vue-facing-decorator'
import { TAB_BAR } from './model'

type TabBarEmits = {
  (e: 'update:modelValue', value: unknown): void
  (e: string): void
}

type TabButtonInstance = ComponentPublicInstance & {
  readonly value: unknown
  readonly $el: Element
}

@Component({
  provide() {
    return { [TAB_BAR]: this }
  },
})
export default class TabBar extends Vue {
  declare public $emit: TabBarEmits

  @Model
  public value!: unknown

  @FunctionProp(isEqual)
  private readonly matchValue!: (selectedValue: unknown, buttonValue: unknown) => boolean

  @StringProp('line')
  public readonly variant!: 'line' | 'pill'

  @Ref
  private tabBarRef?: HTMLElement

  private selected: TabButtonInstance | undefined = undefined

  @Setup(() =>
    useAnimatedIndicator({
      strategy: 'edges',
      scrollPadding: 40,
      onError: (error) => console.warn('Error updating indicator:', error),
    }),
  )
  private readonly indicator!: AnimatedIndicator

  public get indicatorClasses(): AnimatedIndicatorClasses {
    return this.indicator.classes
  }

  public get indicatorStyle(): Record<string, string> {
    return this.indicator.style.value
  }

  public get containerClasses(): string {
    if (this.variant === 'pill') {
      return 'relative flex grow-0 shrink-0 overflow-x-auto rounded-lg bg-gray-100 p-0.5'
    }

    return 'relative flex grow-0 shrink-0 overflow-x-auto will-change-transform transition-[left] border-b border-zinc-200'
  }

  public get indicatorDesignClasses(): string {
    if (this.variant === 'pill') {
      return 'z-0 top-0.5 bottom-0.5 rounded-md bg-white shadow-xs'
    }

    return 'z-10 bottom-0 h-0.5 bg-zinc-900'
  }

  public get buttonClasses(): string {
    if (this.variant === 'pill') {
      return 'relative z-10 flex-1 rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap text-gray-500 transition-colors duration-150 hover:text-gray-700'
    }

    return 'relative px-4 py-2.5 text-sm font-medium transition-colors duration-150 text-zinc-500 hover:text-zinc-800'
  }

  public get selectedButtonClasses(): string {
    return this.variant === 'pill' ? 'text-gray-900' : 'text-zinc-900'
  }

  public isSelected(button: TabButtonInstance): boolean {
    if (this.selected) {
      return this.selected === button
    }

    if (this.matchValue(this.value, button.value)) {
      this.select(button)
      return true
    }

    return false
  }

  public select(button: TabButtonInstance): void {
    if (this.selected === button) return

    this.selected = button
    this.$emit('update:modelValue', button.value)
  }

  public remove(button: TabButtonInstance): void {
    if (this.selected === button) {
      this.selected = undefined
    }
  }

  @Watch('value')
  public onValueChange(newValue: unknown, oldValue: unknown): void {
    if (isEqual(newValue, oldValue)) {
      return
    }

    if (this.selected && !this.matchValue(newValue, this.selected.value)) {
      this.selected = undefined
    }
  }

  @Watch('selected')
  public updateIndicator(): void {
    void this.$nextTick(() => {
      this.indicator.update(this.tabBarRef, this.selected?.$el as Element | undefined)
    })
  }

  mounted(): void {
    this.updateIndicator()
    this.indicator.observe(this.tabBarRef, () => this.updateIndicator())
  }

  beforeUnmount(): void {
    this.indicator.disconnect()
  }
}
</script>

<style lang="scss" scoped>
// Hide scrollbar while preserving scroll functionality
div {
  scrollbar-width: none; // Firefox

  &::-webkit-scrollbar {
    display: none; // Chrome / Safari / Edge
  }
}

.indicator {
  transition: opacity 0.3s ease;
  will-change: left, right, opacity;

  &.on {
    opacity: 1;
  }

  &.left {
    transition:
      left 0.2s ease-out,
      right 0.15s ease-out 0.05s,
      opacity 0.3s ease;
  }

  &.right {
    transition:
      left 0.15s ease-out 0.05s,
      right 0.2s ease-out,
      opacity 0.3s ease;
  }
}
</style>
