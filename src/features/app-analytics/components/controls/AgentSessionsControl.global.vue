<template lang="pug">
div(class="flex flex-col gap-4")
  //- ── Aggregate strip ─────────────────────────────────────────────────────
  div(class="grid grid-cols-2 md:grid-cols-6 gap-4")
    app-analytics-stat-card(label="Sessions" :value="sessionRows.length")
    app-analytics-stat-card(label="Total cost" :value="shownCost" format="cost")
    app-analytics-stat-card(label="Tokens" :value="shownTokens")
    app-analytics-stat-card(label="Cached" :value="shownCachedTokens")
    app-analytics-stat-card(label="Avg quality" :value="shownQuality")
    app-analytics-stat-card(label="Loops" :value="shownLoops")

  //- ── Sessions table ───────────────────────────────────────────────────────
  div(class="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden")
    //- Header + agent filters
    div(class="px-5 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3")
      div
        h2(class="text-sm font-semibold text-gray-700") Agent sessions
        p(class="text-xs text-gray-400 mt-0.5") Click any row to view the session timeline
      div(class="flex flex-wrap gap-1.5 rounded-lg border border-gray-100 bg-gray-50 p-1")
        ui-tooltip(v-for="filter in agentFilters" :key="filter.value" :content="filter.label")
          ui-clickable(tag="button" type="button" :aria-label="filter.label" :class="filterClass(filter)" @click="setFilter(filter.value)")
            ui-icon(:icon="filter.icon" :size="18" class="shrink-0")

    ui-table(
      :rows="sessionRows"
      :columns="columns"
      :loading="loading"
      empty-message="No sessions in this period"
      :row-classes="() => ['cursor-pointer group hover:bg-indigo-50/40 transition-colors']"
      @row-click="openSession(asSession($event.row))"
    )
      //- Agent: badge + truncated session hash
      template(#agent="{ row }")
        div(class="flex flex-col gap-1")
          domain-ui-agent-badge(:agent="asSession(row).agent")
          span(class="font-mono text-[10px] text-gray-400") {{ asSession(row).sessionId?.slice(-10) }}

      //- When: relative time + duration
      template(#when="{ row }")
        div(class="flex flex-col gap-0.5")
          span(class="text-xs text-gray-600 whitespace-nowrap") {{ relativeTime(asSession(row).startedAt) }}
          span(v-if="sessionDuration(asSession(row))" class="text-[10px] text-gray-400") {{ sessionDuration(asSession(row)) }}

      //- Tokens: stacked bar wrapped in tooltip showing per-segment breakdown
      template(#tokens="{ row }")
        ui-tooltip
          template(#content)
            div(class="flex flex-col gap-1.5 py-0.5")
              div(v-if="(asSession(row).cachedInputTokens ?? 0) > 0" class="flex items-center gap-2")
                div(class="w-2.5 h-2.5 rounded-xs bg-emerald-400 shrink-0")
                span(class="text-xs text-gray-700") {{ formatNum(asSession(row).cachedInputTokens) }} cached
              div(class="flex items-center gap-2")
                div(class="w-2.5 h-2.5 rounded-xs bg-indigo-400 shrink-0")
                span(class="text-xs text-gray-700") {{ formatNum((asSession(row).inputTokens ?? 0) - (asSession(row).cachedInputTokens ?? 0)) }} input
              div(class="flex items-center gap-2")
                div(class="w-2.5 h-2.5 rounded-xs bg-violet-400 shrink-0")
                span(class="text-xs text-gray-700") {{ formatNum(asSession(row).outputTokens) }} output
              div(class="border-t border-white/20 pt-1.5 mt-0.5 flex items-center gap-2")
                div(class="w-2.5 h-2.5 shrink-0")
                span(class="text-xs text-gray-500") {{ formatNum(asSession(row).totalTokens) }} total
          div(class="flex items-center gap-2 w-full cursor-default")
            ui-stacked-bar(:segments="tokenSegments(asSession(row))" :max="maxTokens" :height="12" class="flex-1")
            span(class="text-[11px] tabular-nums text-gray-400 shrink-0 w-14 text-right") {{ formatNum(asSession(row).totalTokens) }}

      //- Quality: score + progress bar
      template(#quality="{ row }")
        domain-ui-quality-score(:score="asSession(row).avgQualityScore")

      //- Cost: primary + optional subagent cost
      template(#cost="{ row }")
        div(class="flex flex-col items-end")
          span(class="text-xs text-gray-700 tabular-nums font-medium") {{ formatCost(asSession(row).costUsd) }}
          span(v-if="asSession(row).subagentCostUsd" class="text-[10px] text-gray-400") +{{ formatCost(asSession(row).subagentCostUsd) }}

      //- Activity: turns + tool count
      template(#activity="{ row }")
        div(class="flex flex-col items-end gap-0.5")
          span(class="text-xs text-gray-600 tabular-nums") {{ asSession(row).turns }}t
          span(v-if="(asSession(row).toolCallCount ?? 0) > 0" class="text-[10px] text-gray-400") {{ asSession(row).toolCallCount }} tools

      //- Health: error + loop badges (rendered only when problems exist)
      template(#health="{ row }")
        div(class="flex flex-col items-end gap-0.5")
          ui-badge(v-if="(asSession(row).errorCount ?? 0) > 0" :variant="Variant.Red") {{ asSession(row).errorCount }} err
          ui-badge(v-if="asSession(row).loopCount" :variant="Variant.Orange") {{ asSession(row).loopCount }} loop

      //- Drill: chevron that tints on row hover via group class
      template(#drill)
        ui-icon(icon="chevron-right" size="16" class="text-gray-200 group-hover:text-indigo-400 transition-colors")

    div(v-if="pages > 1" class="px-5 py-3 border-t border-gray-100")
      ui-pagination(v-model="page" :pages="pages" :per-page="perPage" :total="total" @update:per-page="onPerPageChange")
</template>

<script lang="ts">
import { Component, Watch } from 'vue-facing-decorator'
import { StringProp } from '@/util/prop-decorators'
import { Mixins } from '@/util/mixin'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import AgentsMixin from '@/features/core/components/mixins/agents.mixin'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import { PaginationMixin } from '@/features/core/components/mixins/pagination.mixin'
import { AsyncData } from '@/util/async-data.decorator'
import { type Column } from '@/features/ui/table/model'
import { Size, Variant } from '@/features/ui/clickables/model'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { formatCurrency, formatNumber } from '@/util/format'
import { type StackedBarSegment } from '@/features/ui/stacked-bar/StackedBar.global.vue'
import { type Component as VueComponent } from 'vue'
import {
  HyperstrateApi,
  type HyperstrateServerInternalModulesObservabilityDomainAgentSessionSummary as AgentSession,
  type HyperstrateServerInternalSharedPaginationPaginatedMeta as PaginatedMeta,
} from '@/__generated__/hyperstrate-api'

type AgentFilter = {
  value: string
  label: string
  icon: string | VueComponent
}

@Component
export default class AgentSessionsControl extends Mixins(ApiClientsMixin, LoadingMixin, PaginationMixin, AgentsMixin) {
  public readonly Variant = Variant

  @StringProp(true)
  public readonly from!: string

  @StringProp(true)
  public readonly to!: string

  public sessionRows: AgentSession[] = []
  public meta?: PaginatedMeta = undefined
  public agent = ''

  protected pageSize = 30

  protected get total(): number {
    return this.meta?.total ?? 0
  }
  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  // ── Table columns ─────────────────────────────────────────────────────────
  // Widths are set on all columns except 'tokens', which takes the remaining space.

  public readonly columns: Column[] = [
    { name: 'agent', label: 'Agent', width: '160px', accessor: (r) => (r as AgentSession).agent },
    { name: 'when', label: 'When', width: '120px', accessor: (r) => (r as AgentSession).startedAt },
    { name: 'tokens', label: 'Token usage', accessor: (r) => (r as AgentSession).totalTokens },
    { name: 'quality', label: 'Quality', align: 'center', width: '80px', accessor: (r) => (r as AgentSession).avgQualityScore },
    { name: 'cost', label: 'Cost', align: 'right', width: '88px', accessor: (r) => (r as AgentSession).costUsd },
    { name: 'activity', label: 'Turns', align: 'right', width: '80px', accessor: (r) => (r as AgentSession).turns },
    { name: 'health', label: '', align: 'right', width: '72px', accessor: (r) => (r as AgentSession).errorCount },
    { name: 'drill', label: '', align: 'right', width: '32px', accessor: (r) => (r as AgentSession).sessionId },
  ]

  // ── Aggregates ─────────────────────────────────────────────────────────────

  public get shownCost(): number {
    return this.sessionRows.reduce((s, r) => s + (r.costUsd ?? 0), 0)
  }
  public get shownTokens(): number {
    return this.sessionRows.reduce((s, r) => s + (r.totalTokens ?? 0), 0)
  }
  public get shownCachedTokens(): number {
    return this.sessionRows.reduce((s, r) => s + (r.cachedInputTokens ?? 0), 0)
  }
  public get shownLoops(): number {
    return this.sessionRows.reduce((s, r) => s + (r.loopCount ?? 0), 0)
  }

  public get shownQuality(): number {
    const scores = this.sessionRows.map((r) => r.avgQualityScore ?? 0).filter(Boolean)
    return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  }

  /** Max total tokens across the visible page — scales all token bars together. */
  public get maxTokens(): number {
    return Math.max(...this.sessionRows.map((r) => r.totalTokens ?? 0), 1)
  }

  public get agentFilters(): AgentFilter[] {
    return [
      { value: '', label: 'All agents', icon: 'sparkles' },
      ...this.agents.map((agent) => ({
        value: agent.name,
        label: agent.label,
        icon: agent.icons?.[Size.SM] ?? 'ai',
      })),
    ]
  }

  // ── Token bar ──────────────────────────────────────────────────────────────

  public tokenSegments(s: AgentSession): StackedBarSegment[] {
    const cached = Math.min(s.cachedInputTokens ?? 0, s.inputTokens ?? 0)
    const input = (s.inputTokens ?? 0) - cached
    const output = s.outputTokens ?? 0
    return [
      { value: cached, colorClass: 'bg-emerald-300', label: `${this.formatNum(cached)} cached` },
      { value: input, colorClass: 'bg-indigo-300', label: `${this.formatNum(input)} input` },
      { value: output, colorClass: 'bg-violet-300', label: `${this.formatNum(output)} output` },
    ]
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  public openSession(s: AgentSession): void {
    if (!s.sessionId) return
    void this.$router.push({
      name: 'AppAnalytics/AgentSession',
      params: { sessionId: s.sessionId },
      query: { from: this.from, to: this.to },
    })
  }

  public asSession(row: unknown): AgentSession {
    return row as AgentSession
  }

  // ── Filter ─────────────────────────────────────────────────────────────────

  public setFilter(value: string): void {
    if (this.agent === value) return
    this.agent = value
    this.page = 1
    void this.asyncData()
  }

  public filterClass(filter: AgentFilter): string {
    const active = this.agent === filter.value
    return [
      'inline-flex h-8 w-8 items-center justify-center rounded-md border bg-white transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-200',
      active
        ? 'border-indigo-300 text-indigo-600 shadow-xs ring-2 ring-indigo-100'
        : 'border-transparent text-gray-500 opacity-70 hover:border-gray-200 hover:text-gray-700 hover:opacity-100 hover:shadow-xs',
    ].join(' ')
  }

  // ── Time helpers ───────────────────────────────────────────────────────────

  public relativeTime(iso: string | undefined): string {
    if (!iso) return ''
    const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
    if (min < 1) return 'just now'
    if (min < 60) return `${min}m ago`
    const h = Math.floor(min / 60)
    if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24)
    return d === 1 ? 'yesterday' : `${d}d ago`
  }

  public sessionDuration(s: AgentSession): string {
    if (!s.startedAt || !s.lastSeenAt) return ''
    const min = Math.floor((new Date(s.lastSeenAt).getTime() - new Date(s.startedAt).getTime()) / 60000)
    if (min < 1) return ''
    if (min < 60) return `${min}m`
    const h = Math.floor(min / 60)
    const m = min % 60
    return m ? `${h}h ${m}m` : `${h}h`
  }

  public formatCost(n: number | undefined): string {
    return formatCurrency(n ?? 0)
  }
  public formatNum(n: number | undefined): string {
    return formatNumber(n ?? 0)
  }

  // ── Watchers ───────────────────────────────────────────────────────────────

  @Watch('from')
  @Watch('to')
  public onFiltersChange(): void {
    this.page = 1
    void this.asyncData()
  }

  @Watch('page')
  protected async onPageChange(): Promise<void> {
    await this.asyncData()
  }

  public onPerPageChange(v: number): void {
    this.pageSize = v
    this.page = 1
    void this.asyncData()
  }

  // ── Data ───────────────────────────────────────────────────────────────────

  @AsyncData()
  public async asyncData(): Promise<AsyncData<AgentSessionsControl>> {
    this.setLoading(true)
    try {
      const { data } = await this.api.analyticsAgentSessionsGet({
        from: this.from,
        to: this.to,
        page: this.page,
        perPage: this.perPage,
        agent: this.agent || undefined,
      })
      return { sessionRows: data.items ?? [], meta: data.meta }
    } finally {
      this.setLoading(false)
    }
  }
}
</script>
