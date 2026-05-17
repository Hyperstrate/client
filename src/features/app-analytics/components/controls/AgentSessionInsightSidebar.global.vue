<template lang="pug">
div(class="w-72 xl:w-80 shrink-0 flex flex-col overflow-y-auto max-h-[680px]")
  div(class="px-4 py-4 border-b border-gray-100")
    div(class="text-[10px] uppercase tracking-wide text-gray-400 mb-2") Context health
    div(class="flex flex-col gap-2")
      div
        div(class="flex justify-between text-[11px] mb-1")
          span(class="text-gray-500") Avg fill
          span(:class="fillTextClass(session.avgContextFillPct)" class="font-medium tabular-nums") {{ formatPct(session.avgContextFillPct) }}
        ui-progress-bar(:value="session.avgContextFillPct ?? 0" :fill-class="fillBarClass(session.avgContextFillPct)" :height="8")
      div(v-if="(session.compressionSavedChars ?? 0) > 0" class="flex items-center justify-between text-[11px]")
        span(class="text-gray-400") Compression saved
        span(class="text-emerald-600 font-medium tabular-nums") {{ formatNum(session.compressionSavedChars) }} chars

  div(v-if="(insights?.loopDetections?.length ?? 0) > 0" class="px-4 py-4 border-b border-gray-100")
    div(class="text-[10px] uppercase tracking-wide text-gray-400 mb-2") Loop detections ({{ insights?.loopDetections?.length }})
    div(class="flex flex-col gap-2")
      div(v-for="loop in insights?.loopDetections ?? []" :key="loop.logId" class="flex items-start gap-2")
        div(class="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1 shrink-0")
        div
          p(class="text-[11px] text-orange-700") {{ loop.reason }}
          span(class="text-[10px] text-gray-400") Turn {{ loop.turnIndex }} - {{ formatCost(loop.costUsd) }}

  div(v-if="(insights?.compressionEvents?.length ?? 0) > 0" class="px-4 py-4 border-b border-gray-100")
    div(class="text-[10px] uppercase tracking-wide text-gray-400 mb-2") Compression events ({{ insights?.compressionEvents?.length }})
    div(class="flex flex-col gap-2")
      div(v-for="ev in insights?.compressionEvents ?? []" :key="ev.id" class="flex items-start gap-2")
        div(class="flex-1")
          div(class="flex items-center justify-between text-[11px]")
            span(class="font-mono text-gray-600") {{ ev.featureName }}
            span(class="text-emerald-600 font-medium tabular-nums") {{ formatNum(ev.estimatedTokensSaved ?? 0) }} tok
          ui-progress-bar(:value="ev.savedChars ?? 0" :max="ev.beforeChars ?? 1" fill-class="bg-emerald-400" :height="6" class="mt-1")
          span(class="text-[10px] text-gray-400") {{ formatNum(ev.beforeChars ?? 0) }} -> {{ formatNum(ev.afterChars ?? 0) }}

  div(class="px-4 py-4 border-b border-gray-100")
    div(class="mb-2")
      span(class="text-[10px] uppercase tracking-wide text-gray-400") Checkpoints & agents
    div(class="flex flex-col gap-1.5")
      div(v-for="ev in insights?.events ?? []" :key="ev.id" class="flex items-center gap-2")
        div(:class="eventDotClass(ev.eventType)" class="w-1.5 h-1.5 rounded-full shrink-0")
        div(class="flex-1 min-w-0")
          span(class="text-[11px] font-mono text-gray-600 truncate block") {{ ev.eventType }}
          span(v-if="ev.detail" class="text-[10px] text-gray-400 truncate block") {{ ev.detail }}
      div(v-for="sub in insights?.subagents ?? []" :key="`${sub.agentSessionId}-${sub.agentRole}`" class="flex items-center gap-2")
        domain-ui-agent-badge(:agent="sub.agent")
        div(class="flex-1 min-w-0")
          span(class="text-[11px] font-mono text-gray-600 truncate block") {{ sub.agentRole || 'worker' }}
          span(class="text-[10px] text-gray-400") {{ sub.turns }}t - {{ formatCost(sub.costUsd) }}
      div(v-if="!insights?.events?.length && !insights?.subagents?.length" class="text-[11px] text-gray-300") None recorded

  div(v-if="(insights?.costlyPrompts?.length ?? 0) > 0" class="px-4 py-4")
    div(class="text-[10px] uppercase tracking-wide text-gray-400 mb-2") Costly prompts
    div(class="flex flex-col gap-2")
      div(v-for="p in insights?.costlyPrompts ?? []" :key="p.logId" class="flex flex-col gap-0.5")
        div(class="flex items-center justify-between text-[11px]")
          span(class="font-mono text-gray-500 truncate") {{ p.modelDefKey || 'unknown' }}
          span(class="text-gray-600 font-medium tabular-nums shrink-0") {{ formatCost(p.costUsd) }}
        p(class="text-[10px] text-gray-400 line-clamp-2") {{ p.promptPreview || 'Payload logging disabled' }}
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { OptionalProp, RequiredProp } from '@/util/prop-decorators'
import { formatCurrency, formatNumber, formatPercent } from '@/util/format'
import {
  type HyperstrateServerInternalModulesObservabilityDomainAgentSessionInsights as Insights,
  type HyperstrateServerInternalModulesObservabilityDomainAgentSessionSummary as AgentSession,
} from '@/__generated__/hyperstrate-api'

@Component
export default class AgentSessionInsightSidebar extends Vue {
  @RequiredProp()
  public readonly session!: AgentSession

  @OptionalProp()
  public readonly insights?: Insights

  public formatNum(n: number | undefined): string {
    return formatNumber(n ?? 0)
  }
  public formatCost(n: number | undefined): string {
    return formatCurrency(n ?? 0)
  }
  public formatPct(n: number | undefined): string {
    return formatPercent(n ?? 0)
  }

  public fillBarClass(pct: number | undefined): string {
    if ((pct ?? 0) >= 75) return 'bg-red-400'
    if ((pct ?? 0) >= 50) return 'bg-amber-400'
    return 'bg-emerald-400'
  }

  public fillTextClass(pct: number | undefined): string {
    if ((pct ?? 0) >= 75) return 'text-red-500'
    if ((pct ?? 0) >= 50) return 'text-amber-500'
    return 'text-gray-500'
  }

  public eventDotClass(type: string | undefined): string {
    switch (type) {
      case 'checkpoint_created':
        return 'bg-indigo-400'
      case 'compaction_started':
        return 'bg-amber-400'
      case 'compaction_completed':
        return 'bg-emerald-400'
      case 'session_end':
        return 'bg-gray-400'
      case 'clear':
        return 'bg-orange-400'
      default:
        return 'bg-gray-300'
    }
  }
}
</script>
