<template lang="pug">
ui-layout(use="core-default-layout")
  div(class="h-full flex flex-col")
    //- ── Header ──────────────────────────────────────────────────────────────
    div(class="max-w-screen-xl w-full mx-auto px-8 pt-7 shrink-0")
      div(class="flex items-start justify-between gap-6 pb-5 border-b border-gray-100")
        div(class="flex flex-col gap-3")
          ui-clickable(tag="button" type="button" class="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors w-fit" @click="goBack")
            ui-icon(icon="chevron-left" :size="16")
            span Agent sessions
          div(class="flex items-center gap-3")
            div(v-if="agent" class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-100 bg-white shadow-xs")
              domain-ui-agent-badge(:agent="agent")
            div(class="flex flex-col gap-0.5")
              span(class="text-sm font-semibold text-gray-800") Agent session
              span(class="font-mono text-xs text-gray-400") {{ sessionId.slice(-20) }}
        div(v-if="logs.length" class="flex items-center gap-5 flex-wrap")
          div(v-for="stat in headerStats" :key="stat.label" class="flex flex-col gap-0.5 text-right")
            span(class="text-[10px] uppercase tracking-wide text-gray-400") {{ stat.label }}
            span(:class="stat.cls" class="text-sm font-semibold tabular-nums") {{ stat.value }}
          div(class="flex flex-col items-center gap-0.5 shrink-0")
            div(class="relative w-12 h-12")
              svg(viewBox="0 0 44 44" class="w-full h-full" style="transform: rotate(-90deg)")
                circle(cx="22" cy="22" r="18" fill="none" stroke="#f1f5f9" stroke-width="4.5")
                circle(
                  cx="22"
                  cy="22"
                  r="18"
                  fill="none"
                  :stroke="gaugeColor"
                  stroke-width="4.5"
                  stroke-linecap="round"
                  :stroke-dasharray="`${(avgQuality / 100) * 113} 113`"
                )
              div(class="absolute inset-0 flex items-center justify-center")
                span(:class="gaugeTextClass" class="text-xs font-bold tabular-nums") {{ avgQuality ? Math.round(avgQuality) : '—' }}
            span(class="text-[10px] text-gray-400") quality

    //- ── Body ────────────────────────────────────────────────────────────────
    div(class="flex-1 overflow-y-auto min-h-0")
      div(class="max-w-screen-xl mx-auto px-8 py-6 flex gap-5 items-start")
        //- LEFT column
        div(class="flex-1 min-w-0 flex flex-col gap-4")
          //- ── Turn stream ────────────────────────────────────────────────────
          div(class="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden")
            //- Header
            div(class="px-5 py-3 border-b border-gray-100 flex flex-col gap-2 bg-gray-50/60")
              div(class="flex items-center justify-between")
                div(class="flex items-center gap-2")
                  span(class="text-sm font-semibold text-gray-700") Turns
                  span(class="text-[11px] text-gray-400") {{ logs.length }} loaded · click to inspect
                //- Token bar legend
                div(class="flex items-center gap-3 text-[10px] text-gray-400")
                  span(class="text-gray-300") tokens
                  div(class="flex items-center gap-1")
                    div(class="w-2.5 h-1.5 rounded bg-emerald-300")
                    span cached
                  div(class="flex items-center gap-1")
                    div(class="w-2.5 h-1.5 rounded bg-indigo-300")
                    span input
                  div(class="flex items-center gap-1")
                    div(class="w-2.5 h-1.5 rounded bg-violet-300")
                    span output
              //- Quality dot + status dot legend
              div(class="flex items-center gap-4 text-[10px] text-gray-400")
                span(class="text-gray-300 shrink-0") quality
                div(class="flex items-center gap-2.5")
                  div(class="flex items-center gap-1")
                    div(class="w-2 h-2 rounded-full bg-emerald-400 shrink-0")
                    span ≥ 90
                  div(class="flex items-center gap-1")
                    div(class="w-2 h-2 rounded-full bg-amber-400 shrink-0")
                    span ≥ 70
                  div(class="flex items-center gap-1")
                    div(class="w-2 h-2 rounded-full bg-red-300 shrink-0")
                    span low
                  div(class="flex items-center gap-1")
                    div(class="w-2 h-2 rounded-full bg-gray-200 shrink-0")
                    span none
                div(class="w-px h-3 bg-gray-200")
                div(class="flex items-center gap-2.5")
                  div(class="flex items-center gap-1")
                    div(class="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0")
                    span error
                  div(class="flex items-center gap-1")
                    div(class="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0")
                    span loop
                  div(class="flex items-center gap-1")
                    div(class="w-1.5 h-1.5 rounded-full bg-indigo-300 shrink-0")
                    span cache
            //- Loading skeleton
            div(v-if="logsLoading" class="divide-y divide-gray-50")
              div(v-for="i in 10" :key="i" class="px-5 py-2.5 flex items-center gap-3 animate-pulse")
                div(class="w-2 h-2 rounded-full bg-gray-200 shrink-0")
                div(class="w-5 h-2 rounded bg-gray-100 shrink-0")
                div(class="w-12 h-2 rounded bg-gray-100 shrink-0")
                div(class="w-28 h-2 rounded bg-gray-100")
                div(class="ml-auto w-10 h-2 rounded bg-gray-100 shrink-0")
            //- Empty
            div(v-else-if="!logs.length" class="px-5 py-10 text-sm text-gray-400 text-center") No turns in this session
            //- Rows
            div(v-else class="divide-y divide-gray-50/80 overflow-y-auto" style="max-height: 440px")
              ui-clickable(
                v-for="(log, i) in logs"
                :key="log.id"
                type="button"
                class="w-full flex items-center gap-2.5 px-5 py-2 text-left transition-colors focus:outline-hidden"
                :class="activeTurn?.id === log.id ? 'bg-indigo-50/70' : 'hover:bg-gray-50/80'"
                @click="selectTurn(log)"
              )
                //- Quality dot
                div(class="w-2 h-2 rounded-full shrink-0" :class="qualityDotClass(log)")
                //- Turn #
                span(class="text-[11px] font-mono text-gray-400 tabular-nums w-5 shrink-0") {{ log.turnIndex ?? i + 1 }}
                //- Time
                span(class="text-[10px] text-gray-300 w-14 shrink-0 tabular-nums") {{ formatTime(log.createdAt) }}
                //- Stacked token bar
                ui-stacked-bar(:segments="turnSegments(log)" :max="maxTurnTokens" :height="8" class="w-28 shrink-0" :animated="false")
                //- Token count
                span(class="text-[11px] tabular-nums text-gray-400 w-11 text-right shrink-0") {{ shortNum(log.totalTokens) }}
                //- Cost
                span(class="text-[11px] tabular-nums text-gray-600 font-medium w-14 text-right shrink-0") {{ formatCost(log.costUsd) }}
                //- Latency
                span(class="text-[10px] tabular-nums text-gray-300 w-10 text-right shrink-0") {{ formatDur(log.latencyMs) }}
                //- Trailing: tool count + status dots
                div(class="flex items-center gap-1.5 flex-1 justify-end")
                  span(v-if="(log.toolCallCount ?? 0) > 0" class="text-[10px] text-gray-400 tabular-nums") {{ log.toolCallCount }}t
                  div(v-if="log.status === 'error'" class="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0")
                  div(v-else-if="log.loopDetected" class="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0")
                  div(v-else-if="log.cacheHit" class="w-1.5 h-1.5 rounded-full bg-indigo-300 shrink-0")

          //- ── Selected turn detail ──────────────────────────────────────────
          div(v-if="activeTurn" class="bg-white rounded-xl border border-indigo-100 shadow-xs overflow-hidden")
            //- Turn header
            div(class="px-5 py-4 border-b border-gray-100 flex flex-col gap-3")
              div(class="flex items-center gap-3 flex-wrap")
                span(class="font-mono text-[11px] text-gray-400") {{ formatTime(activeTurn.createdAt) }}
                span(class="text-sm font-semibold text-gray-800") Turn # {{ activeTurn.turnIndex ?? '?' }}
                span(class="text-xs font-mono text-gray-500 truncate max-w-[220px]") {{ modelName(activeTurn) }}
                ui-badge(v-if="activeTurn.cacheHit" :variant="Variant.Indigo") {{ activeTurn.cacheHitType }} hit
                ui-badge(v-if="activeTurn.loopDetected" :variant="Variant.Orange") loop
                ui-badge(v-if="activeTurn.status === 'error'" :variant="Variant.Red") error
                div(class="ml-auto flex items-center gap-2 text-xs text-gray-500 shrink-0")
                  span {{ formatCost(activeTurn.costUsd) }}
                  span(class="text-gray-300") ·
                  span {{ formatDur(activeTurn.latencyMs) }}
                  template(v-if="(activeTurn.contextFillPct ?? 0) > 0")
                    span(class="text-gray-300") ·
                    span(:class="fillTextClass(activeTurn.contextFillPct)") {{ Math.round(activeTurn.contextFillPct ?? 0) }}% ctx
              //- Token bar
              div(class="flex items-center gap-3")
                ui-stacked-bar(:segments="turnSegments(activeTurn)" :max="maxTurnTokens" :height="14" class="flex-1")
                div(class="flex items-center gap-3 text-[11px] text-gray-400 shrink-0")
                  span(v-if="(activeTurn.cachedInputTokens ?? 0) > 0" class="text-emerald-500") {{ formatNum(activeTurn.cachedInputTokens) }} cached
                  span {{ formatNum(activeTurn.inputTokens) }} in
                  span {{ formatNum(activeTurn.outputTokens) }} out

            //- Alerts
            div(v-if="activeTurn.errorMessage" class="mx-5 mt-4 rounded-lg bg-red-50 border border-red-100 px-4 py-3")
              span(class="text-xs font-semibold text-red-600 block mb-1") Error
              p(class="text-xs text-red-700 font-mono whitespace-pre-wrap leading-relaxed") {{ activeTurn.errorMessage }}
            div(v-if="activeTurn.loopDetected && activeTurn.loopReason" class="mx-5 mt-4 rounded-lg bg-orange-50 border border-orange-100 px-4 py-3")
              p(class="text-xs font-semibold text-orange-700 mb-0.5") Loop detected
              p(class="text-xs text-orange-600") {{ activeTurn.loopReason }}

            //- Pipeline
            div(v-if="hasPipeline(activeTurn)" class="px-5 pt-4")
              domain-ui-pipeline-flame(:item="activeTurn")
            div(v-if="hasPipeline(activeTurn)" class="px-5 pt-3 pb-1")
              domain-ui-pipeline-trace(:item="activeTurn")

            //- Tool archives
            div(v-if="toolsFor(activeTurn.id).length" class="px-5 pt-4 pb-4")
              div(class="text-[11px] uppercase tracking-wide text-gray-400 mb-2") Tools ({{ toolsFor(activeTurn.id).length }})
              div(class="flex flex-col gap-1.5")
                button(
                  v-for="tool in toolsFor(activeTurn.id)"
                  :key="tool.id"
                  type="button"
                  class="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 text-left transition-colors"
                  @click="openTool(tool)"
                )
                  div(class="flex items-center gap-2 min-w-0")
                    span(class="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono shrink-0") {{ tool.toolName || 'tool' }}
                    ui-badge(v-if="tool.errorMessage" :variant="Variant.Red") error
                    p(v-else class="text-xs text-gray-400 truncate") {{ tool.responsePreview || tool.requestPreview }}
                  span(class="text-[10px] text-gray-400 tabular-nums shrink-0") {{ formatNum(tool.responseChars) }} chars

            //- Footer
            div(class="px-5 py-3 border-t border-gray-50 flex items-center justify-between")
              span(class="text-[11px] text-gray-400") Turn {{ activeTurn.turnIndex ?? '?' }} of {{ logs.length }}
              div(class="flex items-center gap-2")
                ui-button(:size="Size.SM" :variant="Variant.Gray" :busy="replayLoading" @click="replayTurn(activeTurn)")
                  template(#before)
                    ui-icon(icon="play-circle" :size="12")
                  | Replay
                ui-clickable(
                  tag="button"
                  type="button"
                  class="inline-flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
                  @click="drawerLog = activeTurn"
                )
                  span View full inference log
                  ui-icon(icon="arrow-right" size="12")
            div(v-if="replayFor(activeTurn.id)" class="mx-5 mb-4 rounded-lg border border-indigo-100 bg-indigo-50/40 px-4 py-3")
              div(class="flex items-center justify-between gap-3")
                span(class="text-xs font-semibold text-indigo-700") Replay result
                span(class="text-[11px] text-indigo-500 tabular-nums") {{ formatCost(replayFor(activeTurn.id)?.costUsd) }} · {{ formatDur(replayFor(activeTurn.id)?.latencyMs) }}
              pre(class="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-slate-700") {{ replayFor(activeTurn.id)?.content || 'No content returned' }}

          //- Empty state
          div(
            v-else-if="!logsLoading && logs.length"
            class="bg-white rounded-xl border border-gray-100 shadow-xs p-10 flex flex-col items-center justify-center gap-2 text-center"
          )
            ui-icon(icon="bar-chart" size="28" class="text-gray-200")
            p(class="text-sm text-gray-500") Select a turn
            p(class="text-xs text-gray-400") Click any row above to inspect the turn in detail

        //- RIGHT: insight sidebar
        div(class="w-60 xl:w-64 shrink-0 sticky" style="top: 24px")
          div(v-if="insightsLoading" class="bg-white rounded-xl border border-gray-100 shadow-xs px-4 py-6 flex flex-col gap-3 animate-pulse")
            div(v-for="i in 5" :key="i" class="h-3 bg-gray-100 rounded")
          app-analytics-agent-session-insight-sidebar(v-else-if="insightSession" :session="insightSession" :insights="insights")

  //- Drawers — only opened explicitly, never by row click
  app-analytics-inference-log-detail-drawer(:log="drawerLog" @close="drawerLog = undefined" @feedback="submitFeedback")

  ui-drawer(:model-value="!!selectedTool" title="Tool call archive" @close="selectedTool = undefined")
    div(v-if="selectedTool" class="px-6 py-5 flex flex-col gap-4")
      div(class="grid grid-cols-2 gap-x-6 gap-y-3")
        div
          span(class="text-xs text-gray-400 block mb-0.5") Tool
          span(class="font-mono text-xs text-gray-700") {{ selectedTool.toolName || '—' }}
        div
          span(class="text-xs text-gray-400 block mb-0.5") Status
          ui-badge(:variant="selectedTool.errorMessage ? Variant.Red : Variant.Green") {{ selectedTool.errorMessage ? 'error' : 'ok' }}
        div
          span(class="text-xs text-gray-400 block mb-0.5") Response chars
          span(class="font-numeric tabular-nums text-gray-700") {{ formatNum(selectedTool.responseChars) }}
      div(v-if="selectedTool.errorMessage" class="rounded-lg bg-red-50 border border-red-100 px-4 py-3")
        p(class="text-xs text-red-700 font-mono whitespace-pre-wrap") {{ selectedTool.errorMessage }}
      div(class="flex flex-col gap-2")
        span(class="text-xs font-semibold text-gray-500") Request
        pre(class="text-xs bg-gray-50 border border-gray-100 rounded p-3 overflow-auto max-h-52 whitespace-pre-wrap font-mono leading-relaxed") {{ pretty(selectedTool.requestPayload || selectedTool.requestPreview) }}
      div(class="flex flex-col gap-2")
        span(class="text-xs font-semibold text-gray-500") Response
        pre(class="text-xs bg-gray-50 border border-gray-100 rounded p-3 overflow-auto max-h-52 whitespace-pre-wrap font-mono leading-relaxed") {{ pretty(selectedTool.responsePayload || selectedTool.responsePreview) }}
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { Mixins } from '@/util/mixin'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { Variant } from '@/features/ui/clickables/model'
import { Size } from '@/features/ui/clickables/model'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { formatCurrency, formatDate, formatDurationMs, formatNumber } from '@/util/format'
import { type StackedBarSegment } from '@/features/ui/stacked-bar/StackedBar.global.vue'
import {
  HyperstrateApi,
  type HyperstrateServerInternalModulesObservabilityDomainAgentSessionInsights as Insights,
  type HyperstrateServerInternalModulesObservabilityDomainAgentSessionSummary as AgentSession,
  type HyperstrateServerInternalModulesObservabilityDomainToolCallArchive as ToolArchive,
  type InternalModulesObservabilityInterfacesHttpReplayResult as ReplayResult,
  type InternalModulesObservabilityInterfacesHttpInferenceLogResponse as LogRow,
} from '@/__generated__/hyperstrate-api'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

@Component
export default class AgentSessionView extends Mixins(ApiClientsMixin) {
  public readonly Variant = Variant
  public readonly Size = Size

  // activeTurn = turn shown in the inline detail panel (set by clicking a row)
  // drawerLog  = log shown in the full-screen drawer (set only by "View full log")
  public activeTurn?: LogRow = undefined
  public drawerLog?: LogRow = undefined
  public selectedTool?: ToolArchive = undefined
  public logs: LogRow[] = []
  public insights?: Insights = undefined
  public logsLoading = false
  public insightsLoading = false
  public replayLoading = false
  public replayResults: Record<string, ReplayResult> = {}

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  // ── Route ─────────────────────────────────────────────────────────────────

  public get sessionId(): string {
    return String(this.$route.params.sessionId ?? '')
  }

  private get from(): string | undefined {
    const v = this.$route.query.from
    return typeof v === 'string' && DATE_RE.test(v) ? v : undefined
  }

  private get to(): string | undefined {
    const v = this.$route.query.to
    return typeof v === 'string' && DATE_RE.test(v) ? v : undefined
  }

  public goBack(): void {
    void this.$router.push({ name: 'AppAnalytics', query: { ...this.$route.query, tab: 'agents' } })
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  public mounted(): void {
    void Promise.all([this.loadLogs(), this.loadInsights()])
  }

  private async loadLogs(): Promise<void> {
    if (!this.sessionId) return
    this.logsLoading = true
    try {
      const { data } = await this.api.analyticsAgentSessionsSessionIdLogsGet({
        sessionId: this.sessionId,
        from: this.from,
        to: this.to,
        page: 1,
        perPage: 300,
      })
      this.logs = data.items ?? []
    } finally {
      this.logsLoading = false
    }
  }

  private async loadInsights(): Promise<void> {
    if (!this.sessionId) return
    this.insightsLoading = true
    try {
      const { data } = await this.api.analyticsAgentSessionsSessionIdInsightsGet({ sessionId: this.sessionId })
      this.insights = data.data
    } finally {
      this.insightsLoading = false
    }
  }

  // ── Derived session summary ───────────────────────────────────────────────

  public get agent(): string {
    return this.logs[0]?.agent ?? ''
  }

  public get avgQuality(): number {
    const scored = this.logs.filter((l) => (l.qualityScore ?? 0) > 0)
    if (!scored.length) return 0
    return scored.reduce((s, l) => s + (l.qualityScore ?? 0), 0) / scored.length
  }

  public get insightSession(): AgentSession | undefined {
    if (!this.logs.length) return undefined
    const l = this.logs
    const scored = l.filter((r) => (r.qualityScore ?? 0) > 0)
    const filled = l.filter((r) => (r.contextFillPct ?? 0) > 0)
    return {
      sessionId: this.sessionId,
      agent: this.agent,
      turns: l.length,
      inputTokens: l.reduce((s, r) => s + (r.inputTokens ?? 0), 0),
      outputTokens: l.reduce((s, r) => s + (r.outputTokens ?? 0), 0),
      cachedInputTokens: l.reduce((s, r) => s + (r.cachedInputTokens ?? 0), 0),
      totalTokens: l.reduce((s, r) => s + (r.totalTokens ?? 0), 0),
      costUsd: l.reduce((s, r) => s + (r.costUsd ?? 0), 0),
      toolCallCount: l.reduce((s, r) => s + (r.toolCallCount ?? 0), 0),
      errorCount: l.filter((r) => r.status === 'error').length,
      loopCount: l.filter((r) => r.loopDetected).length,
      avgQualityScore: this.avgQuality,
      avgContextFillPct: filled.length ? filled.reduce((s, r) => s + (r.contextFillPct ?? 0), 0) / filled.length : 0,
      avgQualityScore2: scored.length ? scored.reduce((s, r) => s + (r.qualityScore ?? 0), 0) / scored.length : 0,
      startedAt: l[0]?.createdAt ?? '',
      lastSeenAt: l[l.length - 1]?.createdAt ?? '',
    } as unknown as AgentSession
  }

  public get headerStats(): { label: string; value: string; cls: string }[] {
    const s = this.insightSession
    if (!s) return []
    return [
      { label: 'Turns', value: formatNumber(s.turns ?? 0), cls: 'text-gray-700' },
      { label: 'Input', value: formatNumber(s.inputTokens ?? 0), cls: 'text-indigo-600' },
      { label: 'Cached', value: formatNumber(s.cachedInputTokens ?? 0), cls: 'text-emerald-600' },
      { label: 'Output', value: formatNumber(s.outputTokens ?? 0), cls: 'text-violet-600' },
      { label: 'Cost', value: formatCurrency(s.costUsd ?? 0), cls: 'text-gray-700' },
      { label: 'Tools', value: formatNumber(s.toolCallCount ?? 0), cls: 'text-gray-700' },
      { label: 'Errors', value: String(s.errorCount ?? 0), cls: (s.errorCount ?? 0) > 0 ? 'text-red-500' : 'text-gray-400' },
      { label: 'Loops', value: String(s.loopCount ?? 0), cls: (s.loopCount ?? 0) > 0 ? 'text-orange-500' : 'text-gray-400' },
    ]
  }

  public get gaugeColor(): string {
    const s = this.avgQuality
    return s >= 90 ? '#34d399' : s >= 70 ? '#fbbf24' : '#f87171'
  }

  public get gaugeTextClass(): string {
    const s = this.avgQuality
    return s >= 90 ? 'text-emerald-600' : s >= 70 ? 'text-amber-500' : s > 0 ? 'text-red-500' : 'text-gray-400'
  }

  // ── Turn stream ───────────────────────────────────────────────────────────

  public get maxTurnTokens(): number {
    return Math.max(...this.logs.map((l) => l.totalTokens ?? 0), 1)
  }

  public qualityDotClass(log: LogRow): string {
    if (log.status === 'error') return 'bg-red-400'
    if (log.loopDetected) return 'bg-orange-400'
    const q = log.qualityScore ?? 0
    if (q >= 90) return 'bg-emerald-400'
    if (q >= 70) return 'bg-amber-400'
    if (q > 0) return 'bg-red-300'
    return 'bg-gray-200'
  }

  public shortNum(n: number | undefined): string {
    const v = n ?? 0
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
    if (v >= 1000) return `${(v / 1000).toFixed(1)}k`
    return String(v)
  }

  // ── Turn selection ────────────────────────────────────────────────────────

  public selectTurn(log: LogRow): void {
    this.activeTurn = this.activeTurn?.id === log.id ? undefined : log
  }

  public toolsFor(logId: string | undefined): ToolArchive[] {
    if (!logId) return []
    return (this.insights?.toolArchives ?? []).filter((t) => t.logId === logId)
  }

  public hasPipeline(log: LogRow): boolean {
    return Array.isArray(log.pipelineSteps) && log.pipelineSteps.length > 0
  }

  public turnSegments(log: LogRow): StackedBarSegment[] {
    const cached = Math.min(log.cachedInputTokens ?? 0, log.inputTokens ?? 0)
    const input = (log.inputTokens ?? 0) - cached
    return [
      { value: cached, colorClass: 'bg-emerald-300', label: `${formatNumber(cached)} cached` },
      { value: input, colorClass: 'bg-indigo-300', label: `${formatNumber(input)} input` },
      { value: log.outputTokens ?? 0, colorClass: 'bg-violet-300', label: `${formatNumber(log.outputTokens ?? 0)} output` },
    ]
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  public async openTool(archive: ToolArchive): Promise<void> {
    this.selectedTool = archive
    if (!archive.id) return
    try {
      const { data } = await this.api.analyticsToolArchivesIdGet({ id: archive.id })
      this.selectedTool = data.data || archive
    } catch {
      /* keep preview */
    }
  }

  public async submitFeedback(log: LogRow, feedback: number): Promise<void> {
    if (!log.id) return
    const prev = log.feedback
    log.feedback = feedback
    try {
      await this.api.analyticsInferenceLogsIdFeedbackPatch({ id: log.id, body: { feedback } })
    } catch {
      log.feedback = prev
    }
  }

  public async replayTurn(log: LogRow | undefined): Promise<void> {
    if (!log?.id || this.replayLoading) return
    this.replayLoading = true
    try {
      const { data } = await this.api.analyticsInferenceLogsIdReplayPost({ id: log.id })
      this.replayResults = { ...this.replayResults, [log.id]: data }
    } finally {
      this.replayLoading = false
    }
  }

  public replayFor(id: string | undefined): ReplayResult | undefined {
    return id ? this.replayResults[id] : undefined
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  public modelName(log: LogRow): string {
    return log.model?.displayName || log.modelDefKey || log.modelId || '—'
  }

  public fillTextClass(pct: number | undefined): string {
    const p = pct ?? 0
    return p >= 75 ? 'text-red-500' : p >= 50 ? 'text-amber-500' : 'text-gray-400'
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
    return ms && ms > 0 ? formatDurationMs(ms) : '—'
  }
  public formatDate(s: string | undefined): string {
    return formatDate(s ?? '')
  }

  public pretty(s: string | undefined): string {
    if (!s) return ''
    try {
      return JSON.stringify(JSON.parse(s), null, 2)
    } catch {
      return s
    }
  }
}
</script>
