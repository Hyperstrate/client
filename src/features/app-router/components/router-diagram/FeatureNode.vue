<template lang="pug">
div(class="bg-white rounded-xl border shadow-xs min-w-[210px] overflow-hidden" :class="data.feature.isEnabled ? 'border-gray-200' : 'border-gray-100'")
  div(class="flex items-center gap-2.5 px-3 py-2.5")
    //- Icon badge
    div(
      class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors"
      :class="data.feature.isEnabled ? featureMeta.cls : 'bg-gray-100 text-gray-300'"
    )
      ui-icon(:icon="featureMeta.icon" :size="13")

    //- Content
    div(class="min-w-0 flex-1 flex flex-col gap-0.5")
      span(class="text-xs font-semibold truncate" :class="data.feature.isEnabled ? 'text-gray-800' : 'text-gray-400'") {{ featureLabel }}
      span(v-if="featureDetail" class="text-xs text-gray-400 truncate") {{ featureDetail }}

    //- Execution order
    ui-badge(:variant="data.feature.isEnabled ? Variant.Purple : Variant.Gray" :size="Size.SM") {{ data.feature.executionOrder + 1 }}

  handle#feat-top(type="source" :position="Position.Top")
</template>

<script lang="ts">
import {
  HyperstrateServerInternalModulesRouterApplicationRouterFeatureResponse,
  HyperstrateServerInternalModulesRouterDomainRouterFeatureType,
} from '@/__generated__/hyperstrate-api'
import { Variant, Size } from '@/features/ui/clickables/model'
import { Handle, Position } from '@vue-flow/core'
import { Component, Vue } from 'vue-facing-decorator'
import { RequiredProp } from '@/util/prop-decorators'
import { formatCurrency, formatNumber } from '@/util/format'

const FT = HyperstrateServerInternalModulesRouterDomainRouterFeatureType

type FeatureMeta = { icon: string; cls: string }

const FEATURE_META: Partial<Record<string, FeatureMeta>> = {
  [FT.FeatureTokenOptimization]: { icon: 'cogs', cls: 'bg-zinc-100 text-zinc-500' },
  [FT.FeatureContextTrimming]: { icon: 'cogs', cls: 'bg-zinc-100 text-zinc-500' },
  [FT.FeatureTokenCostOptimization]: { icon: 'dollar-bill', cls: 'bg-green-100 text-green-600' },
  [FT.FeaturePromptOptimizer]: { icon: 'sparkles', cls: 'bg-purple-100 text-purple-600' },
  [FT.FeaturePromptPolicyRollout]: { icon: 'git-branch', cls: 'bg-blue-100 text-blue-600' },
  [FT.FeatureResponseCache]: { icon: 'database', cls: 'bg-teal-100 text-teal-600' },
  [FT.FeatureSemanticCache]: { icon: 'search', cls: 'bg-teal-100 text-teal-600' },
  [FT.FeaturePromptCaching]: { icon: 'database', cls: 'bg-teal-100 text-teal-600' },
  [FT.FeatureRetry]: { icon: 'refresh', cls: 'bg-amber-100 text-amber-600' },
  [FT.FeatureFallback]: { icon: 'git-branch', cls: 'bg-amber-100 text-amber-600' },
  [FT.FeatureHealthCheck]: { icon: 'gauge', cls: 'bg-green-100 text-green-600' },
  [FT.FeatureRequestCoalescing]: { icon: 'refresh', cls: 'bg-sky-100 text-sky-600' },
  [FT.FeatureRateLimit]: { icon: 'gauge', cls: 'bg-orange-100 text-orange-600' },
  [FT.FeatureBudget]: { icon: 'dollar-bill', cls: 'bg-red-100 text-red-600' },
  [FT.FeatureCostAwareRouting]: { icon: 'dollar-bill', cls: 'bg-green-100 text-green-600' },
  [FT.FeatureMCPTools]: { icon: 'puzzle-piece', cls: 'bg-violet-100 text-violet-600' },
  [FT.FeatureStructuredOutput]: { icon: 'check', cls: 'bg-emerald-100 text-emerald-600' },
  [FT.FeatureHedging]: { icon: 'chats', cls: 'bg-pink-100 text-pink-600' },
  [FT.FeatureQualityGate]: { icon: 'check', cls: 'bg-emerald-100 text-emerald-600' },
  [FT.FeatureContextCompression]: { icon: 'cogs', cls: 'bg-zinc-100 text-zinc-500' },
  [FT.FeatureSemanticMemory]: { icon: 'sparkles', cls: 'bg-violet-100 text-violet-600' },
  [FT.FeatureResponsePrefetch]: { icon: 'clock', cls: 'bg-sky-100 text-sky-600' },
  [FT.FeatureResponseFingerprinting]: { icon: 'bar-chart', cls: 'bg-orange-100 text-orange-600' },
}

const FEATURE_LABELS: Record<string, string> = {
  [FT.FeatureTokenOptimization]: 'Token Optimization',
  [FT.FeatureContextTrimming]: 'Context Trimming',
  [FT.FeatureTokenCostOptimization]: 'Token Cost Optimization',
  [FT.FeaturePromptOptimizer]: 'Prompt Optimizer',
  [FT.FeaturePromptPolicyRollout]: 'Prompt/Policy Rollout',
  [FT.FeatureResponseCache]: 'Response Cache',
  [FT.FeatureSemanticCache]: 'Semantic Cache',
  [FT.FeaturePromptCaching]: 'Prompt Caching',
  [FT.FeatureRetry]: 'Retry',
  [FT.FeatureFallback]: 'Fallback',
  [FT.FeatureHealthCheck]: 'Auto-Degradation',
  [FT.FeatureRequestCoalescing]: 'Request Coalescing',
  [FT.FeatureRateLimit]: 'Rate Limit',
  [FT.FeatureBudget]: 'Budget',
  [FT.FeatureCostAwareRouting]: 'Cost-Aware Routing',
  [FT.FeatureMCPTools]: 'MCP Tools',
  [FT.FeatureStructuredOutput]: 'Structured Output',
  [FT.FeatureHedging]: 'Hedging',
  [FT.FeatureQualityGate]: 'Quality Gate',
  [FT.FeatureContextCompression]: 'Context Compression',
  [FT.FeatureSemanticMemory]: 'Semantic Memory',
  [FT.FeatureResponsePrefetch]: 'Response Prefetch',
  [FT.FeatureResponseFingerprinting]: 'Response Fingerprinting',
}

@Component({ components: { Handle } })
export default class FeatureNode extends Vue {
  public readonly Position = Position
  public readonly Variant = Variant
  public readonly Size = Size

  @RequiredProp()
  public readonly data!: {
    feature: HyperstrateServerInternalModulesRouterApplicationRouterFeatureResponse
    modelDisplayNameMap: Record<string, string>
  }

  public get featureMeta(): FeatureMeta {
    return FEATURE_META[this.data.feature.featureType ?? ''] ?? { icon: 'switches', cls: 'bg-purple-100 text-purple-600' }
  }

  public get featureLabel(): string {
    const type = this.data.feature.featureType
    return type ? (FEATURE_LABELS[type] ?? type) : '—'
  }

  // eslint-disable-next-line complexity
  public get featureDetail(): string | undefined {
    const cfg = this.data.feature.config as Record<string, unknown> | undefined
    const type = this.data.feature.featureType
    if (!type || !cfg) return undefined

    const modelName = (id: unknown): string | undefined => {
      if (!id) return undefined
      return this.data.modelDisplayNameMap?.[id as string] ?? (id as string)
    }

    if (type === FT.FeatureTokenOptimization || type === FT.FeatureContextTrimming) {
      const v = cfg['max_chars'] as number | undefined
      return v ? `${formatNumber(v)} chars` : undefined
    }
    if (type === FT.FeatureResponseCache) {
      const v = cfg['ttl_seconds'] as number | undefined
      return v ? `TTL ${v}s` : undefined
    }
    if (type === FT.FeatureSemanticCache) {
      const parts: string[] = []
      const t = cfg['similarity_threshold'] as number | undefined
      const ttl = cfg['ttl_seconds'] as number | undefined
      if (t !== undefined) parts.push(`≥${t}`)
      if (ttl) parts.push(`TTL ${ttl}s`)
      return parts.join(' · ') || undefined
    }
    if (type === FT.FeatureRetry) {
      const v = cfg['max_retries'] as number | undefined
      return v ? `up to ${v} retries` : undefined
    }
    if (type === FT.FeatureRateLimit) {
      const rps = cfg['rps'] as number | undefined
      const burst = cfg['burst'] as number | undefined
      if (rps == null) return undefined
      return burst ? `${rps} rps · burst ${burst}` : `${rps} rps`
    }
    if (type === FT.FeatureBudget) {
      const parts: string[] = []
      const cost = cfg['max_cost_usd'] as number | undefined
      const reqs = cfg['max_requests'] as number | undefined
      const period = cfg['period'] as string | undefined
      if (cost) parts.push(formatCurrency(cost))
      if (reqs) parts.push(`${formatNumber(reqs)} req`)
      if (parts.length && period) parts.push(`/ ${period}`)
      return parts.join(' · ') || undefined
    }
    if (type === FT.FeatureMCPTools) {
      const ids = cfg['server_ids'] as string[] | undefined
      const turns = cfg['max_turns'] as number | undefined
      const parts: string[] = []
      if (ids?.length) parts.push(`${ids.length} server${ids.length !== 1 ? 's' : ''}`)
      if (turns) parts.push(`${turns} turns`)
      return parts.join(' · ') || undefined
    }
    if (type === FT.FeatureStructuredOutput) {
      const parts: string[] = []
      const name = cfg['name'] as string | undefined
      const strict = cfg['strict'] as boolean | undefined
      if (name) parts.push(name)
      if (strict) parts.push('strict')
      return parts.join(' · ') || undefined
    }
    if (type === FT.FeatureHedging) {
      const parts: string[] = []
      const ms = cfg['timeout_ms'] as number | undefined
      const qc = cfg['quality_check'] as string | undefined
      if (ms) parts.push(`${ms}ms`)
      if (qc && qc !== 'any') parts.push(qc.replace('_', ' '))
      return parts.join(' · ') || undefined
    }
    if (type === FT.FeatureQualityGate) {
      const parts: string[] = []
      const judgeId = cfg['judge_model_id'] as string | undefined
      const score = cfg['min_score'] as number | undefined
      if (judgeId) parts.push(modelName(judgeId) ?? judgeId)
      if (score != null) parts.push(`score ≥${score}`)
      return parts.join(' · ') || undefined
    }
    if (type === FT.FeatureContextCompression) {
      const parts: string[] = []
      const chars = cfg['max_chars'] as number | undefined
      const keep = cfg['keep_recent'] as number | undefined
      if (chars) parts.push(`${formatNumber(chars)} chars`)
      if (keep) parts.push(`keep ${keep}`)
      return parts.join(' · ') || undefined
    }
    if (type === FT.FeatureSemanticMemory) {
      const parts: string[] = []
      const mid = cfg['model_id'] as string | undefined
      const ex = cfg['max_examples'] as number | undefined
      if (mid) parts.push(modelName(mid) ?? mid)
      if (ex) parts.push(`${formatNumber(ex)} examples`)
      return parts.join(' · ') || undefined
    }
    if (type === FT.FeatureCostAwareRouting) {
      const ts = cfg['thresholds'] as unknown[] | undefined
      return ts?.length ? `${ts.length} threshold${ts.length !== 1 ? 's' : ''}` : undefined
    }
    if (type === FT.FeatureResponsePrefetch) {
      const parts: string[] = []
      const ps = cfg['follow_up_prompts'] as string[] | undefined
      const ttl = cfg['ttl_seconds'] as number | undefined
      if (ps?.length) parts.push(`${ps.length} prompt${ps.length !== 1 ? 's' : ''}`)
      if (ttl) parts.push(`TTL ${ttl}s`)
      return parts.join(' · ') || undefined
    }
    if (type === FT.FeatureResponseFingerprinting) {
      const parts: string[] = []
      const win = cfg['window_size'] as number | undefined
      const alert = cfg['alert_threshold'] as number | undefined
      if (win) parts.push(`win ${win}`)
      if (alert) parts.push(`alert ×${alert}`)
      return parts.join(' · ') || undefined
    }
    return undefined
  }
}
</script>
