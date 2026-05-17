<template lang="pug">
div(:class="wrapClass" class="transition-colors")
  //- ── Collapsed header row ────────────────────────────────────────────────
  div(class="flex items-start justify-between gap-4 px-6 py-3.5 cursor-pointer select-none" @click="$emit('toggle')")
    div(class="flex items-start gap-3 min-w-0")
      //- Status dot
      div(:class="statusDotClass" class="w-2.5 h-2.5 rounded-full mt-1 shrink-0")
      div(class="flex flex-col gap-1 min-w-0")
        //- Turn meta row
        div(class="flex items-center gap-2 flex-wrap")
          span(class="text-xs font-semibold text-gray-700 tabular-nums shrink-0")
            | # {{ log.turnIndex ?? '?' }}
          span(class="text-xs text-gray-400 shrink-0 whitespace-nowrap") {{ formatTime(log.createdAt) }}
          span(class="text-xs font-mono text-gray-500 truncate max-w-[160px]") {{ modelLabel }}
          span(v-if="log.cacheHit" :class="cacheHitClass" class="text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0") {{ log.cacheHitType }} hit
          ui-badge(v-if="log.loopDetected" :variant="Variant.Orange" class="shrink-0") loop
          ui-badge(v-if="log.status === 'error'" :variant="Variant.Red" class="shrink-0") error
        //- Token + cost metrics
        div(class="flex items-center gap-3 text-[11px] text-gray-400")
          span {{ formatNum(log.inputTokens) }} in
          span(v-if="(log.cachedInputTokens ?? 0) > 0" class="text-emerald-500") {{ formatNum(log.cachedInputTokens) }} cached
          span {{ formatNum(log.outputTokens) }} out
          span(class="text-gray-300") ·
          span {{ formatCost(log.costUsd) }}
          span(class="text-gray-300") ·
          span {{ formatDur(log.latencyMs) }}
          span(v-if="(log.contextFillPct ?? 0) > 0" class="text-gray-300") ·
          span(v-if="(log.contextFillPct ?? 0) > 0" :class="fillTextClass") ctx {{ Math.round(log.contextFillPct ?? 0) }}%

    //- Right: tool pills + expand chevron
    div(class="flex items-center gap-2 shrink-0")
      div(v-if="toolArchives.length" class="hidden xl:flex items-center gap-1 flex-wrap max-w-[200px]")
        span(v-for="tool in toolArchives.slice(0, 4)" :key="tool.id" class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono") {{ tool.toolName }}
        span(v-if="toolArchives.length > 4" class="text-[10px] text-gray-400") +{{ toolArchives.length - 4 }}
      ui-icon(icon="chevron-down" size="16" class="text-gray-300 transition-transform duration-150 shrink-0" :class="expanded ? 'rotate-180' : ''")

  //- ── Token bar ───────────────────────────────────────────────────────────
  div(class="px-6 pb-3 flex items-center gap-3")
    div(class="flex-1 h-3 rounded-full overflow-hidden flex bg-gray-100")
      //- Cached input segment (emerald, leftmost within input)
      div(v-if="cachedFrac > 0" class="h-full bg-emerald-300 shrink-0" :style="{ width: `${cachedFrac * inputFrac * 100}%` }")
      //- Regular input segment (indigo)
      div(class="h-full bg-indigo-300 shrink-0" :style="{ width: `${(1 - cachedFrac) * inputFrac * 100}%` }")
      //- Output segment (violet)
      div(class="h-full bg-violet-300 shrink-0" :style="{ width: `${outputFrac * 100}%` }")
    //- Context fill indicator
    div(v-if="(log.contextFillPct ?? 0) > 0" class="flex items-center gap-1 shrink-0")
      ui-progress-bar(:value="log.contextFillPct ?? 0" :fill-class="fillBarClass" :height="6" class="w-12")
      span(:class="fillTextClass" class="text-[10px] font-medium tabular-nums") {{ Math.round(log.contextFillPct ?? 0) }}%

  //- ── Pipeline flame (compact) ────────────────────────────────────────────
  div(v-if="hasPipelineSteps" class="px-6 pb-3")
    domain-ui-pipeline-flame(:item="log")

  //- ── Expanded detail ─────────────────────────────────────────────────────
  div(v-if="expanded" class="border-t border-gray-100 bg-gray-50/40 px-6 py-4 flex flex-col gap-5")
    //- Error message
    div(v-if="log.errorMessage" class="rounded-lg bg-red-50 border border-red-100 px-4 py-3")
      span(class="text-xs font-semibold text-red-600 block") Error
      p(class="text-xs text-red-700 font-mono whitespace-pre-wrap leading-relaxed mt-1") {{ log.errorMessage }}
    //- Loop reason
    div(v-if="log.loopDetected && log.loopReason" class="rounded-lg bg-orange-50 border border-orange-100 px-4 py-3 flex items-start gap-2")
      div(class="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0")
      div
        span(class="text-xs font-semibold text-orange-700 block") Loop detected
        p(class="text-xs text-orange-600 mt-0.5") {{ log.loopReason }}
    //- Pipeline trace (full cards)
    div(v-if="hasPipelineSteps")
      domain-ui-pipeline-trace(:item="log")
    //- Tool call archives
    div(v-if="toolArchives.length" class="flex flex-col gap-2")
      div(class="text-[11px] uppercase tracking-wide text-gray-400") Tool calls ({{ toolArchives.length }})
      div(class="flex flex-col gap-2")
        div(v-for="tool in toolArchives" :key="tool.id" class="rounded-lg border border-gray-100 bg-white overflow-hidden")
          ui-clickable(
            tag="button"
            type="button"
            class="w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
            @click.stop="$emit('open-tool', tool)"
          )
            div(class="flex items-center gap-2 min-w-0")
              span(class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono shrink-0") {{ tool.toolName || 'tool' }}
              ui-badge(v-if="tool.errorMessage" :variant="Variant.Red" class="shrink-0") error
              p(v-else class="text-xs text-gray-400 truncate") {{ tool.responsePreview || tool.requestPreview }}
            span(class="text-[10px] text-gray-400 shrink-0 tabular-nums") {{ formatNum(tool.responseChars) }} chars
    //- Actions
    div(class="flex items-center gap-2 pt-1")
      ui-clickable(tag="button" type="button" class="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors" @click.stop="$emit('view-log', log)") View full log
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { RequiredProp, BooleanProp, ArrayProp } from '@/util/prop-decorators'
import { Variant } from '@/features/ui/clickables/model'
import { formatCurrency, formatDurationMs, formatNumber } from '@/util/format'
import {
  type InternalModulesObservabilityInterfacesHttpInferenceLogResponse as LogRow,
  type HyperstrateServerInternalModulesObservabilityDomainToolCallArchive as ToolArchive,
} from '@/__generated__/hyperstrate-api'

@Component
export default class AgentTurnItem extends Vue {
  public readonly Variant = Variant

  @RequiredProp()
  public readonly log!: LogRow

  @ArrayProp(() => [])
  public readonly toolArchives!: ToolArchive[]

  @BooleanProp()
  public readonly expanded!: boolean

  // ── Visual helpers ──────────────────────────────────────────────────────

  public get wrapClass(): string {
    if (this.log.status === 'error') return 'bg-red-50/40'
    if (this.log.loopDetected) return 'bg-orange-50/40'
    if (this.log.cacheHit) return 'bg-indigo-50/30'
    return ''
  }

  public get statusDotClass(): string {
    if (this.log.status === 'error') return 'bg-red-400'
    if (this.log.loopDetected) return 'bg-orange-400'
    if (this.log.cacheHit) return 'bg-indigo-300'
    return 'bg-emerald-400'
  }

  public get cacheHitClass(): string {
    return this.log.cacheHitType === 'semantic' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'
  }

  public get fillBarClass(): string {
    const pct = this.log.contextFillPct ?? 0
    if (pct >= 75) return 'bg-red-400'
    if (pct >= 50) return 'bg-amber-400'
    return 'bg-emerald-400'
  }

  public get fillTextClass(): string {
    const pct = this.log.contextFillPct ?? 0
    if (pct >= 75) return 'text-red-500'
    if (pct >= 50) return 'text-amber-500'
    return 'text-gray-400'
  }

  // ── Token bar fractions ─────────────────────────────────────────────────

  public get inputFrac(): number {
    const total = (this.log.inputTokens ?? 0) + (this.log.outputTokens ?? 0)
    if (total === 0) return 0
    return (this.log.inputTokens ?? 0) / total
  }

  public get outputFrac(): number {
    return 1 - this.inputFrac
  }

  public get cachedFrac(): number {
    const input = this.log.inputTokens ?? 0
    if (input === 0) return 0
    return Math.min((this.log.cachedInputTokens ?? 0) / input, 1)
  }

  // ── Display helpers ─────────────────────────────────────────────────────

  public get modelLabel(): string {
    return this.log.model?.displayName || this.log.modelDefKey || this.log.modelId || '—'
  }

  public get hasPipelineSteps(): boolean {
    const steps = this.log.pipelineSteps
    return Array.isArray(steps) && steps.length > 0
  }

  public formatTime(iso: string | undefined): string {
    if (!iso) return ''
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  public formatNum(n: number | undefined): string {
    return formatNumber(n ?? 0)
  }

  public formatCost(n: number | undefined): string {
    return formatCurrency(n ?? 0)
  }

  public formatDur(ms: number | undefined): string {
    if (!ms || ms <= 0) return '—'
    return formatDurationMs(ms)
  }
}
</script>
