<template lang="pug">
ui-modal(ref="modalRef")
  template(#trigger="props")
    slot(name="trigger" v-bind="props")

  template(#default)
    div(class="w-full")
      div(class="px-6 pt-6 pb-4 border-b border-gray-100")
        div(class="flex items-center gap-3")
          div(class="flex flex-col gap-0.5 flex-1")
            h2(class="text-base font-semibold text-gray-900") Edit Feature
            p(class="text-sm text-gray-500") Update the configuration for this pipeline feature
          ui-badge(:variant="Variant.Indigo") {{ featureLabel }}

      ui-form(
        v-slot="{ validated, submit, busy, formData }"
        :validation="AddFeatureFormData"
        :action="doSubmit"
        no-reset
        auto-dirty
        :initial-data="initialFormData"
      )
        div(class="px-6 py-5 flex flex-col gap-5 overflow-y-auto max-h-[60vh]")
          template(v-if="!hasConfig")
            div(class="rounded-lg bg-gray-50 border border-gray-100 px-4 py-4 flex flex-col gap-1.5")
              p(class="text-sm font-medium text-gray-700") No configuration required
              p(class="text-xs text-gray-500 leading-relaxed") {{ noConfigText }}

          template(v-if="isTokenFeature")
            feature-token-optimization

          template(v-if="featureType === FT.FeatureResponseCache")
            feature-response-cache

          template(v-if="featureType === FT.FeaturePromptPolicyRollout")
            feature-prompt-policy-rollout

          template(v-if="featureType === FT.FeatureSemanticCache")
            feature-semantic-cache

          template(v-if="featureType === FT.FeatureRetry")
            feature-retry

          template(v-if="featureType === FT.FeatureRateLimit")
            feature-rate-limit

          template(v-if="featureType === FT.FeatureBudget")
            feature-budget(:period-options="budgetPeriodOptions")

          template(v-if="featureType === FT.FeatureMCPTools")
            feature-mcp-tools

          template(v-if="featureType === FT.FeatureStructuredOutput")
            feature-structured-output

          template(v-if="featureType === FT.FeatureRequestCoalescing")
            feature-request-coalescing

          template(v-if="featureType === FT.FeatureHedging")
            feature-hedging(:target-options="targetOptions" :quality-options="hedgeQualityOptions")

          template(v-if="featureType === FT.FeatureQualityGate")
            feature-quality-gate(:action-options="qualityActionOptions")

          template(v-if="featureType === FT.FeatureContextCompression")
            feature-context-compression

          template(v-if="featureType === FT.FeatureSemanticMemory")
            feature-semantic-memory

          template(v-if="featureType === FT.FeatureCostAwareRouting")
            feature-cost-aware-routing(:initial-count="costThresholdCount")

          template(v-if="featureType === FT.FeatureResponsePrefetch")
            feature-response-prefetch

          template(v-if="featureType === FT.FeatureResponseFingerprinting")
            feature-response-fingerprinting

        div(class="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100")
          ui-button(type="button" :variant="Variant.Gray" @click="close") Cancel
          ui-button(type="button" :disabled="!validated || !isFormReadyFor(formData) || busy" :busy="busy" @click="submit") Save changes
</template>

<script lang="ts">
import {
  HyperstrateApi,
  HyperstrateServerInternalModulesRouterApplicationRouterFeatureResponse,
  HyperstrateServerInternalModulesRouterDomainRouterFeatureType,
  InternalModulesRouterInterfacesHttpRouterTargetResponse,
} from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Variant } from '@/features/ui/clickables/model'
import { type Option } from '@/features/ui/inputs/model'
import Modal from '@/features/ui/modal/Modal.global.vue'
import { parseJsonObject } from '@/util/json'
import { Mixins } from '@/util/mixin'
import { ArrayProp, RequiredProp } from '@/util/prop-decorators'
import { splitTrimmedLines } from '@/util/string'
import { Component, Ref } from 'vue-facing-decorator'
import { type FeatureConfigFor, type RouterFeatureDraft } from '../../feature-config'
import { BUDGET_PERIOD_OPTIONS, FEATURE_TYPE_OPTIONS } from '../../model'
import { AddFeatureFormData } from '../add-feature-modal/FeatureConfigureStep.vue'
import FeatureTokenOptimization from '../add-feature-modal/FeatureTokenOptimization.vue'
import FeatureResponseCache from '../add-feature-modal/FeatureResponseCache.vue'
import FeatureSemanticCache from '../add-feature-modal/FeatureSemanticCache.vue'
import FeatureRetry from '../add-feature-modal/FeatureRetry.vue'
import FeatureRateLimit from '../add-feature-modal/FeatureRateLimit.vue'
import FeatureBudget from '../add-feature-modal/FeatureBudget.vue'
import FeatureMcpTools from '../add-feature-modal/FeatureMCPTools.vue'
import FeatureStructuredOutput from '../add-feature-modal/FeatureStructuredOutput.vue'
import FeatureRequestCoalescing from '../add-feature-modal/FeatureRequestCoalescing.vue'
import FeatureHedging from '../add-feature-modal/FeatureHedging.vue'
import FeatureQualityGate from '../add-feature-modal/FeatureQualityGate.vue'
import FeatureContextCompression from '../add-feature-modal/FeatureContextCompression.vue'
import FeatureSemanticMemory from '../add-feature-modal/FeatureSemanticMemory.vue'
import FeatureCostAwareRouting from '../add-feature-modal/FeatureCostAwareRouting.vue'
import FeatureResponsePrefetch from '../add-feature-modal/FeatureResponsePrefetch.vue'
import FeatureResponseFingerprinting from '../add-feature-modal/FeatureResponseFingerprinting.vue'
import FeaturePromptPolicyRollout from '../add-feature-modal/FeaturePromptPolicyRollout.vue'

type RouterFeature = HyperstrateServerInternalModulesRouterApplicationRouterFeatureResponse
type RouterTarget = InternalModulesRouterInterfacesHttpRouterTargetResponse

const FT = HyperstrateServerInternalModulesRouterDomainRouterFeatureType

const NO_CONFIG_TYPES = new Set([
  FT.FeatureFallback,
  FT.FeatureHealthCheck,
  FT.FeaturePromptCaching,
  FT.FeatureTokenCostOptimization,
  FT.FeaturePromptOptimizer,
])
const NO_CONFIG_TEXT: Partial<Record<HyperstrateServerInternalModulesRouterDomainRouterFeatureType, string>> = {
  [FT.FeatureFallback]: 'When enabled, the router tries each target in priority order if the primary target fails.',
  [FT.FeatureHealthCheck]: 'Targets whose model is marked unhealthy by the background health monitor are automatically skipped during target selection.',
  [FT.FeaturePromptCaching]:
    'For Anthropic, wraps the system prompt in an ephemeral cache_control block. For OpenAI, disk caching activates automatically for contexts over 1 024 tokens.',
  [FT.FeatureTokenCostOptimization]: 'Uses default cost-saving rewrites: trim whitespace, minify JSON payloads, and collapse repeated blank lines.',
  [FT.FeaturePromptOptimizer]: 'Uses default prompt optimizer passes: compact whitespace and remove duplicate lines while preserving protected spans.',
}

const HEDGE_QUALITY_OPTIONS: Option<string>[] = [
  { value: 'any', label: 'Any response' },
  { value: 'min_length', label: 'Minimum length' },
  { value: 'valid_json', label: 'Valid JSON' },
  { value: 'no_refusal', label: 'No refusal' },
]

const QUALITY_ACTION_OPTIONS: Option<string>[] = [
  { value: 'reject', label: 'Reject (return error)' },
  { value: 'retry', label: 'Retry with alternate target' },
]

type EditFeatureModalEmits = {
  (e: 'updated', value: RouterFeature): void
  (e: string): void
}

@Component({
  emits: ['updated'],
  components: {
    FeatureTokenOptimization,
    FeatureResponseCache,
    FeatureSemanticCache,
    FeatureRetry,
    FeatureRateLimit,
    FeatureBudget,
    FeatureMcpTools,
    FeatureStructuredOutput,
    FeatureRequestCoalescing,
    FeatureHedging,
    FeatureQualityGate,
    FeatureContextCompression,
    FeatureSemanticMemory,
    FeatureCostAwareRouting,
    FeatureResponsePrefetch,
    FeatureResponseFingerprinting,
    FeaturePromptPolicyRollout,
  },
})
export default class EditFeatureModal extends Mixins(ApiClientsMixin) {
  public readonly Variant = Variant
  public readonly FT = FT
  public readonly AddFeatureFormData = AddFeatureFormData
  public readonly budgetPeriodOptions = BUDGET_PERIOD_OPTIONS
  public readonly hedgeQualityOptions = HEDGE_QUALITY_OPTIONS
  public readonly qualityActionOptions = QUALITY_ACTION_OPTIONS

  declare public $emit: EditFeatureModalEmits

  @RequiredProp()
  public readonly feature!: RouterFeature

  @RequiredProp()
  public readonly routerId!: string

  @ArrayProp(() => [])
  public readonly targets!: RouterTarget[]

  @Ref()
  public readonly modalRef!: Modal

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  public get featureType(): HyperstrateServerInternalModulesRouterDomainRouterFeatureType {
    return this.feature.featureType
  }

  public get featureLabel(): string {
    return FEATURE_TYPE_OPTIONS.find((o) => o.value === this.featureType)?.label ?? this.featureType ?? '—'
  }

  public get hasConfig(): boolean {
    return !NO_CONFIG_TYPES.has(this.featureType)
  }

  public get noConfigText(): string {
    return NO_CONFIG_TEXT[this.featureType] ?? ''
  }

  public get isTokenFeature(): boolean {
    return this.featureType === FT.FeatureTokenOptimization || this.featureType === FT.FeatureContextTrimming
  }

  public get targetOptions(): Option<RouterTarget>[] {
    return this.targets.map((t) => ({
      value: t,
      label: t.model?.displayName ?? t.model?.alias ?? t.modelId ?? t.id,
    }))
  }

  private targetOpt(modelId: string | undefined): Option<RouterTarget> | undefined {
    if (!modelId) return undefined
    return this.targetOptions.find((option) => option.value.id === modelId || option.value.modelId === modelId)
  }

  public get costThresholdCount(): number {
    const raw = (this.feature.config as Record<string, unknown> | undefined)?.['thresholds']
    return Array.isArray(raw) ? raw.length : 0
  }

  private modelOpt(id: string | undefined): { value: { id: string }; label: string } | undefined {
    if (!id) return undefined
    return { value: { id }, label: id }
  }

  // eslint-disable-next-line complexity
  public get initialFormData(): Record<string, unknown> {
    const c = (this.feature.config as Record<string, unknown> | undefined) ?? {}
    const t = this.featureType
    const s = (v: unknown): string => {
      if (typeof v === 'string') return v
      if (typeof v === 'number' || typeof v === 'boolean') return String(v)
      return ''
    }

    if (t === FT.FeatureTokenOptimization || t === FT.FeatureContextTrimming) {
      return { maxChars: s(c['max_chars']) }
    }
    if (t === FT.FeatureTokenCostOptimization || t === FT.FeaturePromptOptimizer) {
      return {}
    }
    if (t === FT.FeaturePromptPolicyRollout) {
      return { rolloutVariantsJson: c['variants'] != null ? JSON.stringify(c['variants'], null, 2) : '' }
    }
    if (t === FT.FeatureResponseCache) {
      return { ttlSeconds: s(c['ttl_seconds']) }
    }
    if (t === FT.FeatureSemanticCache) {
      return {
        ttlSeconds: s(c['ttl_seconds']),
        similarityThreshold: s(c['similarity_threshold']),
        semanticModelId: this.modelOpt(c['model_id'] as string | undefined),
      }
    }
    if (t === FT.FeatureRetry) {
      return { maxRetries: s(c['max_retries']), initialDelayMs: s(c['initial_delay_ms']), backoffMultiplier: s(c['backoff_multiplier']) }
    }
    if (t === FT.FeatureRateLimit) {
      return { rps: s(c['rps']), burst: s(c['burst']) }
    }
    if (t === FT.FeatureBudget) {
      return {
        period: BUDGET_PERIOD_OPTIONS.find((o) => o.value === s(c['period'] ?? 'monthly')),
        maxRequests: s(c['max_requests']),
        maxCostUsd: s(c['max_cost_usd']),
        alertPercent: s(c['alert_percent']),
        budgetAgentJson: c['agent_budgets'] != null ? JSON.stringify(c['agent_budgets'], null, 2) : '',
        budgetRoleJson: c['role_budgets'] != null ? JSON.stringify(c['role_budgets'], null, 2) : '',
        budgetRepoJson: c['repo_budgets'] != null ? JSON.stringify(c['repo_budgets'], null, 2) : '',
        budgetBranchJson: c['branch_budgets'] != null ? JSON.stringify(c['branch_budgets'], null, 2) : '',
      }
    }
    if (t === FT.FeatureMCPTools) {
      const serverIds = (c['server_ids'] as string[] | undefined) ?? []
      const mcpEnabled: Record<string, boolean> = {}
      for (const id of serverIds) mcpEnabled[id] = true
      return {
        mcpEnabled,
        mcpMaxTurns: s(c['max_turns']),
        mcpRequireApproval: c['require_approval'] ?? false,
        mcpAllowedTools: ((c['allowed_tools'] as string[] | undefined) ?? []).join('\n'),
        mcpBlockedTools: ((c['blocked_tools'] as string[] | undefined) ?? []).join('\n'),
        mcpAllowedTeams: ((c['allowed_team_ids'] as string[] | undefined) ?? []).map((id) => ({ label: id, value: { id, name: id } })),
      }
    }
    if (t === FT.FeatureStructuredOutput) {
      return {
        schemaJson: c['schema'] != null ? JSON.stringify(c['schema'], null, 2) : '',
        schemaName: s(c['name']),
        schemaStrict: c['strict'] ?? false,
      }
    }
    if (t === FT.FeatureRequestCoalescing) {
      return { coalesceWindowMs: s(c['window_ms']), coalesceMaxWaiters: s(c['max_waiters']) }
    }
    if (t === FT.FeatureHedging) {
      const targets = (c['target_ids'] as string[] | undefined) ?? (c['targets'] as string[] | undefined) ?? []
      return {
        hedgeQualityCheck: HEDGE_QUALITY_OPTIONS.find((o) => o.value === s(c['quality_check'] ?? 'any')),
        hedgeTargets: targets.map((target) => this.targetOpt(target)).filter(Boolean),
        hedgeTimeoutMs: s(c['timeout_ms']),
        hedgeMinLength: s(c['min_length']),
      }
    }
    if (t === FT.FeatureQualityGate) {
      return {
        qualityJudgeModelId: this.modelOpt(c['judge_model_id'] as string | undefined),
        qualityMinScore: s(c['min_score']),
        qualityAction: QUALITY_ACTION_OPTIONS.find((o) => o.value === s(c['action'] ?? 'reject')),
        qualityRubric: s(c['rubric_prompt']),
      }
    }
    if (t === FT.FeatureContextCompression) {
      return { compressionMaxChars: s(c['max_chars']), compressionKeepRecent: s(c['keep_recent']) }
    }
    if (t === FT.FeatureSemanticMemory) {
      return {
        memoryModelId: this.modelOpt(c['model_id'] as string | undefined),
        memoryMaxExamples: s(c['max_examples']),
        memoryTtlDays: s(c['ttl_days']),
        memorySimilarityThreshold: s(c['similarity_threshold']),
      }
    }
    if (t === FT.FeatureCostAwareRouting) {
      const thresholds = (c['thresholds'] as Array<{ max_chars: number; target_id: string }> | undefined) ?? []
      return {
        costThresholds: thresholds.map((th) => ({ maxChars: String(th['max_chars']), targetId: this.modelOpt(th['target_id'] as string | undefined) })),
        costDefaultTargetId: this.modelOpt(c['default_target_id'] as string | undefined),
      }
    }
    if (t === FT.FeatureResponsePrefetch) {
      return {
        prefetchFollowUps: ((c['follow_up_prompts'] as string[] | undefined) ?? []).join('\n'),
        prefetchTtlSeconds: s(c['ttl_seconds']),
      }
    }
    if (t === FT.FeatureResponseFingerprinting) {
      return { fingerprintWindowSize: s(c['window_size']), fingerprintAlertThreshold: s(c['alert_threshold']) }
    }
    return {}
  }

  public isFormReadyFor(formData: Record<string, unknown>): boolean {
    if (this.featureType === FT.FeatureSemanticCache) return !!formData.semanticModelId
    if (this.featureType === FT.FeatureMCPTools) {
      return Object.values((formData.mcpEnabled as Record<string, boolean> | undefined) ?? {}).some(Boolean)
    }
    if (this.featureType === FT.FeatureStructuredOutput) return !!(formData.schemaJson as string | null | undefined)?.trim()
    if (this.featureType === FT.FeatureQualityGate) return !!formData.qualityJudgeModelId
    if (this.featureType === FT.FeatureSemanticMemory) return !!formData.memoryModelId
    if (this.featureType === FT.FeatureResponsePrefetch) return !!(formData.prefetchFollowUps as string | null | undefined)?.trim()
    if (this.featureType === FT.FeaturePromptPolicyRollout) return !!(formData.rolloutVariantsJson as string | null | undefined)?.trim()
    return true
  }

  public async doSubmit(formData: AddFeatureFormData): Promise<void> {
    const { data: updated } = await this.api.routerIdFeaturesFeatureIdPatch({
      id: this.routerId,
      featureId: this.feature.id,
      body: { config: this.buildConfig(formData) },
    })
    this.$emit('updated', updated)
    this.close()
  }

  private mid(v: unknown): string {
    return (v as { id?: string } | null | undefined)?.id ?? ''
  }

  private n(v: unknown, fallback: number): number {
    const x = Number(v)
    return Number.isFinite(x) && x !== 0 ? x : fallback
  }

  private n0(v: unknown): number {
    const x = Number(v)
    return Number.isFinite(x) ? x : 0
  }

  // eslint-disable-next-line complexity
  private buildConfig(formData: AddFeatureFormData): RouterFeatureDraft['config'] {
    const t = this.featureType
    if (t === FT.FeatureTokenOptimization || t === FT.FeatureContextTrimming) return { max_chars: this.n(formData.maxChars, 4000) }
    if (t === FT.FeatureTokenCostOptimization) return {}
    if (t === FT.FeaturePromptOptimizer) return { optimizers: ['compact_whitespace', 'dedupe_lines'] }
    if (t === FT.FeaturePromptPolicyRollout) return { variants: JSON.parse((formData.rolloutVariantsJson as string).trim()) }
    if (t === FT.FeatureResponseCache) return { ttl_seconds: this.n(formData.ttlSeconds, 300) }
    if (t === FT.FeatureSemanticCache)
      return {
        ttl_seconds: this.n(formData.ttlSeconds, 300),
        similarity_threshold: this.n(formData.similarityThreshold, 0.92),
        model_id: this.mid(formData.semanticModelId),
      }
    if (t === FT.FeatureRetry)
      return {
        max_retries: this.n(formData.maxRetries, 3),
        initial_delay_ms: this.n(formData.initialDelayMs, 100),
        backoff_multiplier: this.n(formData.backoffMultiplier, 2.0),
      }
    if (t === FT.FeatureRateLimit) return { rps: this.n(formData.rps, 10), burst: this.n(formData.burst, 10) }
    if (t === FT.FeatureBudget) {
      const cfg: FeatureConfigFor<typeof FT.FeatureBudget> = {
        period: formData.period ?? 'monthly',
        max_requests: this.n0(formData.maxRequests),
        max_cost_usd: this.n0(formData.maxCostUsd),
        alert_percent: this.n(formData.alertPercent, 80),
      }
      const agentBudgets = parseJsonObject(formData.budgetAgentJson)
      const roleBudgets = parseJsonObject(formData.budgetRoleJson)
      const repoBudgets = parseJsonObject(formData.budgetRepoJson)
      const branchBudgets = parseJsonObject(formData.budgetBranchJson)
      if (agentBudgets) cfg.agent_budgets = agentBudgets as FeatureConfigFor<typeof FT.FeatureBudget>['agent_budgets']
      if (roleBudgets) cfg.role_budgets = roleBudgets as FeatureConfigFor<typeof FT.FeatureBudget>['role_budgets']
      if (repoBudgets) cfg.repo_budgets = repoBudgets as FeatureConfigFor<typeof FT.FeatureBudget>['repo_budgets']
      if (branchBudgets) cfg.branch_budgets = branchBudgets as FeatureConfigFor<typeof FT.FeatureBudget>['branch_budgets']
      return cfg
    }
    if (t === FT.FeatureMCPTools) {
      const enabled = formData.mcpEnabled as Record<string, boolean> | undefined
      const cfg: FeatureConfigFor<typeof FT.FeatureMCPTools> = {
        server_ids: Object.keys(enabled ?? {}).filter((id) => enabled![id]),
        max_turns: this.n(formData.mcpMaxTurns, 10),
      }
      const allowedTools = splitTrimmedLines(formData.mcpAllowedTools)
      const blockedTools = splitTrimmedLines(formData.mcpBlockedTools)
      const allowedTeamIds = (formData.mcpAllowedTeams ?? []).map((team) => team.value.id).filter(Boolean)
      if (formData.mcpRequireApproval) cfg.require_approval = true
      if (allowedTools.length) cfg.allowed_tools = allowedTools
      if (blockedTools.length) cfg.blocked_tools = blockedTools
      if (allowedTeamIds.length) cfg.allowed_team_ids = allowedTeamIds
      return cfg
    }
    if (t === FT.FeatureStructuredOutput)
      return {
        schema: JSON.parse((formData.schemaJson as string).trim()) as FeatureConfigFor<typeof FT.FeatureStructuredOutput>['schema'],
        name: (formData.schemaName as string | null | undefined)?.trim() || 'response',
        strict: formData.schemaStrict ?? false,
      }
    if (t === FT.FeatureRequestCoalescing) return { window_ms: this.n(formData.coalesceWindowMs, 200), max_waiters: this.n0(formData.coalesceMaxWaiters) }
    if (t === FT.FeatureHedging) {
      const cfg: FeatureConfigFor<typeof FT.FeatureHedging> = {
        quality_check: formData.hedgeQualityCheck ?? 'any',
        timeout_ms: this.n(formData.hedgeTimeoutMs, 5000),
      }
      const targets = (formData.hedgeTargets as RouterTarget[] | undefined)?.map((target) => target.id).filter(Boolean)
      if (targets?.length) cfg.target_ids = targets
      const minLen = this.n0(formData.hedgeMinLength)
      if (minLen > 0) cfg.min_length = minLen
      return cfg
    }
    if (t === FT.FeatureQualityGate) {
      const cfg: FeatureConfigFor<typeof FT.FeatureQualityGate> = {
        judge_model_id: this.mid(formData.qualityJudgeModelId),
        min_score: this.n(formData.qualityMinScore, 7),
        action: formData.qualityAction ?? 'reject',
      }
      const rubric = (formData.qualityRubric as string | null | undefined)?.trim()
      if (rubric) cfg.rubric_prompt = rubric
      return cfg
    }
    if (t === FT.FeatureContextCompression)
      return { max_chars: this.n(formData.compressionMaxChars, 8000), keep_recent: this.n(formData.compressionKeepRecent, 2) }
    if (t === FT.FeatureSemanticMemory)
      return {
        model_id: this.mid(formData.memoryModelId),
        max_examples: this.n(formData.memoryMaxExamples, 500),
        ttl_days: this.n(formData.memoryTtlDays, 7),
        similarity_threshold: this.n(formData.memorySimilarityThreshold, 0.85),
      }
    if (t === FT.FeatureCostAwareRouting) {
      const thresholds = (formData.costThresholds ?? [])
        .filter((ct) => ct.maxChars && ct.targetId)
        .map((ct) => ({ max_chars: Number(ct.maxChars), target_id: this.mid(ct.targetId) }))
      const cfg: FeatureConfigFor<typeof FT.FeatureCostAwareRouting> = { thresholds }
      const defaultId = this.mid(formData.costDefaultTargetId)
      if (defaultId) cfg.default_target_id = defaultId
      return cfg
    }
    if (t === FT.FeatureResponsePrefetch)
      return {
        follow_up_prompts: splitTrimmedLines(formData.prefetchFollowUps),
        ttl_seconds: this.n(formData.prefetchTtlSeconds, 300),
      }
    if (t === FT.FeatureResponseFingerprinting)
      return { window_size: this.n(formData.fingerprintWindowSize, 100), alert_threshold: this.n(formData.fingerprintAlertThreshold, 3.0) }
    return {}
  }

  public close(): void {
    this.modalRef.close()
  }
}
</script>
