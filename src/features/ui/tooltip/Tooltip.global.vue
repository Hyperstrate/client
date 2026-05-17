<template lang="pug">
tooltip-provider(:delay-duration="150")
  tooltip-root
    tooltip-trigger(as-child)
      slot(name="trigger")
        slot
    tooltip-portal
      tooltip-content(
        :align="align"
        :side="side"
        :side-offset="6"
        class="rounded-md px-2 py-1 text-sm z-50 bg-white [filter:drop-shadow(0_0_1px_#c4c4c8)_drop-shadow(0_10px_15px_rgb(0_0_0_/_0.1))_drop-shadow(0_4px_6px_rgb(0_0_0_/_0.1))] min-w-[var(--radix-popper-anchor-width)]"
      )
        tooltip-arrow(class="fill-white")
        slot(name="content")
          span(v-if="content") {{ content }}
</template>

<script lang="ts">
import { TooltipArrow, TooltipContent, TooltipPortal, TooltipProvider, TooltipRoot, TooltipTrigger } from 'reka-ui'
import { Component, Vue } from 'vue-facing-decorator'
import { TooltipAlign, TooltipSide } from './model'
import { EnumProp, StringProp } from '@/util/prop-decorators'

@Component({
  components: {
    TooltipArrow,
    TooltipProvider,
    TooltipRoot,
    TooltipTrigger,
    TooltipContent,
    TooltipPortal,
  },
})
export default class Tooltip extends Vue {
  @StringProp()
  public readonly content?: string

  @EnumProp(TooltipSide.TOP, ...Object.values(TooltipSide))
  public readonly side!: TooltipSide

  @EnumProp(TooltipAlign.CENTER, ...Object.values(TooltipAlign))
  public readonly align!: TooltipAlign
}
</script>
