<template lang="pug">
div(:class="trackClasses" :style="trackStyle" role="progressbar" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="Math.round(percent)")
  div(:class="fillClasses" :style="fillStyle")
</template>

<script lang="ts">
import * as d3 from 'd3'
import { Component, Vue, Watch } from 'vue-facing-decorator'
import { BooleanProp, LengthProp, NumberProp, StringProp } from '@/util/prop-decorators'
import { cssLength } from '@/util/css-length'

@Component
export default class ProgressBar extends Vue {
  @NumberProp(0)
  public readonly value!: number

  @NumberProp(100, 1)
  public readonly max!: number

  @LengthProp(6)
  public readonly height!: string | number

  @NumberProp(500, 0)
  public readonly durationMs!: number

  @StringProp('bg-indigo-400')
  public readonly fillClass!: string

  @StringProp('bg-gray-100')
  public readonly trackClass!: string

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

  public get trackClasses(): string {
    return ['overflow-hidden shrink-0', this.rounded ? 'rounded-full' : '', this.trackClass].filter(Boolean).join(' ')
  }

  public get fillClasses(): string {
    return ['h-full', this.rounded ? 'rounded-full' : '', 'transition-colors duration-150', this.fillClass].filter(Boolean).join(' ')
  }

  public get trackStyle(): JsonObject {
    return { height: cssLength(this.height) }
  }

  public get fillStyle(): JsonObject {
    return { width: `${this.percent}%` }
  }

  private get valueClamp(): d3.ScaleLinear<number, number> {
    return d3.scaleLinear().domain([0, this.safeMax]).range([0, this.safeMax]).clamp(true)
  }

  private get percentScale(): d3.ScaleLinear<number, number> {
    return d3.scaleLinear().domain([0, this.safeMax]).range([0, 100]).clamp(true)
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
