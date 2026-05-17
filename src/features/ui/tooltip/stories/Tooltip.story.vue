<template lang="pug">
story(title="Tooltip")
  variant(title="Default")
    div(class="flex justify-center p-10")
      ui-tooltip
        template(#trigger)
          ui-button Hover me
        template(#content)
          div(class="px-3 py-2 text-sm text-zinc-700") This is a tooltip
  variant(title="Sides")
    div(class="flex justify-center items-center gap-8 p-10")
      ui-tooltip(v-for="side in Object.values(TooltipSide)" :key="side" :side="side")
        template(#trigger)
          ui-button {{ side }}
        template(#content)
          div(class="px-3 py-2 text-sm text-zinc-700") {{ side }} tooltip
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { TooltipSide } from '../model'

@Component
export default class TooltipStory extends Vue {
  private TooltipSide = TooltipSide
}
</script>
