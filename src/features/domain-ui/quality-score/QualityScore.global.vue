<template lang="pug">
div(class="flex flex-col items-center gap-0.5")
  span(:class="textClass" class="font-bold tabular-nums leading-none") {{ displayLabel }}
  ui-progress-bar(:value="score ?? 0" :fill-class="fillClass" :height="4" :animated="false" class="w-10")
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { OptionalProp } from '@/util/prop-decorators'

@Component
export default class QualityScore extends Vue {
  @OptionalProp()
  public readonly score?: number

  public get displayLabel(): string {
    return this.score ? String(Math.round(this.score)) : '—'
  }

  public get textClass(): string {
    const s = this.score ?? 0
    if (s === 0) return 'text-sm text-gray-400'
    if (s >= 90) return 'text-sm text-emerald-600'
    if (s >= 70) return 'text-sm text-amber-500'
    return 'text-sm text-red-500'
  }

  public get fillClass(): string {
    const s = this.score ?? 0
    if (s >= 90) return 'bg-emerald-400'
    if (s >= 70) return 'bg-amber-400'
    if (s > 0) return 'bg-red-400'
    return 'bg-gray-200'
  }
}
</script>
