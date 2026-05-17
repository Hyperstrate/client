<template lang="pug">
div(class="overflow-hidden flex" :class="[trackClass, rounded ? 'rounded-full' : '']" :style="{ height: `${height}px` }" role="img" :aria-label="ariaLabel")
  ui-tooltip(v-for="(seg, i) in nonEmptySegments" :key="i" :content="segmentTooltip(seg)")
    div(data-segment class="h-full shrink-0" :class="seg.colorClass" :style="segStyle(i)")
</template>

<script lang="ts">
import { scaleLinear } from 'd3'
import { Component, Vue, Watch } from 'vue-facing-decorator'
import { ArrayProp, BooleanProp, NumberProp, StringProp } from '@/util/prop-decorators'

export interface StackedBarSegment {
  value: number
  colorClass: string
  label?: string
}

@Component
export default class StackedBar extends Vue {
  @ArrayProp(() => [])
  public readonly segments!: StackedBarSegment[]

  /** Scale maximum. Defaults to sum of all segment values when 0. */
  @NumberProp(0, 0)
  public readonly max!: number

  /** Bar height in pixels. */
  @NumberProp(12, 1)
  public readonly height!: number

  @StringProp('bg-gray-100')
  public readonly trackClass!: string

  @BooleanProp(true)
  public readonly rounded!: boolean

  /** Whether to animate segments on mount and data change. */
  @BooleanProp(true)
  public readonly animated!: boolean

  /** Animation duration in milliseconds. */
  @NumberProp(450, 0)
  public readonly durationMs!: number

  /** Per-segment stagger delay in milliseconds. */
  @NumberProp(70, 0)
  public readonly staggerMs!: number

  // Rendered widths that drive the CSS transition.
  public renderedPcts: number[] = []

  public created(): void {
    // Set final widths before first render so tests and no-animation mode see correct values.
    if (!this.animated) this.renderedPcts = this.targetPcts
  }

  public mounted(): void {
    if (!this.animated) return
    // Start all segments at 0 then animate to target on the next frame.
    this.renderedPcts = this.nonEmptySegments.map(() => 0)
    void this.$nextTick(() => {
      requestAnimationFrame(() => {
        this.renderedPcts = this.targetPcts
      })
    })
  }

  @Watch('segments', { deep: true })
  @Watch('max')
  public onDataChange(): void {
    const next = this.targetPcts
    if (!this.animated) {
      this.renderedPcts = next
      return
    }
    if (next.length !== this.renderedPcts.length) {
      // Segment count changed - restart from 0 to re-stagger.
      this.renderedPcts = next.map(() => 0)
      void this.$nextTick(() => {
        requestAnimationFrame(() => {
          this.renderedPcts = next
        })
      })
    } else {
      // Same count - update widths smoothly without resetting to 0.
      this.renderedPcts = next
    }
  }

  public get nonEmptySegments(): StackedBarSegment[] {
    return this.segments.filter((s) => s.value > 0)
  }

  public get effectiveMax(): number {
    if (this.max > 0) return this.max
    return this.segments.reduce((s, seg) => s + seg.value, 0) || 1
  }

  public get targetPcts(): number[] {
    const scale = scaleLinear().domain([0, this.effectiveMax]).range([0, 100]).clamp(true)
    return this.nonEmptySegments.map((seg) => Math.max(scale(seg.value), 0.5))
  }

  public get ariaLabel(): string {
    const parts = this.segments.filter((s) => s.value > 0 && s.label).map((s) => `${s.label}: ${s.value}`)
    return parts.join(', ') || 'stacked bar'
  }

  public segStyle(i: number): Record<string, string> {
    const pct = this.renderedPcts[i] ?? 0
    if (!this.animated) return { width: `${pct}%` }
    const delay = i * this.staggerMs
    return {
      width: `${pct}%`,
      transition: `width ${this.durationMs}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
    }
  }

  public segmentTooltip(seg: StackedBarSegment): string {
    return seg.label ? `${seg.label}: ${seg.value}` : String(seg.value)
  }
}
</script>
