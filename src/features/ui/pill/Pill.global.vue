<template lang="pug">
span(:class="classes")
  slot
</template>

<script lang="ts">
import { EnumProp } from '@/util/prop-decorators'
import { Component, Vue } from 'vue-facing-decorator'
import { Variant } from '../clickables/model'

const COLOR_CLASSES: Record<Variant, string> = {
  [Variant.Dark]: 'bg-zinc-900 text-white',
  [Variant.Gray]: 'bg-gray-100 text-gray-600',
  [Variant.Blue]: 'bg-blue-100 text-blue-700',
  [Variant.Green]: 'bg-green-100 text-green-700',
  [Variant.Red]: 'bg-red-100 text-red-700',
  [Variant.Orange]: 'bg-orange-100 text-orange-700',
  [Variant.Purple]: 'bg-purple-100 text-purple-700',
  [Variant.Indigo]: 'bg-indigo-100 text-indigo-700',
}

@Component
export default class Pill extends Vue {
  @EnumProp(Variant.Gray, ...Object.values(Variant))
  public readonly variant!: Variant

  public get classes(): string {
    return `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${COLOR_CLASSES[this.variant]}`
  }
}
</script>
