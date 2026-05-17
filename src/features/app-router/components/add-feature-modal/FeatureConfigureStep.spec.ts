/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata'
import { mount, shallowMount, type VueWrapper } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import {
  HyperstrateServerInternalModulesRouterDomainRouterFeatureType as FT,
  type InternalModulesRouterInterfacesHttpRouterTargetResponse as RouterTarget,
} from '@/__generated__/hyperstrate-api'
import FeatureConfigureStep from './FeatureConfigureStep.vue'
import EditFeatureModal from '../edit-feature-modal/EditFeatureModal.global.vue'

const targetA = { id: 'tgt_a', modelId: 'mdl_a' } as RouterTarget
const targetB = { id: 'tgt_b', modelId: 'mdl_b' } as RouterTarget
const stubs = {
  'ui-form': { template: '<div><slot :validated="true" :submit="() => undefined" :busy="false" :formData="{}" /></div>' },
  'ui-modal': { template: '<div><slot name="trigger" /><slot /></div>' },
  'ui-form-field': true,
  'ui-button': true,
  'ui-icon': true,
  'ui-badge': true,
  'feature-token-optimization': true,
  'feature-response-cache': true,
  'feature-semantic-cache': true,
  'feature-retry': true,
  'feature-rate-limit': true,
  'feature-budget': true,
  'feature-mcp-tools': true,
  'feature-structured-output': true,
  'feature-request-coalescing': true,
  'feature-hedging': true,
  'feature-quality-gate': true,
  'feature-context-compression': true,
  'feature-semantic-memory': true,
  'feature-cost-aware-routing': true,
  'feature-response-prefetch': true,
  'feature-response-fingerprinting': true,
  'feature-prompt-policy-rollout': true,
}
const global = { stubs, provide: { CONTAINER: () => ({}) } }

type FeatureCase = {
  name: string
  type: FT
  formData: Record<string, unknown>
  expected: Record<string, unknown>
}

const featureCases: FeatureCase[] = [
  { name: 'token optimization', type: FT.FeatureTokenOptimization, formData: { maxChars: '1200' }, expected: { max_chars: 1200 } },
  { name: 'context trimming', type: FT.FeatureContextTrimming, formData: { maxChars: '2200' }, expected: { max_chars: 2200 } },
  { name: 'token cost optimization', type: FT.FeatureTokenCostOptimization, formData: {}, expected: {} },
  { name: 'prompt optimizer', type: FT.FeaturePromptOptimizer, formData: {}, expected: { optimizers: ['compact_whitespace', 'dedupe_lines'] } },
  {
    name: 'prompt policy rollout',
    type: FT.FeaturePromptPolicyRollout,
    formData: { rolloutVariantsJson: JSON.stringify([{ name: 'canary', prompt_id: 'prm_1', percentage: 25 }]) },
    expected: { variants: [{ name: 'canary', prompt_id: 'prm_1', percentage: 25 }] },
  },
  { name: 'response cache', type: FT.FeatureResponseCache, formData: { ttlSeconds: '300' }, expected: { ttl_seconds: 300 } },
  {
    name: 'semantic cache',
    type: FT.FeatureSemanticCache,
    formData: { ttlSeconds: '300', similarityThreshold: '0.91', semanticModelId: { id: 'mdl_embed' } },
    expected: { ttl_seconds: 300, similarity_threshold: 0.91, model_id: 'mdl_embed' },
  },
  {
    name: 'retry',
    type: FT.FeatureRetry,
    formData: { maxRetries: '3', initialDelayMs: '100', backoffMultiplier: '2' },
    expected: { max_retries: 3, initial_delay_ms: 100, backoff_multiplier: 2 },
  },
  { name: 'rate limit', type: FT.FeatureRateLimit, formData: { rps: '10', burst: '20' }, expected: { rps: 10, burst: 20 } },
  {
    name: 'budget',
    type: FT.FeatureBudget,
    formData: {
      period: 'monthly',
      maxRequests: '100',
      maxCostUsd: '10.5',
      alertPercent: '80',
      budgetAgentJson: JSON.stringify({ codex: { max_requests: 10 } }),
    },
    expected: { period: 'monthly', max_requests: 100, max_cost_usd: 10.5, alert_percent: 80, agent_budgets: { codex: { max_requests: 10 } } },
  },
  { name: 'fallback', type: FT.FeatureFallback, formData: {}, expected: {} },
  {
    name: 'mcp tools',
    type: FT.FeatureMCPTools,
    formData: {
      mcpEnabled: { srv_1: true, srv_2: false },
      mcpMaxTurns: '4',
      mcpRequireApproval: true,
      mcpAllowedTools: 'search\nread',
      mcpBlockedTools: 'delete',
      mcpAllowedTeams: [{ value: { id: 'team_1' }, label: 'Team 1' }],
    },
    expected: {
      server_ids: ['srv_1'],
      max_turns: 4,
      require_approval: true,
      allowed_tools: ['search', 'read'],
      blocked_tools: ['delete'],
      allowed_team_ids: ['team_1'],
    },
  },
  { name: 'health check', type: FT.FeatureHealthCheck, formData: {}, expected: {} },
  {
    name: 'structured output',
    type: FT.FeatureStructuredOutput,
    formData: { schemaJson: JSON.stringify({ type: 'object' }), schemaName: 'answer', schemaStrict: true },
    expected: { schema: { type: 'object' }, name: 'answer', strict: true },
  },
  {
    name: 'request coalescing',
    type: FT.FeatureRequestCoalescing,
    formData: { coalesceWindowMs: '200', coalesceMaxWaiters: '5' },
    expected: { window_ms: 200, max_waiters: 5 },
  },
  { name: 'prompt caching', type: FT.FeaturePromptCaching, formData: {}, expected: {} },
  {
    name: 'hedging',
    type: FT.FeatureHedging,
    formData: { hedgeQualityCheck: 'min_length', hedgeTargets: [targetA], hedgeMinLength: '20', hedgeTimeoutMs: '5000' },
    expected: { quality_check: 'min_length', timeout_ms: 5000, target_ids: ['tgt_a'], min_length: 20 },
  },
  {
    name: 'quality gate',
    type: FT.FeatureQualityGate,
    formData: { qualityJudgeModelId: { id: 'mdl_judge' }, qualityMinScore: '7.5', qualityAction: 'reject', qualityRubric: 'score carefully' },
    expected: { judge_model_id: 'mdl_judge', min_score: 7.5, action: 'reject', rubric_prompt: 'score carefully' },
  },
  {
    name: 'context compression',
    type: FT.FeatureContextCompression,
    formData: { compressionMaxChars: '8000', compressionKeepRecent: '2' },
    expected: { max_chars: 8000, keep_recent: 2 },
  },
  {
    name: 'semantic memory',
    type: FT.FeatureSemanticMemory,
    formData: { memoryModelId: { id: 'mdl_embed' }, memoryMaxExamples: '5', memoryTtlDays: '30', memorySimilarityThreshold: '0.85' },
    expected: { model_id: 'mdl_embed', max_examples: 5, ttl_days: 30, similarity_threshold: 0.85 },
  },
  {
    name: 'cost aware routing',
    type: FT.FeatureCostAwareRouting,
    formData: { costThresholds: [{ maxChars: '1000', targetId: { id: 'tgt_a' } }], costDefaultTargetId: { id: 'tgt_b' } },
    expected: { thresholds: [{ max_chars: 1000, target_id: 'tgt_a' }], default_target_id: 'tgt_b' },
  },
  {
    name: 'response prefetch',
    type: FT.FeatureResponsePrefetch,
    formData: { prefetchFollowUps: 'next\nagain', prefetchTtlSeconds: '300' },
    expected: { follow_up_prompts: ['next', 'again'], ttl_seconds: 300 },
  },
  {
    name: 'response fingerprinting',
    type: FT.FeatureResponseFingerprinting,
    formData: { fingerprintWindowSize: '100', fingerprintAlertThreshold: '3' },
    expected: { window_size: 100, alert_threshold: 3 },
  },
]

function mountAddFeature(type: FT): VueWrapper<FeatureConfigureStep, FeatureConfigureStep> {
  const wrapper = mount(
    {
      name: 'Stepper',
      components: { FeatureConfigureStep },
      template: '<feature-configure-step ref="step" :feature-type="type" router-id="rtr_1" :targets="targets" />',
      data: () => ({ type, targets: [targetA, targetB] }),
      methods: { previous: () => undefined },
    },
    {
      global,
    },
  )
  return wrapper.findComponent(FeatureConfigureStep)
}

function mountEditFeature(type: FT): VueWrapper {
  return shallowMount(EditFeatureModal, {
    props: {
      routerId: 'rtr_1',
      targets: [targetA, targetB],
      feature: { id: 'rfeat_1', routerId: 'rtr_1', featureType: type, config: {}, executionOrder: 0, isEnabled: true },
    },
    global,
  })
}

describe('FeatureConfigureStep', () => {
  it.each(featureCases)('builds add config for $name', ({ type, formData, expected }) => {
    const wrapper = mountAddFeature(type)
    expect(wrapper.vm.buildConfig(formData)).toEqual(expected)
  })

  it('submits create payload with feature type and config body', async () => {
    const wrapper = mountAddFeature(FT.FeatureResponseCache)
    const api = { routerIdFeaturesPost: vi.fn().mockResolvedValue({ data: { id: 'rfeat_1' } }) }
    vi.spyOn(wrapper.vm as any, 'apiClientFactory').mockReturnValue(api)

    await wrapper.vm.doSubmit({ ttlSeconds: '123' })

    expect(api.routerIdFeaturesPost).toHaveBeenCalledWith({
      id: 'rtr_1',
      body: { featureType: FT.FeatureResponseCache, config: { ttl_seconds: 123 } },
    })
    expect(wrapper.emitted('added')?.[0]).toEqual([{ id: 'rfeat_1' }])
  })
})

describe('EditFeatureModal', () => {
  it.each(featureCases)('builds edit config for $name', ({ type, formData, expected }) => {
    const wrapper = mountEditFeature(type)
    expect((wrapper.vm as any).buildConfig(formData)).toEqual(expected)
  })

  it('submits edit payload with feature config body', async () => {
    const wrapper = mountEditFeature(FT.FeatureResponseCache)
    const api = { routerIdFeaturesFeatureIdPatch: vi.fn().mockResolvedValue({ data: { id: 'rfeat_1', config: { ttl_seconds: 123 } } }) }
    vi.spyOn(wrapper.vm as any, 'apiClientFactory').mockReturnValue(api)
    vi.spyOn(wrapper.vm as any, 'close').mockImplementation(() => undefined)

    await (wrapper.vm as any).doSubmit({ ttlSeconds: '123' })

    expect(api.routerIdFeaturesFeatureIdPatch).toHaveBeenCalledWith({
      id: 'rtr_1',
      featureId: 'rfeat_1',
      body: { config: { ttl_seconds: 123 } },
    })
    expect(wrapper.emitted('updated')?.[0]).toEqual([{ id: 'rfeat_1', config: { ttl_seconds: 123 } }])
  })
})
