<template lang="pug">
div(v-if="steps.length" class="flame-root flex flex-col gap-2 min-w-0 max-w-full")
  //- Header row
  div(class="flex items-center h-5 gap-3")
    ui-overline(compact) Pipeline timing
    div(class="flex-1 min-w-0 flex items-center justify-end")
      transition(name="detail-fade" mode="out-in")
        div(v-if="hovered" :key="hovered.name" class="min-w-0 flex items-center gap-1.5 text-xs")
          div(class="w-1.5 h-1.5 rounded-full shrink-0" :class="dotClass(hovered.outcome)")
          span(class="font-semibold text-gray-700 truncate") {{ hovered.name }}
          ui-badge(:variant="outcomeVariant(hovered.outcome)" :size="Size.SM") {{ hovered.outcome.replace(/_/g, ' ') }}
          span(class="font-numeric tabular-nums text-gray-400 shrink-0") {{ fmt(hovered.durationMs) }}
          span(class="text-gray-300 shrink-0") {{ pct(hovered) }}
        span(v-else key="total" class="font-numeric tabular-nums text-xs text-gray-400") {{ fmt(totalMs) }} total

  //- Flame bar
  div(class="relative rounded-lg overflow-hidden bg-gray-100 max-w-full flame-bar" :style="barStyle")
    div(v-for="lane in visibleLanes" :key="lane.key" class="absolute left-0 flame-lane-label" :class="laneBandClass(lane.index)" :style="laneStyle(lane.index)")
      span {{ lane.label }}
    div(class="absolute top-0 bottom-0 flame-track" :style="trackStyle")
      div(
        v-for="lane in visibleLanes"
        :key="'rail' + lane.key"
        class="absolute left-0 right-0 flame-lane"
        :class="laneBandClass(lane.index)"
        :style="laneStyle(lane.index)"
      )
      //- Step segments
      div(
        v-for="step in positionedSteps"
        :key="step.index"
        class="absolute cursor-pointer overflow-hidden flame-segment"
        :class="segmentClass(step)"
        :style="segStyle(step)"
        @mouseenter="hoveredIdx = step.index"
        @mouseleave="hoveredIdx = undefined"
      )
        div(class="absolute inset-0 flame-fill" :class="segBg(step.outcome)" :style="timelineAnimationStyle(displayLeftPct(step), displayWidthPct(step))")
        //- White flash overlay on hover
        div(class="absolute inset-0 transition-colors duration-75" :class="hoveredIdx === step.index ? 'bg-white/20' : 'bg-transparent'")
        //- Label inside segment (only if wide enough)
        span(
          v-if="isCritical(step)"
          class="absolute inset-0 flex items-center justify-center gap-1 text-[10px] font-semibold text-white whitespace-nowrap overflow-hidden px-1 pointer-events-none select-none drop-shadow-xs"
        )
          ui-icon(icon="circle-alert" size="11")
          span {{ criticalLabel(step) }}
        span(
          v-else-if="displayWidthPct(step) > 12"
          class="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white/95 whitespace-nowrap overflow-hidden px-1.5 pointer-events-none select-none drop-shadow-xs"
        ) {{ step.name }}

  //- Time axis
  div(class="flex justify-between items-center flame-axis" :style="axisStyle")
    span(v-for="(t, i) in axisTicks" :key="i" class="text-xs font-numeric text-gray-300 tabular-nums") {{ t }}
</template>

<script lang="ts">
import { InternalModulesObservabilityInterfacesHttpInferenceLogResponse } from '@/__generated__/hyperstrate-api'
import { Size, Variant } from '@/features/ui/clickables/model'
import { Component, Vue } from 'vue-facing-decorator'
import { RequiredProp } from '@/util/prop-decorators'
import { formatDurationMs } from '@/util/format'
import {
  CRITICAL_MIN_SEGMENT_PCT,
  CRITICAL_OUTCOMES,
  FLAME_ANIMATION_MS,
  LANE_DEFS,
  LANE_GAP_PX,
  LANE_HEIGHT_PX,
  LANE_LABEL_WIDTH_PX,
  MIN_FLAME_HEIGHT_PX,
  MIN_SEGMENT_ANIMATION_MS,
  MIN_SEGMENT_PCT,
  MIN_SEQUENCE_GAP_PCT,
  OUTCOME_VARIANT,
  SEG_BG,
  SEGMENT_HEIGHT_PX,
} from './model'

type InferenceLog = InternalModulesObservabilityInterfacesHttpInferenceLogResponse

interface Step {
  phase: number
  kind: string
  name: string
  outcome: string
  detail?: string
  durationMs: number
  offsetMs: number
  attempts?: number
}

interface PositionedStep extends Step {
  index: number
  laneKey: string
  lane: number
  displayLeft: number
  displayWidth: number
  displayStartMs: number
  displayDurationMs: number
}

interface LaneDefinition {
  key: string
  label: string
  index: number
}

@Component
export default class PipelineFlame extends Vue {
  @RequiredProp()
  public readonly item!: InferenceLog

  public hoveredIdx?: number = undefined
  public Size = Size

  public get steps(): Step[] {
    const raw = this.item.pipelineSteps
    if (!Array.isArray(raw) || raw.length === 0) return []
    return raw as unknown as Step[]
  }

  public get totalMs(): number {
    if (!this.steps.length) return this.item.latencyMs ?? 1
    return Math.max(...this.steps.map((s) => (s.offsetMs ?? 0) + (s.durationMs ?? 0)), 1)
  }

  public get positionedSteps(): PositionedStep[] {
    const laneIndex = this.laneIndexByKey
    const gapMs = this.totalMs * (MIN_SEQUENCE_GAP_PCT / 100)
    let cursorMs = 0
    const ordered = this.steps
      .map((step, index) => ({
        ...step,
        index,
        laneKey: this.stepLaneKey(step),
        lane: 0,
        displayLeft: 0,
        displayWidth: 0,
        displayStartMs: 0,
        displayDurationMs: 0,
      }))
      .sort((a, b) => (a.offsetMs ?? 0) - (b.offsetMs ?? 0) || a.index - b.index)
      .map((step) => {
        const rawStartMs = Math.max(step.offsetMs ?? 0, 0)
        const minDurationMs = this.totalMs * (this.minWidthPct(step) / 100)
        step.displayStartMs = Math.max(rawStartMs, cursorMs)
        step.displayDurationMs = Math.max(step.durationMs ?? 0, minDurationMs)
        step.lane = laneIndex[step.laneKey] ?? 0
        cursorMs = step.displayStartMs + step.displayDurationMs + gapMs
        return step
      })

    const displayTotalMs = Math.max(this.totalMs, ...ordered.map((step) => step.displayStartMs + step.displayDurationMs), 1)
    ordered.forEach((step) => {
      step.displayLeft = this.clampPct((step.displayStartMs / displayTotalMs) * 100)
      step.displayWidth = this.clampWidth(step.displayLeft, (step.displayDurationMs / displayTotalMs) * 100)
    })

    return ordered.sort((a, b) => a.index - b.index)
  }

  public get visibleLanes(): LaneDefinition[] {
    const used = new Set(this.steps.map((step) => this.stepLaneKey(step)))
    return LANE_DEFS.filter((lane) => used.has(lane.key)).map((lane, index) => ({ ...lane, index }))
  }

  public get laneIndexByKey(): Record<string, number> {
    return this.visibleLanes.reduce<Record<string, number>>((acc, lane) => {
      acc[lane.key] = lane.index
      return acc
    }, {})
  }

  public get laneCount(): number {
    return Math.max(this.visibleLanes.length, 1)
  }

  public get barStyle(): Record<string, string> {
    return {
      height: `${Math.max(MIN_FLAME_HEIGHT_PX, this.laneCount * LANE_HEIGHT_PX + (this.laneCount - 1) * LANE_GAP_PX + 4)}px`,
    }
  }

  public get hovered(): Step | undefined {
    return this.hoveredIdx !== undefined ? (this.steps[this.hoveredIdx] ?? undefined) : undefined
  }

  public get axisTicks(): string[] {
    return [0, 0.25, 0.5, 0.75, 1].map((f) => this.fmt(this.totalMs * f))
  }

  public get axisStyle(): Record<string, string> {
    return { animationDelay: `${FLAME_ANIMATION_MS + 80}ms`, paddingLeft: `${LANE_LABEL_WIDTH_PX}px`, paddingRight: '4px' }
  }

  public get trackStyle(): Record<string, string> {
    return { left: `${LANE_LABEL_WIDTH_PX}px`, right: '4px' }
  }

  public segStyle(step: PositionedStep): Record<string, string> {
    const laneOffset = 3 + step.lane * (LANE_HEIGHT_PX + LANE_GAP_PX) + Math.round((LANE_HEIGHT_PX - SEGMENT_HEIGHT_PX) / 2)
    return {
      left: `${step.displayLeft}%`,
      width: `${step.displayWidth}%`,
      top: `${laneOffset}px`,
      height: `${SEGMENT_HEIGHT_PX}px`,
    }
  }

  public laneStyle(lane: number): Record<string, string> {
    return {
      top: `${3 + lane * (LANE_HEIGHT_PX + LANE_GAP_PX)}px`,
      height: `${LANE_HEIGHT_PX}px`,
    }
  }

  public timelineAnimationStyle(left: number, width: number): Record<string, string> {
    return {
      animationDelay: `${this.timelineDelay(left)}ms`,
      animationDuration: `${this.timelineDuration(width)}ms`,
    }
  }

  public laneBandClass(index: number): string {
    return index % 2 === 0 ? 'flame-lane-even' : 'flame-lane-odd'
  }

  public segmentClass(step: PositionedStep): string[] {
    return [this.hoveredIdx === step.index ? 'brightness-110' : '', this.isCritical(step) ? 'flame-segment-critical' : ''].filter(Boolean)
  }

  public displayLeftPct(step: PositionedStep): number {
    return step.displayLeft
  }

  public displayWidthPct(step: PositionedStep): number {
    return step.displayWidth
  }

  public widthPct(step: Step): number {
    return ((step.durationMs ?? 0) / this.totalMs) * 100
  }

  public leftPct(step: Step): number {
    return this.clampPct(((step.offsetMs ?? 0) / this.totalMs) * 100)
  }

  public pct(step: Step): string {
    return `${Math.round(this.widthPct(step))}%`
  }

  public segBg(outcome: string): string {
    return SEG_BG[outcome] ?? 'bg-gray-300'
  }

  public dotClass(outcome: string): string {
    return this.segBg(outcome)
  }

  public outcomeVariant(outcome: string): Variant {
    return OUTCOME_VARIANT[outcome] ?? Variant.Gray
  }

  public isCritical(step: Step): boolean {
    return CRITICAL_OUTCOMES.has(step.outcome)
  }

  public criticalLabel(step: Step): string {
    return step.outcome === 'blocked' ? 'Blocked' : step.outcome.replace(/_/g, ' ')
  }

  public fmt(ms: number): string {
    if (ms <= 0) return '0'
    if (ms < 1) return `${Math.round(ms * 1000)}µs`
    return formatDurationMs(ms)
  }

  private timelineDelay(percent: number): number {
    return Math.round((this.clampPct(percent) / 100) * FLAME_ANIMATION_MS)
  }

  private timelineDuration(percent: number): number {
    return Math.round(Math.max(MIN_SEGMENT_ANIMATION_MS, (Math.max(percent, 0.4) / 100) * FLAME_ANIMATION_MS))
  }

  private clampPct(percent: number): number {
    return Math.max(0, Math.min(percent, 100))
  }

  private clampWidth(left: number, width: number): number {
    return Math.max(0, Math.min(width, 100 - left))
  }

  private minWidthPct(step: Step): number {
    return this.isCritical(step) ? CRITICAL_MIN_SEGMENT_PCT : MIN_SEGMENT_PCT
  }

  private stepLaneKey(step: Step): string {
    const kind = step.kind || ''
    if (kind === 'rate_limit' || kind === 'budget' || kind === 'health_check' || step.phase <= 2) return 'checks'
    if (kind === 'cache' || kind === 'cache_store') return 'cache'
    if (kind === 'transform') return 'shape'
    if (kind === 'interceptor' || kind === 'target_select' || kind === 'hedging') return 'route'
    if (kind === 'inference' || kind.startsWith('mcp_') || kind === 'mcp_tools') return 'model'
    return 'post'
  }
}
</script>

<style scoped src="./pipeline-flame.css"></style>
