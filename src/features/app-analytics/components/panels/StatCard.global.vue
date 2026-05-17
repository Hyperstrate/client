<template lang="pug">
ui-card(class="flex flex-col gap-1")
  ui-overline {{ label }}
  span(class="text-2xl font-numeric font-bold text-gray-900 tabular-nums") {{ formattedValue }}
  span(v-if="subtext" class="text-xs text-gray-400") {{ subtext }}
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { NumberProp, OptionalProp, StringProp } from '@/util/prop-decorators'
import { formatAdaptiveCurrency, formatCompactNumber, formatPercent } from '@/util/format'

@Component
export default class StatCard extends Vue {
  @StringProp(true)
  public readonly label!: string

  @NumberProp(true)
  public readonly value!: number

  @StringProp('number')
  public readonly format!: 'number' | 'cost' | 'ms' | 'percent'

  @OptionalProp()
  public readonly subtext?: string

  public get formattedValue(): string {
    const v = this.value
    switch (this.format) {
      case 'cost':
        return formatAdaptiveCurrency(v)
      case 'ms':
        return `${Math.round(v)} ms`
      case 'percent':
        return formatPercent(v)
      default:
        return formatCompactNumber(v)
    }
  }
}
</script>
