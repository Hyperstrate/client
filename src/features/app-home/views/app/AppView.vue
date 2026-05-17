<template lang="pug">
ui-layout(use="core-default-layout")
  div(class="min-h-full flex flex-col bg-white")
    //- ─── Hero ───────────────────────────────────────────────────────
    div(class="hero-bg border-b border-gray-100 px-6 py-8")
      div(class="max-w-screen-lg mx-auto flex flex-col gap-7 px-4")
        div(class="flex items-center justify-between gap-4")
          ui-badge(:variant="Variant.Green" dot) Open-source AI gateway
          ui-clickable(to="/analytics" class="inline-flex items-center gap-1.5 type-label hover:!text-gray-900 transition-colors")
            | Analytics
            ui-icon(icon="arrow-diagonal-top-right" :size="12")

        div(class="flex flex-col gap-5")
          div(class="flex flex-col gap-3 max-w-2xl")
            h1(class="type-display")
              | Route, cache & observe
              br
              span(class="text-gray-400") AI calls from one gateway.
            p(class="type-body-muted max-w-xl")
              | Build routing pipelines, monitor cost and latency, and expose one OpenAI-compatible endpoint to your apps.

          div(class="flex flex-wrap gap-2.5")
            ui-clickable(
              to="/model"
              class="inline-flex items-center gap-2 px-4 py-2.5 text-sm type-button text-white bg-zinc-900 hover:bg-zinc-700 rounded-lg transition-colors"
            )
              ui-icon(icon="ai" :size="20")
              | Register Model
            ui-clickable(
              to="/router"
              class="inline-flex items-center gap-2 px-4 py-2.5 text-sm type-button text-zinc-600 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg transition-colors"
            )
              ui-icon(icon="router" :size="16")
              | Build Router

        div(class="grid grid-cols-2 lg:grid-cols-4 bg-white/80 border border-gray-100 rounded-xl shadow-xs overflow-hidden")
          div(class="home-metric")
            span(class="type-caption") 7-day requests
            span(class="type-metric !text-lg") {{ formatNum(totals.requests) }}
          div(class="home-metric")
            span(class="type-caption") Cost
            span(class="type-metric !text-lg !text-emerald-600") {{ formatCost(totals.cost) }}
          div(class="home-metric")
            span(class="type-caption") Cache hit
            span(class="type-metric !text-lg" :class="cacheStats && cacheStats.hitRatePct > 20 ? '!text-emerald-600' : '!text-gray-900'") {{ cacheHitLabel }}
          div(class="home-metric")
            span(class="type-caption") Error rate
            span(class="type-metric !text-lg" :class="totals.errorRate > 5 ? '!text-red-500' : '!text-gray-900'") {{ formatPercent(totals.errorRate) }}

    //- ─── Interactive Pipeline ───────────────────────────────────────
    div(class="border-b border-gray-100 bg-white px-6 py-8")
      div(class="max-w-screen-lg mx-auto px-4 flex flex-col gap-5")
        //- Header + scenario tabs
        div(class="flex items-center justify-between flex-wrap gap-3")
          div
            ui-overline Request pipeline
            p(class="type-caption mt-0.5") See how different requests flow through your gateway
          div(class="flex items-center gap-1.5 flex-wrap")
            ui-button(
              v-for="(sc, i) in scenarios"
              :key="sc.id"
              :size="Size.SM"
              :variant="Variant.Gray"
              outlined
              class="!rounded-full"
              :class="i === currentScenarioIdx ? scenarioActiveClass(sc) : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'"
              @click="selectScenario(i)"
            )
              div(v-if="i === currentScenarioIdx" class="size-1.5 shrink-0 rounded-full" :class="scenarioDotClass(sc)")
              | {{ sc.label }}

        //- Stage nodes row
        div(class="relative")
          div(class="flex items-center")
            div(v-for="(stage, i) in STAGES" :key="stage.id" class="flex items-center flex-1")
              //- Node
              div(class="flex flex-col items-center gap-2 shrink-0")
                div(class="relative w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-300" :class="nodeClass(i)")
                  ui-icon(:icon="stage.icon" :size="16")
                  //- State badge
                  div(
                    v-if="nodeBadgeIcon(i)"
                    class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-white font-bold"
                    :class="badgeClass(i)"
                    style="font-size: 9px"
                  )
                    ui-icon(:icon="nodeBadgeIcon(i)" :size="10")
                span(class="type-caption text-center leading-tight max-w-[52px]") {{ stage.label }}
              //- Connector
              div(v-if="i < STAGES.length - 1" class="flex-1 relative h-px mx-2 overflow-visible mt-[-20px]")
                div(class="absolute inset-0" :class="connectorClass(i)")
                div(v-if="isConnectorFlowing(i)" class="flow-particle" :style="{ animationDuration: connectorAnimDuration(i) }")

        //- Detail / result bar — fixed h-14 so height never shifts between states
        div(class="h-14 rounded-xl border px-5 flex items-center gap-3 transition-all duration-500" :class="detailBarClass")
          template(v-if="showResult")
            div(class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" :class="resultIconBg")
              ui-icon(:icon="resultOk ? 'check' : 'close'" :size="14" :class="resultIconColor")
            span(class="type-code !text-sm !font-semibold" :class="resultTextColor") {{ scenarios[currentScenarioIdx].result }}
          template(v-else-if="stepDetail")
            div(class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shrink-0")
            span(class="type-code !text-sm truncate") {{ stepDetail }}
          template(v-else)
            div(class="w-2 h-2 rounded-full bg-gray-200 shrink-0")
            span(class="type-body-muted !text-gray-400") Waiting for next request...

    //- ─── Insights + Activity ────────────────────────────────────────
    div(class="flex-1 bg-gray-50 px-6 py-8")
      div(class="max-w-screen-lg mx-auto px-4 flex flex-col gap-6")
        div(class="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6")
          ui-card
            div(class="flex items-center justify-between mb-4 gap-3")
              div
                h2(class="type-section-title") Requests over time
                p(class="type-caption mt-0.5") Daily request volume for the last 7 days
              span(class="type-number !font-semibold !text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg") {{ formatNum(totals.requests) }} total
            div(v-if="loading" class="h-40 rounded-lg bg-gray-50 animate-pulse")
            ui-empty-state(v-else-if="!requestsOverTime.length" heading="No data for this period")
            app-analytics-line-chart(v-else :data="requestsOverTime" :height="160" color="#4f46e5" :format-y="formatNum")

          div(class="flex flex-col gap-4")
            ui-card(class="flex flex-col gap-4")
              div(class="flex items-center justify-between")
                h2(class="type-section-title") Model Traffic
                span(class="type-caption") {{ logs.length }} recent
              div(v-if="logsLoading && !logs.length" class="flex flex-col gap-2.5")
                div(v-for="i in 4" :key="i" class="h-3 rounded bg-gray-100 animate-pulse")
              ui-empty-state(v-else-if="!topModels.length" heading="No requests yet")
              div(v-else class="flex flex-col gap-3")
                div(v-for="model in topModels" :key="model.model" class="flex flex-col gap-1")
                  div(class="flex items-center justify-between gap-2")
                    span(class="type-code truncate") {{ model.model }}
                    div(class="flex items-center gap-2 shrink-0")
                      span(class="type-number !text-gray-400") {{ model.requests }}
                      span(class="type-number !text-zinc-500") {{ formatPercent(model.pct, 0) }}
                  ui-progress-bar(:value="model.pct" :fill-class="model.fillClass" :height="6")

            ui-card(class="flex flex-col gap-4")
              div(class="flex items-center justify-between")
                h2(class="type-section-title") Cache
                span(v-if="cacheStats" class="type-number !font-semibold !text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg") {{ formatPercent(cacheStats.hitRatePct) }}
              div(v-if="cacheLoading" class="flex flex-col gap-3")
                div(v-for="i in 3" :key="i" class="h-3 rounded bg-gray-100 animate-pulse")
              ui-empty-state(v-else-if="!cacheStats || !cacheStats.totalRequests" heading="No cache data")
              div(v-else class="flex flex-col gap-3")
                ui-progress-bar(:value="cacheStats.hitRatePct" fill-class="bg-indigo-500" :height="8")
                div(class="grid grid-cols-2 gap-2")
                  div(class="flex flex-col gap-0.5")
                    span(class="type-caption") Hits
                    span(class="type-number !text-sm !font-semibold !text-gray-900") {{ formatNumber(cacheStats.cacheHits) }}
                  div(class="flex flex-col gap-0.5")
                    span(class="type-caption") Misses
                    span(class="type-number !text-sm !font-semibold !text-gray-900") {{ formatNumber(cacheStats.totalRequests - cacheStats.cacheHits) }}

        div(class="grid grid-cols-1 lg:grid-cols-[1fr_256px] gap-6")
          //- Live activity
          div(class="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden")
            div(class="flex items-center justify-between px-5 py-3.5 border-b border-gray-50")
              div(class="flex items-center gap-2.5")
                h2(class="type-section-title") Recent Requests
                ui-badge(v-if="logs.length" :variant="Variant.Green" dot :size="Size.SM") Live
              ui-clickable(to="/analytics?tab=logs" class="type-caption hover:!text-gray-700 transition-colors flex items-center gap-0.5")
                | View all logs
                ui-icon(icon="arrow-diagonal-top-right" :size="11")
            div(v-if="activitySummary" class="flex items-center gap-5 px-5 py-2 bg-gray-50/50 border-b border-gray-50 type-caption !text-gray-500")
              span
                span(class="font-numeric font-semibold tabular-nums text-gray-700") {{ activitySummary.count }}
                |
                |
                | requests
              span(v-if="activitySummary.avgLatency")
                span(class="font-numeric font-semibold tabular-nums text-gray-700") {{ activitySummary.avgLatency }}ms
                |
                |
                | avg
              span
                span(class="font-numeric font-semibold tabular-nums" :class="activitySummary.errors > 0 ? 'text-red-600' : 'text-gray-700'") {{ activitySummary.errors }}
                |
                |
                | errors
              span
                span(class="font-numeric font-semibold tabular-nums text-emerald-600") {{ formatCost(activitySummary.totalCost) }}
                |
                |
                | cost
            div(class="grid request-row items-center gap-3 px-5 py-2 border-b border-gray-100 bg-gray-50/80")
              span(class="type-overline") Model
              span(class="type-overline hidden sm:block") Router
              span(class="type-overline text-right") Latency
              span(class="type-overline text-right hidden md:block") Tokens
              span(class="type-overline text-right hidden md:block") Cost
              span(class="type-overline text-right") Age
            div(v-if="logsLoading && !logs.length" class="flex flex-col divide-y divide-gray-50")
              div(v-for="i in 6" :key="i" class="flex items-center gap-3 px-5 py-3")
                div(class="w-1.5 h-1.5 rounded-full bg-gray-100 shrink-0 animate-pulse")
                div(class="flex-1 h-2.5 rounded bg-gray-100 animate-pulse")
                div(class="w-12 h-2.5 rounded bg-gray-100 animate-pulse")
            ui-empty-state(v-else-if="!logs.length" heading="No requests yet")
            transition-group(v-else name="log-row" tag="div" class="flex flex-col divide-y divide-gray-50")
              div(v-for="log in logs" :key="log.id" class="grid request-row items-center gap-3 px-5 py-2.5 hover:bg-gray-50/60 transition-colors")
                div(class="flex items-center gap-2.5 min-w-0")
                  div(class="w-1.5 h-1.5 rounded-full shrink-0" :class="isError(log) ? 'bg-red-400' : 'bg-emerald-400'")
                  span(class="type-code !text-sm !text-gray-800 truncate") {{ modelLabel(log) }}
                span(class="type-code !text-gray-400 truncate hidden sm:block") {{ log.router ? '/' + log.router.name : '—' }}
                span(class="type-number text-right" :class="isError(log) ? '!text-red-500' : '!text-gray-600'") {{ log.latencyMs !== undefined ? log.latencyMs + 'ms' : '—' }}
                span(class="type-number !text-gray-400 text-right hidden md:block") {{ tokenLabel(log) || '—' }}
                span(class="type-number text-right hidden md:block" :class="logCost(log) ? '!text-emerald-600' : '!text-gray-300'") {{ logCost(log) || '—' }}
                span(class="type-number !text-gray-300 text-right") {{ timeAgo(log.createdAt) }}

          //- Sections
          div(class="flex flex-col gap-3")
            ui-overline Sections
            div(class="flex flex-col gap-0.5")
              ui-clickable(
                v-for="section in SECTIONS"
                :key="section.to"
                :to="section.to"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:bg-white hover:border-gray-100 hover:shadow-xs transition-all group"
              )
                div(class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" :style="{ background: section.bg }")
                  ui-icon(:icon="section.icon" :size="14" :style="{ color: section.color }")
                div(class="flex flex-col flex-1 min-w-0")
                  span(class="type-card-title leading-tight") {{ section.label }}
                  span(class="type-caption truncate") {{ section.desc }}
                ui-icon(icon="arrow-diagonal-top-right" :size="12" class="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0")
</template>

<script lang="ts">
import { Component, Watch } from 'vue-facing-decorator'
import { Mixins } from '@/util/mixin'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { AsyncData } from '@/util/async-data.decorator'
import { HyperstrateApi, InternalModulesObservabilityInterfacesHttpInferenceLogResponse } from '@/__generated__/hyperstrate-api'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import { Size, Variant } from '@/features/ui/clickables/model'
import { countUp } from '@/util/count-up'
import { formatAdaptiveCurrency, formatCompactNumber, formatCurrency, formatNumber, formatPercent } from '@/util/format'

type Log = InternalModulesObservabilityInterfacesHttpInferenceLogResponse
type StageState = 'idle' | 'active' | 'success' | 'miss' | 'hit' | 'blocked' | 'error' | 'skip' | 'cached'

interface UsageRow {
  bucket: string
  requests: number
  inputTokens: number
  outputTokens: number
  costUsd: number
  errorCount: number
}

interface CacheStats {
  totalRequests: number
  cacheHits: number
  exactHits: number
  semanticHits: number
  hitRatePct: number
}

interface ChartPoint {
  bucket: string
  value: number
}

interface Totals {
  requests: number
  tokens: number
  cost: number
  errorRate: number
}

interface KpiCard {
  label: string
  value: string
  color: string
  sparkline: ChartPoint[]
  chartColor: string
  formatY: (value: number) => string
}

interface TopModel {
  model: string
  requests: number
  cost: number
  pct: number
  fillClass: string
}

interface ActivitySummary {
  count: number
  avgLatency: number | null
  errors: number
  totalCost: number
}

interface PlayStep {
  stageIdx: number
  state: Exclude<StageState, 'idle' | 'active'>
  detail: string
  duration: number
}

interface Scenario {
  id: string
  label: string
  color: string
  steps: PlayStep[]
  result: string
  resultOk: boolean
}

const toISODate = (d: Date): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const MODEL_FILL_CLASSES = ['bg-indigo-500', 'bg-cyan-600', 'bg-emerald-600', 'bg-amber-500', 'bg-violet-600', 'bg-pink-600']

const STAGES = [
  { id: 'rate-limit', icon: 'switches', label: 'Rate Limit' },
  { id: 'cache', icon: 'refresh', label: 'Cache' },
  { id: 'intercept', icon: 'cogs', label: 'Intercept' },
  { id: 'target', icon: 'router', label: 'Target' },
  { id: 'inference', icon: 'ai', label: 'Inference' },
  { id: 'response', icon: 'check', label: 'Response' },
]

const SCENARIOS: Scenario[] = [
  {
    id: 'normal',
    label: 'Normal',
    color: 'indigo',
    steps: [
      { stageIdx: 0, state: 'success', detail: 'Rate limit: pass — api-key-prod · 75/100 rps', duration: 900 },
      { stageIdx: 1, state: 'miss', detail: 'Cache: miss — prompt hash not found, forwarding', duration: 1100 },
      { stageIdx: 2, state: 'success', detail: 'Interceptors: pass — content_filter, prompt_guard', duration: 900 },
      { stageIdx: 3, state: 'success', detail: 'Target: selected gpt-4o-mini (round-robin)', duration: 700 },
      { stageIdx: 4, state: 'success', detail: 'Inference: POST /v1/chat/completions to gpt-4o-mini', duration: 2200 },
      { stageIdx: 5, state: 'cached', detail: 'Response: 200 OK — stored in cache for next time', duration: 700 },
    ],
    result: '200 OK · 248ms · 1.2k tokens · $0.0004',
    resultOk: true,
  },
  {
    id: 'cache-hit',
    label: 'Cache Hit',
    color: 'emerald',
    steps: [
      { stageIdx: 0, state: 'success', detail: 'Rate limit: pass — api-key-prod · 22/100 rps', duration: 800 },
      { stageIdx: 1, state: 'hit', detail: 'Cache: HIT — exact match found, returning cached response', duration: 900 },
      { stageIdx: 2, state: 'skip', detail: '', duration: 0 },
      { stageIdx: 3, state: 'skip', detail: '', duration: 0 },
      { stageIdx: 4, state: 'skip', detail: '', duration: 0 },
      { stageIdx: 5, state: 'cached', detail: 'Response: 200 OK — served from cache in 0.4ms', duration: 700 },
    ],
    result: '200 OK · 0.4ms · from cache · $0.0000',
    resultOk: true,
  },
  {
    id: 'rate-limited',
    label: 'Rate Limited',
    color: 'red',
    steps: [
      { stageIdx: 0, state: 'blocked', detail: 'Rate limit: BLOCKED — 100/100 rps limit reached for api-key-prod', duration: 1000 },
      { stageIdx: 1, state: 'skip', detail: '', duration: 0 },
      { stageIdx: 2, state: 'skip', detail: '', duration: 0 },
      { stageIdx: 3, state: 'skip', detail: '', duration: 0 },
      { stageIdx: 4, state: 'skip', detail: '', duration: 0 },
      { stageIdx: 5, state: 'error', detail: 'Response: 429 Too Many Requests', duration: 700 },
    ],
    result: '429 · Rate limit exceeded · 0ms',
    resultOk: false,
  },
  {
    id: 'pii-blocked',
    label: 'PII Blocked',
    color: 'orange',
    steps: [
      { stageIdx: 0, state: 'success', detail: 'Rate limit: pass — api-key-dev · 8/100 rps', duration: 800 },
      { stageIdx: 1, state: 'miss', detail: 'Cache: miss — prompt not in cache', duration: 1000 },
      { stageIdx: 2, state: 'blocked', detail: 'Interceptors: BLOCKED — pii_detector found SSN in prompt', duration: 1000 },
      { stageIdx: 3, state: 'skip', detail: '', duration: 0 },
      { stageIdx: 4, state: 'skip', detail: '', duration: 0 },
      { stageIdx: 5, state: 'error', detail: 'Response: 403 Forbidden — PII detected and removed', duration: 700 },
    ],
    result: '403 · PII detected by interceptor · 14ms',
    resultOk: false,
  },
]

const SECTIONS = [
  { to: '/model', icon: 'ai', label: 'AI Models', desc: 'Register providers and model endpoints', bg: '#f1f5f9', color: '#64748b' },
  { to: '/router', icon: 'router', label: 'Routers', desc: 'Build pipelines with strategies and features', bg: '#eff6ff', color: '#3b82f6' },
  { to: '/chat', icon: 'chat', label: 'Chat', desc: 'Test inference with models and routers', bg: '#f0fdf4', color: '#10b981' },
  { to: '/analytics', icon: 'bar-chart', label: 'Analytics', desc: 'Monitor usage, cost, latency and errors', bg: '#eef2ff', color: '#6366f1' },
  { to: '/auth', icon: 'lock', label: 'Auth', desc: 'Manage API keys and team access control', bg: '#faf5ff', color: '#8b5cf6' },
]

@Component
export default class AppView extends Mixins(ApiClientsMixin, LoadingMixin) {
  public readonly Size = Size
  public readonly Variant = Variant

  public readonly STAGES = STAGES
  public readonly scenarios = SCENARIOS
  public readonly SECTIONS = SECTIONS

  // ── API data ─────────────────────────────────────────────────────
  public usageRows: UsageRow[] = []
  public cacheStats?: CacheStats = undefined
  public displayTotals = { requests: 0, tokens: 0, cost: 0, errorRate: 0 }
  public logs: Log[] = []
  public logsLoading = false
  public cacheLoading = false
  private pollTimer?: ReturnType<typeof setInterval>

  // ── Animation state ───────────────────────────────────────────────
  public stageStates: Record<number, StageState> = {}
  public activeStageIdx = -1
  public stepDetail = ''
  public showResult = false
  public currentScenarioIdx = 0
  private animTimer?: ReturnType<typeof setTimeout>

  // ── API ───────────────────────────────────────────────────────────
  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  // ── KPI cards ────────────────────────────────────────────────────
  public get kpiCards(): KpiCard[] {
    const t = this.displayTotals
    const cacheHit = this.cacheStats?.hitRatePct ?? null
    return [
      {
        label: 'Requests',
        value: this.formatNum(t.requests),
        color: 'text-gray-900',
        sparkline: this.requestsOverTime,
        chartColor: '#4f46e5',
        formatY: (v: number) => this.formatNum(v),
      },
      {
        label: 'Tokens',
        value: this.formatNum(t.tokens),
        color: 'text-gray-900',
        sparkline: this.tokensOverTime,
        chartColor: '#0891b2',
        formatY: (v: number) => this.formatNum(v),
      },
      {
        label: 'Cost',
        value: this.formatCost(t.cost),
        color: 'text-emerald-600',
        sparkline: this.costOverTime,
        chartColor: '#059669',
        formatY: (v: number) => this.formatCost(v),
      },
      {
        label: 'Cache hit',
        value: cacheHit !== null ? formatPercent(cacheHit) : this.cacheLoading ? '...' : '—',
        color: cacheHit !== null && cacheHit > 20 ? 'text-emerald-600' : 'text-gray-900',
        sparkline: [],
        chartColor: '#d97706',
        formatY: (v: number) => formatPercent(v),
      },
    ]
  }

  public get totals(): Totals {
    const requests = this.usageRows.reduce((s, r) => s + r.requests, 0)
    const tokens = this.usageRows.reduce((s, r) => s + r.inputTokens + r.outputTokens, 0)
    const cost = this.usageRows.reduce((s, r) => s + r.costUsd, 0)
    const errors = this.usageRows.reduce((s, r) => s + r.errorCount, 0)
    return { requests, tokens, cost, errorRate: requests > 0 ? (errors / requests) * 100 : 0 }
  }

  public get requestsOverTime(): ChartPoint[] {
    return this.usageRows.map((row) => ({ bucket: row.bucket, value: row.requests }))
  }

  public get tokensOverTime(): ChartPoint[] {
    return this.usageRows.map((row) => ({ bucket: row.bucket, value: row.inputTokens + row.outputTokens }))
  }

  public get costOverTime(): ChartPoint[] {
    return this.usageRows.map((row) => ({ bucket: row.bucket, value: row.costUsd }))
  }

  public get topModels(): TopModel[] {
    const modelCounts = new Map<string, { requests: number; cost: number }>()
    for (const log of this.logs) {
      const key = this.modelLabel(log)
      const current = modelCounts.get(key) ?? { requests: 0, cost: 0 }
      modelCounts.set(key, { requests: current.requests + 1, cost: current.cost + (log.costUsd ?? 0) })
    }
    const total = this.logs.length || 1
    return Array.from(modelCounts.entries())
      .sort(([, a], [, b]) => b.requests - a.requests)
      .slice(0, 5)
      .map(([model, stats], index) => ({
        model,
        requests: stats.requests,
        cost: stats.cost,
        pct: (stats.requests / total) * 100,
        fillClass: MODEL_FILL_CLASSES[index % MODEL_FILL_CLASSES.length],
      }))
  }

  public get cacheHitLabel(): string {
    if (this.cacheLoading) return '...'
    if (!this.cacheStats) return '—'
    return formatPercent(this.cacheStats.hitRatePct)
  }

  @Watch('totals', { deep: true })
  public onTotalsChange(): void {
    countUp(this.totals.requests, 700, (v) => {
      this.displayTotals.requests = v
    })
    countUp(this.totals.tokens, 700, (v) => {
      this.displayTotals.tokens = v
    })
    countUp(this.totals.cost, 700, (v) => {
      this.displayTotals.cost = v
    })
    countUp(this.totals.errorRate, 700, (v) => {
      this.displayTotals.errorRate = v
    })
  }

  // ── Pipeline state helpers ────────────────────────────────────────
  public getStageState(idx: number): StageState {
    if (idx === this.activeStageIdx) return 'active'
    return this.stageStates[idx] ?? 'idle'
  }

  public nodeClass(idx: number): string {
    const s = this.getStageState(idx)
    return (
      (
        {
          idle: 'bg-white border-gray-200 text-gray-300',
          active: 'bg-indigo-50 border-indigo-400 text-indigo-500 shadow-xs shadow-indigo-100',
          success: 'bg-emerald-50 border-emerald-300 text-emerald-500',
          miss: 'bg-amber-50 border-amber-300 text-amber-500',
          hit: 'bg-teal-50 border-teal-300 text-teal-500',
          cached: 'bg-emerald-50 border-emerald-300 text-emerald-500',
          blocked: 'bg-red-50 border-red-300 text-red-400',
          error: 'bg-red-50 border-red-300 text-red-400',
          skip: 'bg-gray-50 border-gray-100 text-gray-200 opacity-50',
        } as Record<StageState, string>
      )[s] ?? 'bg-white border-gray-200 text-gray-300'
    )
  }

  public nodeBadgeIcon(idx: number): string {
    const s = this.getStageState(idx)
    return (
      (
        { success: 'check', miss: 'arrow-right', hit: 'check', cached: 'check', blocked: 'close', error: 'close', skip: '', idle: '', active: '' } as Record<
          StageState,
          string
        >
      )[s] ?? ''
    )
  }

  public badgeClass(idx: number): string {
    const s = this.getStageState(idx)
    return (
      (
        {
          success: 'bg-emerald-500',
          miss: 'bg-amber-400',
          hit: 'bg-teal-500',
          cached: 'bg-emerald-500',
          blocked: 'bg-red-400',
          error: 'bg-red-400',
        } as Partial<Record<StageState, string>>
      )[s] ?? ''
    )
  }

  public connectorClass(idx: number): string {
    const s = this.getStageState(idx)
    if (s === 'skip' || s === 'idle') return 'bg-gray-100'
    if (s === 'blocked' || s === 'error') return 'bg-red-200'
    return 'bg-indigo-100'
  }

  // Particle only shows while the destination stage is actively processing.
  // This avoids the animation-duration switch that causes the visible duplicate/jump:
  // previously the particle appeared during the inter-step gap at 1800ms, then the
  // duration changed when the stage activated and CSS restarted the animation mid-travel.
  public isConnectorFlowing(idx: number): boolean {
    if (this.getStageState(idx + 1) !== 'active') return false
    return ['success', 'miss', 'hit', 'cached'].includes(this.getStageState(idx))
  }

  // Particle crosses the connector in exactly the time the destination stage takes to process
  public connectorAnimDuration(idx: number): string {
    const step = SCENARIOS[this.currentScenarioIdx].steps.find((s) => s.stageIdx === idx + 1 && s.duration > 0)
    return step ? `${step.duration}ms` : '1800ms'
  }

  // ── Scenario tabs ─────────────────────────────────────────────────
  public scenarioActiveClass(sc: Scenario): string {
    return (
      (
        {
          indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
          emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
          red: 'bg-red-50 border-red-200 text-red-600',
          orange: 'bg-orange-50 border-orange-200 text-orange-600',
        } as Record<string, string>
      )[sc.color] ?? 'bg-indigo-50 border-indigo-200 text-indigo-700'
    )
  }

  public scenarioDotClass(sc: Scenario): string {
    return (
      ({ indigo: 'bg-indigo-500', emerald: 'bg-emerald-500', red: 'bg-red-500', orange: 'bg-orange-500' } as Record<string, string>)[sc.color] ??
      'bg-indigo-500'
    )
  }

  // ── Detail bar ────────────────────────────────────────────────────
  public get detailBarClass(): string {
    if (!this.showResult && !this.stepDetail) return 'border-gray-100 bg-gray-50'
    if (this.showResult) {
      return this.scenarios[this.currentScenarioIdx].resultOk ? 'border-emerald-100 bg-emerald-50' : 'border-red-100 bg-red-50'
    }
    return 'border-indigo-100 bg-indigo-50'
  }

  public get resultOk(): boolean {
    return this.scenarios[this.currentScenarioIdx].resultOk
  }

  public get resultIconBg(): string {
    return this.resultOk ? 'bg-emerald-100' : 'bg-red-100'
  }

  public get resultIconColor(): string {
    return this.resultOk ? 'text-emerald-600' : 'text-red-500'
  }

  public get resultTextColor(): string {
    return this.resultOk ? 'text-emerald-700' : 'text-red-600'
  }

  // ── Animation ────────────────────────────────────────────────────
  public selectScenario(idx: number): void {
    if (this.animTimer) clearTimeout(this.animTimer)
    this.currentScenarioIdx = idx
    this.startScenario()
  }

  private startScenario(): void {
    this.stageStates = {}
    this.activeStageIdx = -1
    this.stepDetail = ''
    this.showResult = false

    const scenario = SCENARIOS[this.currentScenarioIdx]
    const play = (stepIdx: number): void => {
      if (stepIdx >= scenario.steps.length) {
        this.activeStageIdx = -1
        this.showResult = true
        this.animTimer = setTimeout(() => {
          this.currentScenarioIdx = (this.currentScenarioIdx + 1) % SCENARIOS.length
          this.startScenario()
        }, 3500)
        return
      }
      const step = scenario.steps[stepIdx]
      if (step.duration === 0) {
        this.stageStates = { ...this.stageStates, [step.stageIdx]: step.state }
        play(stepIdx + 1)
        return
      }
      this.activeStageIdx = step.stageIdx
      this.stepDetail = step.detail
      this.animTimer = setTimeout(() => {
        this.stageStates = { ...this.stageStates, [step.stageIdx]: step.state }
        this.activeStageIdx = -1
        this.animTimer = setTimeout(() => play(stepIdx + 1), 300)
      }, step.duration)
    }
    this.animTimer = setTimeout(() => play(0), 500)
  }

  // ── Log helpers ───────────────────────────────────────────────────
  public isError(log: Log): boolean {
    return !!log.errorMessage || log.status === 'error'
  }

  public modelLabel(log: Log): string {
    return log.model?.displayName || log.model?.alias || log.modelDefKey || log.provider || log.router?.name || '—'
  }

  public tokenLabel(log: Log): string {
    const total = (log.inputTokens ?? 0) + (log.outputTokens ?? 0)
    if (total === 0) return ''
    return formatCompactNumber(total)
  }

  public logCost(log: Log): string {
    const cost = log.costUsd ?? 0
    if (!cost) return ''
    return cost >= 0.01 ? formatCurrency(cost, 3) : formatCurrency(cost, 5)
  }

  public get activitySummary(): ActivitySummary | null {
    if (!this.logs.length) return null
    const withLatency = this.logs.filter((log) => log.latencyMs != null)
    return {
      count: this.logs.length,
      avgLatency: withLatency.length ? Math.round(withLatency.reduce((sum, log) => sum + log.latencyMs!, 0) / withLatency.length) : null,
      errors: this.logs.filter((log) => this.isError(log)).length,
      totalCost: this.logs.reduce((sum, log) => sum + (log.costUsd ?? 0), 0),
    }
  }

  public timeAgo(ts?: string): string {
    if (!ts) return ''
    const secs = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
    if (secs < 60) return `${secs}s`
    if (secs < 3600) return `${Math.floor(secs / 60)}m`
    return `${Math.floor(secs / 3600)}h`
  }

  // ── Formatting ────────────────────────────────────────────────────
  public readonly formatCost = formatAdaptiveCurrency
  public readonly formatNum = formatCompactNumber
  public readonly formatNumber = formatNumber
  public readonly formatPercent = formatPercent

  // ── Lifecycle ─────────────────────────────────────────────────────
  public async mounted(): Promise<void> {
    this.startScenario()
    await this.fetchLogs()
    this.pollTimer = setInterval(() => void this.fetchLogs(), 5_000)
  }

  public beforeUnmount(): void {
    if (this.animTimer) clearTimeout(this.animTimer)
    if (this.pollTimer) clearInterval(this.pollTimer)
  }

  private async fetchLogs(): Promise<void> {
    this.logsLoading = true
    try {
      const { data } = await this.api.analyticsInferenceLogsGet({ perPage: 12, page: 1 })
      this.logs = data.items ?? []
    } catch {
      /* silently ignore */
    } finally {
      this.logsLoading = false
    }
  }

  @AsyncData()
  public async asyncData(): Promise<AsyncData<AppView>> {
    this.setLoading(true)
    this.cacheLoading = true
    try {
      const from = toISODate(new Date(Date.now() - 7 * 86_400_000))
      const to = toISODate(new Date())
      const [usageRes, cacheRes] = await Promise.all([
        this.api.analyticsUsageGet({ from, to, granularity: 'day' }),
        this.api.analyticsCacheGet({ from, to }).catch(() => null),
      ])
      return {
        usageRows: (usageRes.data.data ?? []) as UsageRow[],
        cacheStats: (cacheRes?.data ?? undefined) as CacheStats | undefined,
      }
    } finally {
      this.setLoading(false)
      this.cacheLoading = false
    }
  }
}
</script>

<style scoped>
.request-row {
  grid-template-columns: 1fr 80px 68px 60px 60px 32px;
}
@media (max-width: 768px) {
  .request-row {
    grid-template-columns: 1fr 68px 32px;
  }
}
.hero-bg {
  background-color: #ffffff;
  background-image: radial-gradient(circle, #e4e4e7 1px, transparent 1px);
  background-size: 22px 22px;
}
.home-metric {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
  padding: 14px 16px;
  border-right: 1px solid #f3f4f6;
  border-bottom: 1px solid #f3f4f6;
}
.home-metric:nth-child(2n) {
  border-right: 0;
}
@media (min-width: 1024px) {
  .home-metric {
    border-bottom: 0;
  }
  .home-metric:nth-child(2n) {
    border-right: 1px solid #f3f4f6;
  }
  .home-metric:last-child {
    border-right: 0;
  }
}
.stat-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: #fff;
  border: 1px solid #f1f1f1;
  border-radius: 12px;
  padding: 12px 14px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
.flow-particle {
  position: absolute;
  top: 50%;
  left: 0;
  width: 24px;
  height: 2px;
  transform: translateY(-50%);
  background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.75), transparent);
  border-radius: 9999px;
  /* base duration — overridden per-connector by :style to match the destination stage's duration */
  animation: flow-anim 1800ms linear infinite;
}
@keyframes flow-anim {
  0% {
    left: 0%;
    opacity: 0;
  }
  8% {
    left: 0%;
    opacity: 1;
  }
  88% {
    left: calc(100% - 24px);
    opacity: 1;
  }
  100% {
    left: calc(100% - 24px);
    opacity: 0;
  }
}
.log-row-enter-active {
  transition:
    opacity 220ms ease,
    transform 220ms ease;
}
.log-row-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
