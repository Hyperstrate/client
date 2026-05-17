<template lang="pug">
div(
  class="relative inline-flex items-center justify-center shrink-0"
  :style="sizeStyle"
  role="progressbar"
  aria-valuemin="0"
  aria-valuemax="100"
  :aria-valuenow="Math.round(percent)"
)
  svg(viewBox="0 0 44 44" class="h-full w-full -rotate-90")
    circle(:cx="center" :cy="center" :r="radius" fill="none" :stroke="trackColor" :stroke-width="strokeWidth")
    circle(
      :cx="center"
      :cy="center"
      :r="radius"
      fill="none"
      :stroke="color"
      :stroke-width="strokeWidth"
      :stroke-linecap="linecap"
      :stroke-dasharray="dashArray"
      class="transition-colors duration-150"
    )
  div(v-if="$slots.default" class="absolute inset-0 flex items-center justify-center")
    slot(:value="safeValue" :percent="percent")
</template>

<script lang="ts">
import * as d3 from 'd3'
import { Component, Vue, Watch } from 'vue-facing-decorator'
import { BooleanProp, LengthProp, NumberProp, StringProp } from '@/util/prop-decorators'
import { cssLength } from '@/util/css-length'

@Component
export default class RoundProgress extends Vue {
  public readonly center = 22

  @NumberProp(0)
  public readonly value!: number

  @NumberProp(100, 1)
  public readonly max!: number

  @LengthProp(48)
  public readonly size!: string | number

  @NumberProp(4, 1, 22)
  public readonly strokeWidth!: number

  @NumberProp(500, 0)
  public readonly durationMs!: number

  @StringProp('#6366f1')
  public readonly color!: string

  @StringProp('#f1f5f9')
  public readonly trackColor!: string

  @BooleanProp(true)
  public readonly rounded!: boolean

  @BooleanProp(true)
  public readonly animated!: boolean

  public renderedValue = 0
  private animationTimer?: { stop: () => void }

  public created(): void {
    if (!this.animated) this.renderedValue = this.safeValue
  }

  public mounted(): void {
    this.syncRenderedValue()
  }

  public beforeUnmount(): void {
    this.clearAnimationTimer()
  }

  @Watch('value')
  @Watch('max')
  @Watch('animated')
  @Watch('durationMs')
  public onProgressChange(): void {
    this.syncRenderedValue()
  }

  public get safeMax(): number {
    return Math.max(1, this.max)
  }

  public get safeValue(): number {
    return this.valueClamp(this.value)
  }

  public get renderedSafeValue(): number {
    return this.valueClamp(this.renderedValue)
  }

  public get percent(): number {
    return this.percentScale(this.renderedValue)
  }

  public get radius(): number {
    return Math.max(1, this.center - this.strokeWidth)
  }

  public get circumference(): number {
    return 2 * Math.PI * this.radius
  }

  public get dashArray(): string {
    return `${this.dashScale(this.renderedValue)} ${this.circumference}`
  }

  public get linecap(): string {
    return this.rounded ? 'round' : 'butt'
  }

  public get sizeStyle(): JsonObject {
    const length = cssLength(this.size)
    return { width: length, height: length }
  }

  private get valueClamp(): d3.ScaleLinear<number, number> {
    return d3.scaleLinear().domain([0, this.safeMax]).range([0, this.safeMax]).clamp(true)
  }

  private get percentScale(): d3.ScaleLinear<number, number> {
    return d3.scaleLinear().domain([0, this.safeMax]).range([0, 100]).clamp(true)
  }

  private get dashScale(): d3.ScaleLinear<number, number> {
    return d3.scaleLinear().domain([0, this.safeMax]).range([0, this.circumference]).clamp(true)
  }

  private syncRenderedValue(): void {
    this.clearAnimationTimer()
    if (!this.animated || this.durationMs === 0) {
      this.renderedValue = this.safeValue
      return
    }

    const from = this.renderedSafeValue
    const to = this.safeValue
    const interpolate = d3.interpolateNumber(from, to)
    const duration = Math.max(1, this.durationMs)

    this.animationTimer = d3.timer((elapsed) => {
      const t = Math.min(1, elapsed / duration)
      this.renderedValue = interpolate(d3.easeCubicOut(t))
      if (t < 1) return
      this.renderedValue = to
      this.clearAnimationTimer()
    })
  }

  private clearAnimationTimer(): void {
    if (this.animationTimer === undefined) return
    this.animationTimer.stop()
    this.animationTimer = undefined
  }
}
</script>
