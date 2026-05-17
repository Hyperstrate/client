<template lang="pug">
story(title="UI / StackedBar")
  variant(title="Token usage (3 segments)")
    div(class="w-80 flex flex-col gap-4")
      ui-stacked-bar(:segments="tokenSegments" :max="100" title="60 cached / 25 input / 15 output")
      ui-stacked-bar(:segments="tokenSegments" :max="100" :height="6")
      ui-stacked-bar(:segments="tokenSegments" :max="100" :height="16")

  variant(title="Auto-max (sums segments)")
    div(class="w-80")
      ui-stacked-bar(:segments="autoSegments")

  variant(title="Single segment")
    div(class="w-80")
      ui-stacked-bar(:segments="[{ value: 40, colorClass: 'bg-indigo-300', label: '40%' }]" :max="100")

  variant(title="Not rounded")
    div(class="w-80")
      ui-stacked-bar(:segments="tokenSegments" :max="100" :rounded="false")

  variant(title="Custom track")
    div(class="w-80")
      ui-stacked-bar(:segments="tokenSegments" :max="100" track-class="bg-slate-200")
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import type { StackedBarSegment } from '../StackedBar.global.vue'

@Component
export default class StackedBarStory extends Vue {
  public readonly tokenSegments: StackedBarSegment[] = [
    { value: 60, colorClass: 'bg-emerald-300', label: '60 cached' },
    { value: 25, colorClass: 'bg-indigo-300', label: '25 input' },
    { value: 15, colorClass: 'bg-violet-300', label: '15 output' },
  ]

  public readonly autoSegments: StackedBarSegment[] = [
    { value: 3, colorClass: 'bg-red-400', label: 'errors' },
    { value: 7, colorClass: 'bg-emerald-400', label: 'success' },
  ]
}
</script>
