<template lang="pug">
div(class="flex flex-col rounded-xl border border-indigo-100 shadow-xs bg-white overflow-hidden")
  //- Session header bar
  div(class="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-white via-gray-50/40 to-white")
    div(class="flex items-center justify-between gap-6 flex-wrap")
      //- Left: agent badge + session id + time range
      div(class="flex flex-col gap-1.5")
        div(class="flex items-center gap-3")
          domain-ui-agent-badge(:agent="displaySession.agent")
          span(class="font-mono text-[11px] text-gray-400") {{ displaySession.sessionId?.slice(-16) ?? '-' }}
        span(class="text-xs text-gray-400") {{ formatDate(displaySession.startedAt) }} -> {{ formatDate(displaySession.lastSeenAt) }}
      //- Right: stat chips + quality gauge
      div(class="flex items-center gap-6")
        div(class="flex items-center gap-4 flex-wrap")
          div(v-for="stat in headerStats" :key="stat.label" class="flex flex-col gap-0.5")
            span(class="text-[10px] uppercase tracking-wide text-gray-400") {{ stat.label }}
            span(:class="stat.valueClass" class="text-sm font-semibold tabular-nums") {{ stat.value }}
        div(class="shrink-0")
          ui-round-progress(:value="displaySession.avgQualityScore ?? 0" :color="gaugeColor" :size="48" :stroke-width="4")
            span(:class="gaugeTextClass" class="text-xs font-bold tabular-nums") {{ displaySession.avgQualityScore ? Math.round(displaySession.avgQualityScore) : '-' }}

  //- Two-pane layout
  div(class="flex min-h-0")
    //- LEFT: Turn timeline
    div(class="flex-1 flex flex-col min-w-0 border-r border-gray-100")
      div(class="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/60")
        div(class="flex items-center gap-2")
          span(class="text-xs font-semibold text-gray-600") Turns
          span(class="text-[11px] text-gray-400") {{ logs.length }} loaded
        //- Legend
        div(class="flex items-center gap-3 text-[10px] text-gray-400")
          div(class="flex items-center gap-1")
            div(class="w-3 h-1.5 rounded bg-indigo-300")
            span input
          div(class="flex items-center gap-1")
            div(class="w-3 h-1.5 rounded bg-emerald-300")
            span cached
          div(class="flex items-center gap-1")
            div(class="w-3 h-1.5 rounded bg-violet-300")
            span output
      div(v-if="logsLoading" class="px-6 py-8 text-xs text-gray-400") Loading turns...
      div(v-else-if="!logs.length" class="px-6 py-8 text-xs text-gray-400") No turns in this session
      div(v-else class="overflow-y-auto max-h-[680px] divide-y divide-gray-50/80")
        agent-turn-item(
          v-for="log in logs"
          :key="log.id"
          :log="log"
          :tool-archives="toolArchivesFor(log.id)"
          :expanded="expandedId === log.id"
          @toggle="toggleExpand(log.id)"
          @view-log="selectedLog = $event"
          @open-tool="openToolArchive"
        )

    app-analytics-agent-session-insight-sidebar(:session="displaySession" :insights="insights")

  //- Log detail drawer
  app-analytics-inference-log-detail-drawer(:log="selectedLog" @close="selectedLog = undefined" @feedback="submitFeedback")

  //- Tool archive drawer
  ui-drawer(:model-value="!!selectedTool" title="Tool call archive" @close="selectedTool = undefined")
    div(v-if="selectedTool" class="px-6 py-5 flex flex-col gap-4")
      div(class="grid grid-cols-2 gap-x-6 gap-y-3")
        div
          span(class="text-xs text-gray-400 block mb-0.5") Tool
          span(class="font-mono text-xs text-gray-700") {{ selectedTool.toolName || '-' }}
        div
          span(class="text-xs text-gray-400 block mb-0.5") Status
          ui-badge(:variant="selectedTool.errorMessage ? Variant.Red : Variant.Green") {{ selectedTool.errorMessage ? 'error' : 'ok' }}
        div
          span(class="text-xs text-gray-400 block mb-0.5") Response chars
          span(class="font-numeric tabular-nums text-gray-700") {{ formatNum(selectedTool.responseChars) }}
        div
          span(class="text-xs text-gray-400 block mb-0.5") Time
          span(class="text-gray-700") {{ formatDate(selectedTool.createdAt) }}
      div(v-if="selectedTool.errorMessage" class="rounded-lg bg-red-50 border border-red-100 px-4 py-3")
        p(class="text-xs text-red-700 font-mono whitespace-pre-wrap") {{ selectedTool.errorMessage }}
      div(class="flex flex-col gap-2")
        span(class="text-xs font-semibold text-gray-500") Request
        pre(class="text-xs bg-gray-50 border border-gray-100 rounded p-3 overflow-auto max-h-48 whitespace-pre-wrap font-mono leading-relaxed") {{ pretty(selectedTool.requestPayload || selectedTool.requestPreview) }}
      div(class="flex flex-col gap-2")
        span(class="text-xs font-semibold text-gray-500") Response
        pre(class="text-xs bg-gray-50 border border-gray-100 rounded p-3 overflow-auto max-h-48 whitespace-pre-wrap font-mono leading-relaxed") {{ pretty(selectedTool.responsePayload || selectedTool.responsePreview) }}
</template>

<script lang="ts">
import { Component, Watch } from 'vue-facing-decorator'
import { OptionalProp, StringProp } from '@/util/prop-decorators'
import { Mixins } from '@/util/mixin'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { Variant } from '@/features/ui/clickables/model'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { formatCurrency, formatDate, formatNumber } from '@/util/format'
import {
  HyperstrateApi,
  type HyperstrateServerInternalModulesObservabilityDomainAgentSessionSummary as AgentSession,
  type HyperstrateServerInternalModulesObservabilityDomainAgentSessionInsights as Insights,
  type HyperstrateServerInternalModulesObservabilityDomainToolCallArchive as ToolArchive,
  type InternalModulesObservabilityInterfacesHttpInferenceLogResponse as LogRow,
} from '@/__generated__/hyperstrate-api'
import AgentTurnItem from './AgentTurnItem.vue'

@Component({ components: { AgentTurnItem } })
export default class AgentSessionDetailPanel extends Mixins(ApiClientsMixin) {
  public readonly Variant = Variant

  @StringProp(true)
  public readonly sessionId!: string

  @OptionalProp()
  public readonly session?: AgentSession

  @StringProp()
  public readonly from?: string

  @StringProp()
  public readonly to?: string

  public logs: LogRow[] = []
  public insights?: Insights = undefined
  public logsLoading = false
  public insightsLoading = false
  public expandedId?: string = undefined
  public selectedLog?: LogRow = undefined
  public selectedTool?: ToolArchive = undefined

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  // Lifecycle

  public mounted(): void {
    void this.load()
  }

  @Watch('sessionId')
  public onSessionChange(): void {
    this.logs = []
    this.insights = undefined
    this.expandedId = undefined
    this.selectedLog = undefined
    this.selectedTool = undefined
    void this.load()
  }

  @Watch('from')
  @Watch('to')
  public onDateRangeChange(): void {
    if (this.sessionId) void this.loadLogs(this.sessionId)
  }

  private async load(): Promise<void> {
    const id = this.sessionId
    if (!id) return
    await Promise.all([this.loadLogs(id), this.loadInsights(id)])
  }

  private async loadLogs(sessionId: string): Promise<void> {
    this.logsLoading = true
    try {
      const { data } = await this.api.analyticsAgentSessionsSessionIdLogsGet({
        sessionId,
        from: this.from || undefined,
        to: this.to || undefined,
        page: 1,
        perPage: 200,
      })
      this.logs = data.items ?? []
    } finally {
      this.logsLoading = false
    }
  }

  private async loadInsights(sessionId: string): Promise<void> {
    this.insightsLoading = true
    try {
      const { data } = await this.api.analyticsAgentSessionsSessionIdInsightsGet({ sessionId })
      this.insights = data.data
    } finally {
      this.insightsLoading = false
    }
  }

  // Helpers

  public toolArchivesFor(logId: string | undefined): ToolArchive[] {
    if (!logId) return []
    return (this.insights?.toolArchives ?? []).filter((t) => t.logId === logId)
  }

  public toggleExpand(logId: string | undefined): void {
    this.expandedId = this.expandedId === logId ? undefined : logId
  }

  public async openToolArchive(archive: ToolArchive): Promise<void> {
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

  public pretty(s: string | undefined): string {
    if (!s) return ''
    try {
      return JSON.stringify(JSON.parse(s), null, 2)
    } catch {
      return s
    }
  }

  public formatDate(s: string | undefined): string {
    return formatDate(s ?? '')
  }
  public formatNum(n: number | undefined): string {
    return formatNumber(n ?? 0)
  }
  public formatCost(n: number | undefined): string {
    return formatCurrency(n ?? 0)
  }

  // Header stats

  private sum(fn: (log: LogRow) => number | undefined): number {
    return this.logs.reduce((total, log) => total + (fn(log) ?? 0), 0)
  }

  private average(fn: (log: LogRow) => number | undefined): number | undefined {
    const values = this.logs.map(fn).filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : undefined
  }

  private firstText(fn: (log: LogRow) => string | undefined): string | undefined {
    return this.logs.map(fn).find(Boolean)
  }

  private timeBoundary(kind: 'min' | 'max'): string | undefined {
    const times = this.logs.map((log) => Date.parse(log.createdAt ?? '')).filter(Number.isFinite)
    if (!times.length) return undefined
    return new Date(kind === 'min' ? Math.min(...times) : Math.max(...times)).toISOString()
  }

  private get fallbackSession(): AgentSession {
    const compressionEvents = this.insights?.compressionEvents ?? []
    const subagents = this.insights?.subagents ?? []
    const archivedTools = this.insights?.toolArchives ?? []
    const toolCallCount = this.sum((log) => log.toolCallCount) || archivedTools.length

    return {
      sessionId: this.sessionId,
      agent: this.firstText((log) => log.agent) ?? 'unknown',
      routerId: this.firstText((log) => log.routerId),
      virtualKeyId: this.firstText((log) => log.virtualKeyId),
      teamId: this.firstText((log) => log.teamId),
      userId: this.firstText((log) => log.userId),
      startedAt: this.timeBoundary('min'),
      lastSeenAt: this.timeBoundary('max'),
      turns: this.logs.length,
      inputTokens: this.sum((log) => log.inputTokens),
      outputTokens: this.sum((log) => log.outputTokens),
      cachedInputTokens: this.sum((log) => log.cachedInputTokens),
      totalTokens: this.sum((log) => log.totalTokens),
      costUsd: this.sum((log) => log.costUsd),
      cacheHits: this.logs.filter((log) => log.cacheHit).length,
      errorCount: this.logs.filter((log) => log.errorMessage || log.status === 'error').length,
      toolCallCount,
      toolResultChars: this.sum((log) => log.toolResultChars),
      avgQualityScore: this.insights?.qualityScore ?? this.average((log) => log.qualityScore),
      avgContextFillPct: this.average((log) => log.contextFillPct),
      loopCount: this.insights?.loopDetections?.length ?? this.logs.filter((log) => log.loopDetected).length,
      checkpoints: this.insights?.events?.filter((ev) => ev.eventType === 'checkpoint_created').length,
      compressionEvents: compressionEvents.length,
      compressionSavedChars: compressionEvents.reduce((total, ev) => total + (ev.savedChars ?? 0), 0),
      subagentCostUsd: subagents.reduce((total, sub) => total + (sub.costUsd ?? 0), 0),
    }
  }

  public get displaySession(): AgentSession {
    return { ...this.fallbackSession, ...(this.session ?? {}) }
  }

  public get gaugeColor(): string {
    const s = this.displaySession.avgQualityScore ?? 0
    if (s >= 90) return '#34d399'
    if (s >= 70) return '#fbbf24'
    return '#f87171'
  }

  public get gaugeTextClass(): string {
    const s = this.displaySession.avgQualityScore ?? 0
    if (s >= 90) return 'text-emerald-600'
    if (s >= 70) return 'text-amber-500'
    if (s > 0) return 'text-red-500'
    return 'text-gray-400'
  }

  public get headerStats(): { label: string; value: string; valueClass: string }[] {
    const s = this.displaySession
    return [
      { label: 'Turns', value: formatNumber(s.turns ?? 0), valueClass: 'text-gray-700' },
      { label: 'Tokens', value: formatNumber(s.totalTokens ?? 0), valueClass: 'text-gray-700' },
      { label: 'Cached', value: formatNumber(s.cachedInputTokens ?? 0), valueClass: 'text-emerald-600' },
      { label: 'Cost', value: formatCurrency(s.costUsd ?? 0), valueClass: 'text-gray-700' },
      { label: 'Tools', value: formatNumber(s.toolCallCount ?? 0), valueClass: 'text-gray-700' },
      { label: 'Errors', value: String(s.errorCount ?? 0), valueClass: (s.errorCount ?? 0) > 0 ? 'text-red-500' : 'text-gray-700' },
    ]
  }
}
</script>
