<template lang="pug">
div(class="bg-white rounded-xl border shadow-xs min-w-[210px] overflow-hidden" :class="data.interceptor.isEnabled ? 'border-gray-200' : 'border-gray-100'")
  handle(type="target" :position="Position.Left")
  div(class="flex items-start gap-2.5 px-3 py-2.5")
    //- Icon badge
    div(
      class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors"
      :class="data.interceptor.isEnabled ? interceptorMeta.cls : 'bg-gray-100 text-gray-300'"
    )
      ui-icon(:icon="interceptorMeta.icon" :size="13")

    //- Content
    div(class="min-w-0 flex-1 flex flex-col gap-0.5")
      span(class="text-xs font-semibold truncate" :class="data.interceptor.isEnabled ? 'text-gray-800' : 'text-gray-400'") {{ interceptorLabel }}

      //- Semantic classifier: embedding model
      span(v-if="embeddingModelName" class="text-xs text-gray-400 truncate") via {{ embeddingModelName }}

      //- A/B test: variant list
      div(v-else-if="abVariants.length" class="flex flex-col gap-px")
        div(v-for="(v, i) in abVariants" :key="v.name" class="flex items-center gap-1 min-w-0")
          span(class="text-xs font-bold text-indigo-400 shrink-0") {{ variantLetter(i) }}
          span(class="text-xs text-gray-600 font-medium truncate") {{ v.name }}
          div(class="flex-1 flex justify-end")
            span(class="text-xs text-gray-300 tabular-nums") {{ abVariantPercent(i) }}%

      //- Content filter: pattern count + badges
      div(v-else-if="contentFilterPatterns.length" class="flex flex-wrap gap-0.5 items-center")
        span(class="text-xs text-gray-400") {{ contentFilterPatterns.length }} pattern{{ contentFilterPatterns.length !== 1 ? 's' : '' }}
        ui-badge(v-for="p in contentFilterPatterns.slice(0, 2)" :key="p" :variant="Variant.Red" :size="Size.XS") {{ p }}
        ui-badge(v-if="contentFilterPatterns.length > 2" :variant="Variant.Gray" :size="Size.XS") +{{ contentFilterPatterns.length - 2 }}

      //- PII detector
      div(v-else-if="piiMode" class="flex items-center gap-1")
        ui-badge(:dot="true" :variant="piiRedact ? Variant.Blue : Variant.Orange") {{ piiMode }}

      //- Prompt guard
      div(v-else-if="promptGuardSensitivity" class="flex items-center gap-1")
        ui-badge(:dot="true" :variant="sensitivityVariant") {{ promptGuardSensitivity }} sensitivity

      //- Prompt shield
      span(v-else-if="shieldModelName" class="text-xs text-gray-400 truncate") via {{ shieldModelName }}

      //- Team budget
      span(v-else-if="teamBudgetSummary" class="text-xs text-gray-400 truncate") {{ teamBudgetSummary }}

    //- Execution order
    ui-badge(:variant="data.interceptor.isEnabled ? Variant.Indigo : Variant.Gray" :size="Size.SM") {{ data.interceptor.executionOrder + 1 }}

  handle#int-out(type="source" :position="Position.Right")
</template>

<script lang="ts">
import {
  HyperstrateServerInternalModulesRouterApplicationRouterInterceptorResponse,
  HyperstrateServerInternalModulesRouterDomainRouterInterceptorType,
} from '@/__generated__/hyperstrate-api'
import { Variant, Size } from '@/features/ui/clickables/model'
import { Handle, Position } from '@vue-flow/core'
import { Component, Vue } from 'vue-facing-decorator'
import { RequiredProp } from '@/util/prop-decorators'
import { formatCurrency } from '@/util/format'

const IT = HyperstrateServerInternalModulesRouterDomainRouterInterceptorType

type InterceptorMeta = { icon: string; cls: string }

const INTERCEPTOR_META: Partial<Record<string, InterceptorMeta>> = {
  [IT.InterceptorSemanticClassifier]: { icon: 'search', cls: 'bg-blue-100 text-blue-600' },
  [IT.InterceptorABTest]: { icon: 'flask', cls: 'bg-violet-100 text-violet-600' },
  [IT.InterceptorContentFilter]: { icon: 'filter-3d', cls: 'bg-red-100 text-red-600' },
  [IT.InterceptorPIIDetector]: { icon: 'lock', cls: 'bg-orange-100 text-orange-600' },
  [IT.InterceptorPromptGuard]: { icon: 'shield', cls: 'bg-red-100 text-red-600' },
  [IT.InterceptorPromptShield]: { icon: 'shield', cls: 'bg-indigo-100 text-indigo-600' },
  [IT.InterceptorTeamBudget]: { icon: 'dollar-bill', cls: 'bg-green-100 text-green-600' },
}

@Component({ components: { Handle } })
export default class InterceptorNode extends Vue {
  public readonly Position = Position
  public readonly Variant = Variant
  public readonly Size = Size

  @RequiredProp()
  public readonly data!: {
    interceptor: HyperstrateServerInternalModulesRouterApplicationRouterInterceptorResponse
    modelDisplayNameMap: Record<string, string>
  }

  public get interceptorMeta(): InterceptorMeta {
    return INTERCEPTOR_META[this.data.interceptor.type ?? ''] ?? { icon: 'shield', cls: 'bg-indigo-100 text-indigo-600' }
  }

  public get interceptorLabel(): string {
    const map: Record<string, string> = {
      [IT.InterceptorSemanticClassifier]: 'Semantic Classifier',
      [IT.InterceptorContentFilter]: 'Content Filter',
      [IT.InterceptorPIIDetector]: 'PII Detector',
      [IT.InterceptorPromptGuard]: 'Prompt Guard',
      [IT.InterceptorABTest]: 'A/B Test',
      [IT.InterceptorPromptShield]: 'Prompt Shield',
      [IT.InterceptorTeamBudget]: 'Team Budget',
    }
    return this.data.interceptor.type ? (map[this.data.interceptor.type] ?? this.data.interceptor.type) : '—'
  }

  private get cfg(): Record<string, unknown> {
    return (this.data.interceptor.config as Record<string, unknown> | undefined) ?? {}
  }

  private modelName(id: unknown): string | undefined {
    if (!id) return undefined
    return this.data.modelDisplayNameMap?.[id as string] ?? (id as string)
  }

  public get embeddingModelName(): string | undefined {
    if (this.data.interceptor.type !== IT.InterceptorSemanticClassifier) return undefined
    return this.modelName(this.cfg['model_id'])
  }

  public get abVariants(): Array<{ name: string; model_id: string; weight: number }> {
    if (this.data.interceptor.type !== IT.InterceptorABTest) return []
    const raw = this.cfg['variants']
    if (!Array.isArray(raw)) return []
    return raw as Array<{ name: string; model_id: string; weight: number }>
  }

  public variantLetter(i: number): string {
    return String.fromCharCode(65 + i)
  }

  public abVariantPercent(idx: number): number {
    const total = this.abVariants.reduce((s, v) => s + (v.weight || 0), 0)
    if (!total) return 0
    return Math.round((this.abVariants[idx].weight / total) * 100)
  }

  public get contentFilterPatterns(): string[] {
    if (this.data.interceptor.type !== IT.InterceptorContentFilter) return []
    const raw = this.cfg['blocked_patterns']
    return Array.isArray(raw) ? (raw as string[]) : []
  }

  public get piiRedact(): boolean {
    return !!(this.cfg['redact'] as boolean | undefined)
  }

  public get piiMode(): string | undefined {
    if (this.data.interceptor.type !== IT.InterceptorPIIDetector) return undefined
    return this.piiRedact ? 'Redact' : 'Block'
  }

  public get promptGuardSensitivity(): string | undefined {
    if (this.data.interceptor.type !== IT.InterceptorPromptGuard) return undefined
    return (this.cfg['sensitivity'] as string | undefined) || 'medium'
  }

  public get sensitivityVariant(): Variant {
    const s = this.promptGuardSensitivity
    if (s === 'low') return Variant.Green
    if (s === 'high') return Variant.Red
    return Variant.Orange
  }

  public get shieldModelName(): string | undefined {
    if (this.data.interceptor.type !== IT.InterceptorPromptShield) return undefined
    return this.modelName(this.cfg['shield_model_id'])
  }

  public get teamBudgetSummary(): string | undefined {
    if (this.data.interceptor.type !== IT.InterceptorTeamBudget) return undefined
    const budgets = this.cfg['budgets'] as Record<string, { max_cost_usd?: number; max_requests?: number }> | undefined
    if (!budgets) return undefined
    const count = Object.keys(budgets).length
    if (!count) return undefined
    const totalCost = Object.values(budgets).reduce((s, b) => s + (b.max_cost_usd ?? 0), 0)
    const parts: string[] = [`${count} team${count !== 1 ? 's' : ''}`]
    if (totalCost > 0) parts.push(formatCurrency(totalCost))
    return parts.join(' · ')
  }
}
</script>
