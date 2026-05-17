<template lang="pug">
ui-clickable(:to="to" class="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-xs transition-all flex-col gap-4" :class="hoverBorderClass")
  div(class="flex items-center justify-between")
    div(class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" :class="iconBgClass")
      ui-icon(:icon="icon" :size="20")
    ui-pill(:variant="pillVariant") {{ pillLabel }}
  div(class="flex flex-col gap-1 flex-1")
    p(class="font-semibold text-sm text-gray-900") {{ title }}
    p(class="text-xs text-gray-400 leading-relaxed") {{ description }}
  span(class="text-xs text-gray-400 group-hover:text-gray-700 transition-colors flex items-center")
    | Open
    ui-icon(icon="arrow-diagonal-top-right" :size="16")
</template>

<script lang="ts">
import { Variant } from '@/features/ui/clickables/model'
import { Component, Vue } from 'vue-facing-decorator'
import { RequiredProp, StringProp } from '@/util/prop-decorators'

export type SectionCardColor = 'gray' | 'blue' | 'green' | 'indigo' | 'purple'

const COLOR_CLASSES: Record<SectionCardColor, { border: string; icon: string }> = {
  gray: { border: 'hover:border-gray-300', icon: 'bg-gray-100 group-hover:bg-gray-200' },
  blue: { border: 'hover:border-blue-300', icon: 'bg-blue-50 group-hover:bg-blue-100' },
  green: { border: 'hover:border-emerald-300', icon: 'bg-emerald-50 group-hover:bg-emerald-100' },
  indigo: { border: 'hover:border-indigo-300', icon: 'bg-indigo-50 group-hover:bg-indigo-100' },
  purple: { border: 'hover:border-purple-300', icon: 'bg-purple-50 group-hover:bg-purple-100' },
}

@Component
export default class SectionCard extends Vue {
  @StringProp(true)
  public readonly to!: string

  @StringProp(true)
  public readonly icon!: string

  @StringProp(true)
  public readonly title!: string

  @StringProp(true)
  public readonly description!: string

  @StringProp(true)
  public readonly pillLabel!: string

  @RequiredProp()
  public readonly pillVariant!: Variant

  @StringProp('gray')
  public readonly color!: SectionCardColor

  public get hoverBorderClass(): string {
    return COLOR_CLASSES[this.color]?.border ?? COLOR_CLASSES.gray.border
  }

  public get iconBgClass(): string {
    return COLOR_CLASSES[this.color]?.icon ?? COLOR_CLASSES.gray.icon
  }
}
</script>
