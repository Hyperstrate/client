<template lang="pug">
div(v-if="steps.length" class="flex flex-col gap-2 lifecycle-root")
  div(class="flex items-center gap-2 mb-0.5")
    ui-overline(compact) Request Lifecycle
    span(v-if="totalMs > 0" class="text-xs font-numeric tabular-nums text-gray-400 bg-gray-100 px-2 py-0.5 rounded") {{ formatDuration(totalMs) }} total
  div(class="overflow-x-auto")
    div(class="flex items-stretch min-w-max gap-0")
      template(v-for="(step, idx) in steps" :key="idx")
        div(
          class="flex flex-col gap-1.5 px-3.5 py-3 rounded-lg border min-w-[140px] overflow-hidden lifecycle-step"
          :class="nodeClass(step.outcome)"
          :style="stepStyle(idx)"
        )
          div(class="flex items-center gap-2")
            div(class="w-2.5 h-2.5 rounded-full shrink-0" :class="dotClass(step.outcome)")
            span(class="text-xs font-semibold text-gray-700 whitespace-nowrap") {{ step.name }}
          div(class="flex items-center gap-1.5 flex-wrap")
            ui-badge(:variant="outcomeVariant(step.outcome)" :size="Size.SM") {{ step.outcome.replace(/_/g, ' ') }}
            ui-badge(v-if="step.attempts && step.attempts > 1" :variant="Variant.Orange" :size="Size.SM")
              ui-icon(icon="refresh" size="10")
              span {{ step.attempts }}
          ui-tooltip(v-if="step.detail" :content="step.detail")
            p(class="text-xs text-gray-500 leading-snug") {{ step.detail }}
          div(class="flex items-center gap-2 mt-auto pt-2 border-t border-black/5")
            span(class="text-xs font-numeric tabular-nums shrink-0" :class="step.durationMs >= 100 ? 'text-amber-500 font-semibold' : 'text-gray-400'") {{ formatDuration(step.durationMs) }}
            ui-progress-bar(
              v-if="step.durationMs > 0 && maxMs > 0"
              :value="barPct(step.durationMs)"
              :height="3"
              :fill-class="`${barClass(step.outcome)} opacity-70`"
              track-class="bg-black/5"
              class="flex-1"
            )
        div(v-if="idx < steps.length - 1" class="flex items-center px-2 text-gray-300 shrink-0 lifecycle-arrow" :style="arrowStyle(idx)")
          ui-icon(icon="arrow-right" size="18")
</template>

<script lang="ts">
import { InternalModulesObservabilityInterfacesHttpInferenceLogResponse } from '@/__generated__/hyperstrate-api'
import { Size, Variant } from '@/features/ui/clickables/model'
import { Component, Vue } from 'vue-facing-decorator'
import { RequiredProp } from '@/util/prop-decorators'
import { formatDurationMs } from '@/util/format'

type InferenceLog = InternalModulesObservabilityInterfacesHttpInferenceLogResponse

interface PipelineStep {
  phase: number
  kind: string
  name: string
  outcome: string
  detail?: string
  durationMs: number
  offsetMs: number
  attempts?: number
}

const STEP_NODE: Record<string, string> = {
  passed: 'border-emerald-100 bg-emerald-50',
  success: 'border-emerald-100 bg-emerald-50',
  selected: 'border-emerald-100 bg-emerald-50',
  streaming: 'border-indigo-100 bg-indigo-50',
  fallback: 'border-amber-100 bg-amber-50',
  hit_exact: 'border-indigo-100 bg-indigo-50',
  hit_semantic: 'border-indigo-100 bg-indigo-50',
  miss: 'border-gray-200 bg-white',
  applied: 'border-purple-100 bg-purple-50',
  routed: 'border-indigo-100 bg-indigo-50',
  masked: 'border-amber-100 bg-amber-50',
  recorded: 'border-gray-200 bg-white',
  stored: 'border-gray-200 bg-white',
  skipped: 'border-gray-200 bg-white',
  retry: 'border-amber-100 bg-amber-50',
  blocked: 'border-red-100 bg-red-50',
  error: 'border-red-100 bg-red-50',
}

const STEP_DOT: Record<string, string> = {
  passed: 'bg-emerald-500',
  success: 'bg-emerald-500',
  selected: 'bg-emerald-500',
  streaming: 'bg-indigo-400',
  fallback: 'bg-amber-400',
  hit_exact: 'bg-indigo-500',
  hit_semantic: 'bg-indigo-400',
  miss: 'bg-gray-300',
  applied: 'bg-purple-500',
  routed: 'bg-indigo-500',
  masked: 'bg-amber-400',
  recorded: 'bg-gray-300',
  stored: 'bg-gray-300',
  skipped: 'bg-gray-300',
  retry: 'bg-amber-400',
  blocked: 'bg-red-500',
  error: 'bg-red-500',
}

const STEP_BAR: Record<string, string> = {
  passed: 'bg-emerald-400',
  success: 'bg-emerald-400',
  selected: 'bg-emerald-400',
  streaming: 'bg-indigo-400',
  fallback: 'bg-amber-400',
  hit_exact: 'bg-indigo-400',
  hit_semantic: 'bg-indigo-300',
  miss: 'bg-gray-300',
  applied: 'bg-purple-400',
  routed: 'bg-indigo-400',
  masked: 'bg-amber-400',
  recorded: 'bg-gray-300',
  stored: 'bg-gray-300',
  retry: 'bg-amber-400',
  blocked: 'bg-red-400',
  error: 'bg-red-400',
}

const OUTCOME_VARIANT: Record<string, Variant> = {
  passed: Variant.Green,
  success: Variant.Green,
  selected: Variant.Green,
  streaming: Variant.Indigo,
  fallback: Variant.Orange,
  hit_exact: Variant.Indigo,
  hit_semantic: Variant.Indigo,
  miss: Variant.Gray,
  applied: Variant.Purple,
  routed: Variant.Indigo,
  masked: Variant.Orange,
  recorded: Variant.Gray,
  stored: Variant.Gray,
  skipped: Variant.Gray,
  retry: Variant.Orange,
  blocked: Variant.Red,
  error: Variant.Red,
}

@Component
export default class PipelineTrace extends Vue {
  @RequiredProp()
  public readonly item!: InferenceLog

  public Variant = Variant
  public Size = Size

  public get steps(): PipelineStep[] {
    const raw = this.item.pipelineSteps
    if (!raw || !Array.isArray(raw) || raw.length === 0) return []
    return raw as unknown as PipelineStep[]
  }

  public get totalMs(): number {
    if (!this.steps.length) return this.item.latencyMs ?? 0
    return Math.max(...this.steps.map((s) => (s.offsetMs ?? 0) + (s.durationMs ?? 0)), 1)
  }

  public get maxMs(): number {
    return Math.max(...this.steps.map((s) => s.durationMs ?? 0), 1)
  }

  public nodeClass(outcome: string): string {
    return STEP_NODE[outcome] ?? 'border-gray-200 bg-white'
  }

  public dotClass(outcome: string): string {
    return STEP_DOT[outcome] ?? 'bg-gray-300'
  }

  public barClass(outcome: string): string {
    return STEP_BAR[outcome] ?? 'bg-gray-300'
  }

  public outcomeVariant(outcome: string): Variant {
    return OUTCOME_VARIANT[outcome] ?? Variant.Gray
  }

  public barPct(durationMs: number): number {
    if (this.maxMs <= 0 || durationMs <= 0) return 0
    return Math.max(4, Math.round((durationMs / this.maxMs) * 100))
  }

  public stepStyle(index: number): Record<string, string> {
    return { animationDelay: `${index * 60}ms` }
  }

  public arrowStyle(index: number): Record<string, string> {
    return { animationDelay: `${index * 60 + 45}ms` }
  }

  public formatDuration(ms: number): string {
    if (ms <= 0) return '0'
    if (ms < 1) return `${Math.round(ms * 1000)}µs`
    return formatDurationMs(ms)
  }
}
</script>

<style scoped>
.lifecycle-step {
  animation: lifecycle-fade-in 220ms ease-out both;
}

.lifecycle-arrow {
  animation: lifecycle-fade-in 180ms ease-out both;
}

.lifecycle-root {
  overflow-y: hidden;
}

@keyframes lifecycle-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lifecycle-step,
  .lifecycle-arrow {
    animation: none;
  }
}
</style>
