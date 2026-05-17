<template lang="pug">
ui-clickable(tag="button" :class="classes" :size="size" :disabled="disabled" :aria-busy="busy ? 'true' : undefined" @click="onClick")
  div(v-if="busy" :class="spinnerClasses")
  template(v-if="$slots.before")
    slot(name="before")
  slot
  template(v-if="$slots.after")
    slot(name="after")
</template>

<script lang="ts">
import { BooleanProp, EnumProp } from '@/util/prop-decorators'
import { Component, Vue } from 'vue-facing-decorator'
import { Size, Variant } from './model'

type ButtonEmits = {
  (e: 'click', event: MouseEvent): void
  (e: string): void
}

@Component({
  emits: ['click'],
})
export default class Button extends Vue {
  @BooleanProp(false)
  public rounded!: boolean

  @BooleanProp(false)
  public square!: boolean

  @BooleanProp(false)
  public outlined!: boolean

  @BooleanProp(false)
  public busy!: boolean

  @BooleanProp(false)
  public block!: boolean

  @EnumProp(Size.MD, ...Object.values(Size))
  public readonly size!: Size

  @EnumProp(Variant.Dark, ...Object.values(Variant))
  public readonly variant!: Variant

  declare public $emit: ButtonEmits

  public onClick(event: MouseEvent): void {
    this.$emit('click', event)
  }

  public get disabled(): boolean {
    return this.busy || (this.$attrs.disabled !== undefined && this.$attrs.disabled !== false)
  }

  public get classes(): string {
    return [
      'focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-1 outline-hidden transition-colors duration-150',
      'active:brightness-95',
      this.block ? 'w-full' : '',
      this.rounded ? 'rounded-full' : 'rounded-lg',
      this.disabled ? '!cursor-not-allowed !bg-zinc-100 !border-zinc-200 !text-zinc-400 !shadow-none active:brightness-100' : '',
      this.variantClasses,
      this.sizeClasses,
    ]
      .filter(Boolean)
      .join(' ')
  }

  private get sizeClasses(): string {
    if (this.rounded || this.square) {
      if (this.size === Size.SM) return 'flex gap-1 items-center justify-center min-h-6 min-w-6'
      if (this.size === Size.LG) return 'flex gap-1 items-center justify-center min-h-10 min-w-10'
      return 'flex gap-1 items-center justify-center min-h-8 min-w-8'
    }

    if (this.size === Size.XS) return 'flex gap-1 items-center justify-center px-2 py-0.5 min-h-5 max-h-5 text-xs type-button'
    if (this.size === Size.SM) return 'flex gap-1 items-center justify-center px-3 py-1.5 min-h-7 max-h-7 text-xs type-button'
    if (this.size === Size.LG) return 'flex gap-2 items-center justify-center px-5 py-2.5 min-h-10 max-h-10 text-sm type-button'
    return 'flex gap-2 items-center justify-center px-4 py-2 min-h-9 max-h-9 text-sm type-button'
  }

  private get variantClasses(): string {
    if (this.outlined) {
      switch (this.variant) {
        case Variant.Dark:
          return 'text-zinc-900 bg-white hover:bg-zinc-50 active:bg-white border border-zinc-900 shadow-xs'
        case Variant.Gray:
          return 'text-zinc-700 bg-white hover:bg-zinc-50 active:bg-white border border-zinc-200 shadow-xs'
        case Variant.Blue:
          return 'text-blue-600 bg-white hover:bg-blue-50 active:bg-white border border-blue-200 shadow-xs'
        case Variant.Green:
          return 'text-emerald-600 bg-white hover:bg-emerald-50 active:bg-white border border-emerald-200 shadow-xs'
        case Variant.Red:
          return 'text-red-600 bg-white hover:bg-red-50 active:bg-white border border-red-200 shadow-xs'
        case Variant.Orange:
          return 'text-amber-600 bg-white hover:bg-amber-50 active:bg-white border border-amber-200 shadow-xs'
        case Variant.Purple:
          return 'text-purple-600 bg-white hover:bg-purple-50 active:bg-white border border-purple-200 shadow-xs'
        case Variant.Indigo:
          return 'text-indigo-600 bg-white hover:bg-indigo-50 active:bg-white border border-indigo-200 shadow-xs'
        default:
          return ''
      }
    }
    switch (this.variant) {
      case Variant.Dark:
        return 'text-white bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-900 border border-transparent shadow-xs shadow-zinc-900/10'
      case Variant.Gray:
        return 'text-zinc-700 bg-zinc-50 hover:bg-zinc-100 active:bg-zinc-50 border border-zinc-200 shadow-xs'
      case Variant.Blue:
        return 'text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-600 border border-transparent shadow-xs shadow-blue-600/15'
      case Variant.Green:
        return 'text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-600 border border-transparent shadow-xs shadow-emerald-600/15'
      case Variant.Red:
        return 'text-white bg-red-600 hover:bg-red-700 active:bg-red-600 border border-transparent shadow-xs shadow-red-600/15'
      case Variant.Orange:
        return 'text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-500 border border-transparent shadow-xs shadow-amber-500/15'
      case Variant.Purple:
        return 'text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-600 border border-transparent shadow-xs shadow-purple-600/15'
      case Variant.Indigo:
        return 'text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-600 border border-transparent shadow-xs shadow-indigo-600/15'
      default:
        return ''
    }
  }

  private get spinnerClasses(): string {
    const light = !this.outlined && this.variant !== Variant.Gray
    return [
      'rounded-full border-2 animate-spin shrink-0',
      this.size === Size.XS || this.size === Size.SM ? 'w-3 h-3' : 'w-4 h-4',
      light ? 'border-white/40 border-t-white' : 'border-zinc-300 border-t-zinc-600',
    ].join(' ')
  }
}
</script>
