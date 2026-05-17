<template lang="pug">
div(class="relative w-fit")
  slot(name="content")
  div(v-if="$slots['default']" class="absolute rounded-full flex items-center justify-center shrink-0" :class="[positionClasses, variantClasses, sizeClasses]")
    slot
</template>

<script lang="ts">
import { EnumProp } from '@/util/prop-decorators'
import { Component, Vue } from 'vue-facing-decorator'
import { Size, Variant } from '../clickables/model'
import { IndicatorPosition } from './model'

@Component
export default class Indicator extends Vue {
  @EnumProp(Variant.Blue, ...Object.values(Variant))
  public readonly variant!: Variant

  @EnumProp(IndicatorPosition.TOP_RIGHT, ...Object.values(IndicatorPosition))
  public readonly position!: IndicatorPosition

  @EnumProp(Size.MD, ...Object.values(Size))
  public readonly size!: Size

  private get positionClasses(): string[] {
    switch (this.position) {
      case IndicatorPosition.TOP_RIGHT:
        return ['top-0', 'right-0', 'translate-x-1/2', '-translate-y-1/2']
      case IndicatorPosition.TOP_LEFT:
        return ['top-0', 'left-0', '-translate-x-1/2', '-translate-y-1/2']
      case IndicatorPosition.BOTTOM_RIGHT:
        return ['bottom-0', 'right-0', 'translate-x-1/2', 'translate-y-1/2']
      case IndicatorPosition.BOTTOM_LEFT:
        return ['bottom-0', 'left-0', '-translate-x-1/2', 'translate-y-1/2']
      case IndicatorPosition.TOP_CENTER:
        return ['top-0', 'left-1/2', '-translate-x-1/2', '-translate-y-1/2']
      case IndicatorPosition.BOTTOM_CENTER:
        return ['bottom-0', 'left-1/2', '-translate-x-1/2', 'translate-y-1/2']
      default:
        return ['top-0', 'right-0', 'translate-x-1/2', '-translate-y-1/2']
    }
  }

  private get variantClasses(): string[] {
    switch (this.variant) {
      case Variant.Dark:
        return ['bg-zinc-900', 'text-white']
      case Variant.Gray:
        return ['bg-zinc-500', 'text-white']
      case Variant.Blue:
        return ['bg-blue-600', 'text-white']
      case Variant.Green:
        return ['bg-emerald-600', 'text-white']
      case Variant.Red:
        return ['bg-red-600', 'text-white']
      case Variant.Orange:
        return ['bg-amber-500', 'text-white']
      case Variant.Purple:
        return ['bg-purple-600', 'text-white']
      case Variant.Indigo:
        return ['bg-indigo-600', 'text-white']
      default:
        return ['bg-blue-600', 'text-white']
    }
  }

  private get sizeClasses(): string[] {
    switch (this.size) {
      case Size.XS:
        return ['w-2', 'h-2']
      case Size.SM:
        return ['w-3', 'h-3']
      case Size.MD:
        return ['w-6', 'h-6']
      case Size.LG:
        return ['w-8', 'h-8']
      default:
        return ['w-6', 'h-6']
    }
  }
}
</script>
