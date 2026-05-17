<template lang="pug">
span(:class="classes")
  span(v-if="dot" :class="dotClasses")
  slot
</template>

<script lang="ts">
import { BooleanProp, EnumProp } from '@/util/prop-decorators'
import { Component, Vue } from 'vue-facing-decorator'
import { Size, Variant } from '../clickables/model'

const COLOR_CLASSES: Record<Variant, string> = {
  [Variant.Dark]: 'bg-zinc-900 text-white ring-zinc-700/30',
  [Variant.Gray]: 'bg-gray-100 text-gray-600 ring-gray-500/20',
  [Variant.Blue]: 'bg-blue-50 text-blue-700 ring-blue-700/20',
  [Variant.Green]: 'bg-green-50 text-green-700 ring-green-600/20',
  [Variant.Red]: 'bg-red-50 text-red-700 ring-red-600/20',
  [Variant.Orange]: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  [Variant.Purple]: 'bg-purple-50 text-purple-700 ring-purple-700/20',
  [Variant.Indigo]: 'bg-indigo-50 text-indigo-700 ring-indigo-700/20',
}

const DOT_CLASSES: Record<Variant, string> = {
  [Variant.Dark]: 'bg-white',
  [Variant.Gray]: 'bg-gray-500',
  [Variant.Blue]: 'bg-blue-600',
  [Variant.Green]: 'bg-green-600',
  [Variant.Red]: 'bg-red-600',
  [Variant.Orange]: 'bg-orange-600',
  [Variant.Purple]: 'bg-purple-600',
  [Variant.Indigo]: 'bg-indigo-600',
}

const SIZE_CLASSES: Record<Size, string> = {
  [Size.XS]: 'px-1 py-1 text-xs',
  [Size.SM]: 'px-1.5 py-1 text-xs',
  [Size.MD]: 'px-2 py-1 text-xs',
  [Size.LG]: 'px-2.5 py-1 text-sm',
}

@Component
export default class Badge extends Vue {
  @EnumProp(Variant.Gray, ...Object.values(Variant))
  public readonly variant!: Variant

  @EnumProp(Size.MD, ...Object.values(Size))
  public readonly size!: Size

  @BooleanProp(false)
  public readonly dot!: boolean

  public get classes(): string {
    return `inline-flex items-center gap-1 rounded-md type-button ring-1 ring-inset shrink-0 ${SIZE_CLASSES[this.size]} ${COLOR_CLASSES[this.variant]}`
  }

  public get dotClasses(): string {
    return `w-1.5 h-1.5 rounded-full shrink-0 ${DOT_CLASSES[this.variant]}`
  }
}
</script>
