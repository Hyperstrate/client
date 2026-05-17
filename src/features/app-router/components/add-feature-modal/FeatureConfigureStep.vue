<template lang="pug">
ui-form(v-slot="{ validated, submit, busy, formData }" :validation="AddFeatureFormData" :action="doSubmit" no-reset)
  div(class="px-6 py-5 flex flex-col gap-5 overflow-y-auto max-h-[480px]")
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
      feature-cost-aware-routing

    template(v-if="featureType === FT.FeatureResponsePrefetch")
      feature-response-prefetch

    template(v-if="featureType === FT.FeatureResponseFingerprinting")
      feature-response-fingerprinting

  div(class="flex items-center justify-between gap-2 px-6 py-4 border-t border-gray-100")
    ui-button(type="button" :variant="Variant.Gray" @click="stepper.previous()")
      ui-icon(icon="arrow-left" :size="14")
      | Back
    ui-button(type="button" :disabled="!validated || !isFormReadyFor(formData) || busy" :busy="busy" @click="submit") Add Feature
</template>

<script lang="ts">
import {
  HyperstrateApi,
  HyperstrateServerInternalModulesRouterApplicationAddFeatureInput,
  HyperstrateServerInternalModulesRouterApplicationRouterFeatureResponse,
  HyperstrateServerInternalModulesRouterDomainRouterFeatureType,
  HyperstrateServerInternalModulesAuthApplicationTeamResponse,
  InternalModulesRouterInterfacesHttpRouterTargetResponse,
} from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Variant } from '@/features/ui/clickables/model'
import { type Option } from '@/features/ui/inputs/model'
import StepMixin from '@/features/ui/stepper/step.mixin'
import { Mixins } from '@/util/mixin'
import { parseJsonObject } from '@/util/json'
import { ArrayProp, RequiredProp, StringProp } from '@/util/prop-decorators'
import { splitTrimmedLines } from '@/util/string'
import { IsJSON, IsNotEmpty, IsNumberString, IsOptional, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { Component } from 'vue-facing-decorator'
import { type FeatureConfigFor, type RouterFeatureDraft } from '../../feature-config'
import { BUDGET_PERIOD_OPTIONS } from '../../model'
import FeatureTokenOptimization from './FeatureTokenOptimization.vue'
import FeatureResponseCache from './FeatureResponseCache.vue'
import FeatureSemanticCache from './FeatureSemanticCache.vue'
import FeatureRetry from './FeatureRetry.vue'
import FeatureRateLimit from './FeatureRateLimit.vue'
import FeatureBudget from './FeatureBudget.vue'
import FeatureMcpTools from './FeatureMCPTools.vue'
import FeatureStructuredOutput from './FeatureStructuredOutput.vue'
import FeatureRequestCoalescing from './FeatureRequestCoalescing.vue'
import FeatureHedging from './FeatureHedging.vue'
import FeatureQualityGate from './FeatureQualityGate.vue'
import FeatureContextCompression from './FeatureContextCompression.vue'
import FeatureSemanticMemory from './FeatureSemanticMemory.vue'
import FeatureCostAwareRouting from './FeatureCostAwareRouting.vue'
import FeatureResponsePrefetch from './FeatureResponsePrefetch.vue'
import FeatureResponseFingerprinting from './FeatureResponseFingerprinting.vue'
import FeaturePromptPolicyRollout from './FeaturePromptPolicyRollout.vue'

type RouterTarget = InternalModulesRouterInterfacesHttpRouterTargetResponse
type TeamResponse = HyperstrateServerInternalModulesAuthApplicationTeamResponse
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
    'For Anthropic, wraps the system prompt in an ephemeral cache_control block — tokens served from cache are free. For OpenAI, disk caching activates automatically for contexts over 1 024 tokens.',
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

class CostThresholdData {
  @IsNotEmpty()
  @IsNumberString()
  maxChars!: string

  @IsNotEmpty()
  targetId!: unknown
}

export class AddFeatureFormData {
  @IsOptional()
  @IsNumberString()
  maxChars?: string

  @IsOptional()
  @IsNumberString()
  ttlSeconds?: string

  @IsOptional()
  @IsNumberString()
  similarityThreshold?: string

  @IsOptional()
  @IsNumberString()
  maxRetries?: string

  @IsOptional()
  @IsNumberString()
  initialDelayMs?: string

  @IsOptional()
  @IsNumberString()
  backoffMultiplier?: string

  @IsOptional()
  @IsNumberString()
  rps?: string

  @IsOptional()
  @IsNumberString()
  burst?: string

  @IsOptional()
  period?: string

  @IsOptional()
  @IsNumberString()
  maxRequests?: string

  @IsOptional()
  @IsNumberString()
  maxCostUsd?: string

  @IsOptional()
  @IsNumberString()
  alertPercent?: string

  @IsOptional()
  budgetAgentJson?: string

  @IsOptional()
  budgetRoleJson?: string

  @IsOptional()
  budgetRepoJson?: string

  @IsOptional()
  budgetBranchJson?: string

  @IsOptional()
  @IsNumberString()
  mcpMaxTurns?: string

  @IsOptional()
  mcpEnabled?: Record<string, boolean>

  @IsOptional()
  mcpRequireApproval?: boolean

  @IsOptional()
  mcpAllowedTools?: string

  @IsOptional()
  mcpBlockedTools?: string

  @IsOptional()
  mcpAllowedTeams?: Option<TeamResponse>[]

  @IsOptional()
  @IsJSON()
  schemaJson?: string

  @IsOptional()
  schemaName?: string

  @IsOptional()
  schemaStrict?: boolean

  @IsOptional()
  @IsNumberString()
  coalesceWindowMs?: string

  @IsOptional()
  @IsNumberString()
  coalesceMaxWaiters?: string

  @IsOptional()
  hedgeQualityCheck?: string

  @IsOptional()
  hedgeTargets?: RouterTarget[]

  @IsOptional()
  @IsNumberString()
  hedgeMinLength?: string

  @IsOptional()
  @IsNumberString()
  hedgeTimeoutMs?: string

  @IsOptional()
  semanticModelId?: unknown

  @IsOptional()
  qualityJudgeModelId?: unknown

  @IsOptional()
  @IsNumberString()
  qualityMinScore?: string

  @IsOptional()
  qualityAction?: string

  @IsOptional()
  qualityRubric?: string

  @IsOptional()
  @IsNumberString()
  compressionMaxChars?: string

  @IsOptional()
  @IsNumberString()
  compressionKeepRecent?: string

  @IsOptional()
  memoryModelId?: unknown

  @IsOptional()
  @IsNumberString()
  memoryMaxExamples?: string

  @IsOptional()
  @IsNumberString()
  memoryTtlDays?: string

  @IsOptional()
  @IsNumberString()
  memorySimilarityThreshold?: string

  @IsOptional()
  prefetchFollowUps?: string

  @IsOptional()
  @IsNumberString()
  prefetchTtlSeconds?: string

  @IsOptional()
  @IsNumberString()
  fingerprintWindowSize?: string

  @IsOptional()
  @IsNumberString()
  fingerprintAlertThreshold?: string

  @IsOptional()
  costDefaultTargetId?: unknown

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CostThresholdData)
  costThresholds?: CostThresholdData[]

  @IsOptional()
  @IsJSON()
  rolloutVariantsJson?: string
}

type FeatureConfigureEmits = {
  (e: 'added', value: HyperstrateServerInternalModulesRouterApplicationRouterFeatureResponse): void
  (e: string): void
}

@Component({
  emits: ['added'],
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
export default class FeatureConfigureStep extends Mixins(ApiClientsMixin, StepMixin) {
  public Variant = Variant
  public FT = FT
  public readonly AddFeatureFormData = AddFeatureFormData
  public readonly budgetPeriodOptions = BUDGET_PERIOD_OPTIONS
  public readonly hedgeQualityOptions = HEDGE_QUALITY_OPTIONS
  public readonly qualityActionOptions = QUALITY_ACTION_OPTIONS

  @RequiredProp()
  public readonly featureType!: HyperstrateServerInternalModulesRouterDomainRouterFeatureType

  @StringProp(true)
  public readonly routerId!: string

  @ArrayProp(() => [])
  public readonly targets!: RouterTarget[]

  declare public $emit: FeatureConfigureEmits

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

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  private n(v: unknown, fallback: number): number {
    const x = Number(v)
    return Number.isFinite(x) && x !== 0 ? x : fallback
  }

  private n0(v: unknown): number {
    const x = Number(v)
    return Number.isFinite(x) ? x : 0
  }

  public async doSubmit(formData: AddFeatureFormData): Promise<void> {
    const body = {
      featureType: this.featureType,
      config: this.buildConfig(formData),
    } as HyperstrateServerInternalModulesRouterApplicationAddFeatureInput

    const { data: feature } = await this.api.routerIdFeaturesPost({
      id: this.routerId,
      body,
    })
    this.$emit('added', feature)
  }

  private mid(v: unknown): string {
    return (v as { id?: string } | null | undefined)?.id ?? ''
  }

  // eslint-disable-next-line complexity
  public buildConfig(formData: AddFeatureFormData): RouterFeatureDraft['config'] {
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
      const enabled = formData.mcpEnabled
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
      const targets = formData.hedgeTargets?.map((target) => target.id).filter(Boolean)
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
}
</script>
