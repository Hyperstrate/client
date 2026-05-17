<template lang="pug">
ui-clickable(:class="classes")
  template(v-for="(slot, name) in $slots" #[name]="props")
    slot(:name="name" v-bind="props")
</template>

<script lang="ts">
import { EnumProp } from '@/util/prop-decorators'
import { toCSSClass } from '@/util/to-class'
import { Component, Vue } from 'vue-facing-decorator'
import { Size, Variant } from './model'

@Component
export default class Link extends Vue {
  @EnumProp(Size.MD, ...Object.values(Size))
  private readonly size!: Size

  @EnumProp(Variant.Dark, ...Object.values(Variant))
  private readonly variant!: Variant

  private get disabled(): boolean {
    return this.$attrs.disabled !== undefined && this.$attrs.disabled !== false
  }

  private get classes(): Array<string> {
    return toCSSClass({
      ...this.sizeClasses,
      ...this.colorClasses,
      'cursor-pointer': !this.disabled,
      'underline box-border': true,
    })
  }

  private get sizeClasses(): JsonObject {
    return {
      'flex gap-1 items-center justify-center px-3 py-1.5 min-h-8 max-h-8 text-xs font-medium': this.size === Size.SM,
      'flex gap-2 items-center justify-center px-4 py-2 min-h-10 max-h-10 text-sm font-medium': this.size === Size.MD,
      'flex gap-2 items-center justify-center px-4 py-3 min-h-12 max-h-12 text-sm font-medium': this.size === Size.LG,
    }
  }

  private get colorClasses(): JsonObject {
    if (this.disabled) {
      return { 'cursor-default text-zinc-400': true }
    }
    return {
      'text-zinc-800': this.variant === Variant.Dark,
      'text-zinc-500': this.variant === Variant.Gray,
      'text-blue-600': this.variant === Variant.Blue,
      'text-emerald-600': this.variant === Variant.Green,
      'text-red-600': this.variant === Variant.Red,
      'text-amber-600': this.variant === Variant.Orange,
      'text-purple-600': this.variant === Variant.Purple,
      'text-indigo-600': this.variant === Variant.Indigo,
    }
  }
}
</script>
