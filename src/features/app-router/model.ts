import {
  HyperstrateServerInternalModulesRouterDomainRouterFeatureType,
  HyperstrateServerInternalModulesRouterDomainRouterInterceptorType,
  HyperstrateServerInternalModulesRouterDomainRoutingStrategy,
} from '@/__generated__/hyperstrate-api'
import { type Option } from '../ui/inputs/model'

export const ROUTING_STRATEGY_OPTIONS: Option<HyperstrateServerInternalModulesRouterDomainRoutingStrategy>[] = [
  { value: HyperstrateServerInternalModulesRouterDomainRoutingStrategy.RoutingStrategyRoundRobin, label: 'Round Robin' },
  { value: HyperstrateServerInternalModulesRouterDomainRoutingStrategy.RoutingStrategyWeighted, label: 'Weighted' },
  { value: HyperstrateServerInternalModulesRouterDomainRoutingStrategy.RoutingStrategyPercentage, label: 'Percentage' },
  { value: HyperstrateServerInternalModulesRouterDomainRoutingStrategy.RoutingStrategyFailover, label: 'Failover' },
  { value: HyperstrateServerInternalModulesRouterDomainRoutingStrategy.RoutingStrategyRandom, label: 'Random' },
  { value: HyperstrateServerInternalModulesRouterDomainRoutingStrategy.RoutingStrategyLatencyBased, label: 'Latency Based' },
]

export const STRATEGY_DESCRIPTIONS: Record<HyperstrateServerInternalModulesRouterDomainRoutingStrategy, string> = {
  [HyperstrateServerInternalModulesRouterDomainRoutingStrategy.RoutingStrategyRoundRobin]: 'Distributes requests evenly across all enabled targets in order.',
  [HyperstrateServerInternalModulesRouterDomainRoutingStrategy.RoutingStrategyWeighted]: "Routes traffic proportionally to each target's weight value.",
  [HyperstrateServerInternalModulesRouterDomainRoutingStrategy.RoutingStrategyPercentage]:
    'Routes an exact percentage of traffic to each target (must sum to 100).',
  [HyperstrateServerInternalModulesRouterDomainRoutingStrategy.RoutingStrategyFailover]:
    'Tries targets in ascending priority order, moving on after a failure.',
  [HyperstrateServerInternalModulesRouterDomainRoutingStrategy.RoutingStrategyRandom]: 'Picks a random enabled target for every request.',
  [HyperstrateServerInternalModulesRouterDomainRoutingStrategy.RoutingStrategyLatencyBased]: 'Routes to the target with the lowest recorded response latency.',
}

export type TypeOption<T> = Option<T> & { description: string; icon: string; iconClass: string }

const FT = HyperstrateServerInternalModulesRouterDomainRouterFeatureType
const IT = HyperstrateServerInternalModulesRouterDomainRouterInterceptorType

export const INTERCEPTOR_TYPE_OPTIONS: TypeOption<HyperstrateServerInternalModulesRouterDomainRouterInterceptorType>[] = [
  {
    value: IT.InterceptorSemanticClassifier,
    label: 'Semantic Classifier',
    description: 'Routes to the target whose utterances best match the prompt via embedding similarity',
    icon: 'search',
    iconClass: 'bg-blue-100 text-blue-600',
  },
  {
    value: IT.InterceptorABTest,
    label: 'A/B Test',
    description: 'Split traffic across model variants with optional sticky session assignment',
    icon: 'flask',
    iconClass: 'bg-violet-100 text-violet-600',
  },
  {
    value: IT.InterceptorContentFilter,
    label: 'Content Filter',
    description: 'Blocks requests that match configured forbidden topic patterns',
    icon: 'filter-3d',
    iconClass: 'bg-red-100 text-red-600',
  },
  {
    value: IT.InterceptorPIIDetector,
    label: 'PII Detector',
    description: 'Detects and optionally redacts personally identifiable information from the prompt',
    icon: 'lock',
    iconClass: 'bg-orange-100 text-orange-600',
  },
  {
    value: IT.InterceptorPromptGuard,
    label: 'Prompt Guard',
    description: 'Protects against prompt injection and jailbreak attempts',
    icon: 'shield',
    iconClass: 'bg-red-100 text-red-600',
  },
  {
    value: IT.InterceptorPromptShield,
    label: 'Prompt Shield',
    description: 'LLM-powered policy enforcement — checks requests against configurable safety policies',
    icon: 'shield',
    iconClass: 'bg-indigo-100 text-indigo-600',
  },
  {
    value: IT.InterceptorTeamBudget,
    label: 'Team Budget',
    description: 'Enforce per-team cost and request caps, with overflow routing to a cheaper model',
    icon: 'dollar-bill',
    iconClass: 'bg-green-100 text-green-600',
  },
]

export const FEATURE_TYPE_OPTIONS: TypeOption<HyperstrateServerInternalModulesRouterDomainRouterFeatureType>[] = [
  {
    value: FT.FeatureTokenOptimization,
    label: 'Token Optimization',
    description: 'Truncate prompt to fit token limits (from the start)',
    icon: 'cogs',
    iconClass: 'bg-zinc-100 text-zinc-500',
  },
  {
    value: FT.FeatureContextTrimming,
    label: 'Context Trimming',
    description: 'Keep the most recent context within token budget (from the end)',
    icon: 'cogs',
    iconClass: 'bg-zinc-100 text-zinc-500',
  },
  {
    value: FT.FeatureTokenCostOptimization,
    label: 'Token Cost Optimization',
    description: 'Reduce request and response token cost with deterministic payload rewrites',
    icon: 'dollar-bill',
    iconClass: 'bg-green-100 text-green-600',
  },
  {
    value: FT.FeaturePromptOptimizer,
    label: 'Prompt Optimizer',
    description: 'Compact prompt text with configurable optimizer passes while preserving protected spans',
    icon: 'sparkles',
    iconClass: 'bg-purple-100 text-purple-600',
  },
  {
    value: FT.FeaturePromptPolicyRollout,
    label: 'Prompt/Policy Rollout',
    description: 'Canary prompt and policy versions by traffic percentage with rollback-ready analytics',
    icon: 'git-branch',
    iconClass: 'bg-blue-100 text-blue-600',
  },
  {
    value: FT.FeatureResponseCache,
    label: 'Response Cache',
    description: 'Cache identical prompts to avoid redundant model calls',
    icon: 'database',
    iconClass: 'bg-teal-100 text-teal-600',
  },
  {
    value: FT.FeatureSemanticCache,
    label: 'Semantic Cache',
    description: 'Cache semantically similar prompts using embedding similarity',
    icon: 'search',
    iconClass: 'bg-teal-100 text-teal-600',
  },
  {
    value: FT.FeaturePromptCaching,
    label: 'Prompt Caching',
    description: 'Enable provider-side system prompt caching (Anthropic: ephemeral cache; OpenAI: disk cache)',
    icon: 'database',
    iconClass: 'bg-teal-100 text-teal-600',
  },
  {
    value: FT.FeatureRetry,
    label: 'Retry',
    description: 'Automatically retry failed model calls with exponential back-off',
    icon: 'refresh',
    iconClass: 'bg-amber-100 text-amber-600',
  },
  {
    value: FT.FeatureFallback,
    label: 'Fallback',
    description: 'Try each target in priority order if the primary target fails',
    icon: 'git-branch',
    iconClass: 'bg-amber-100 text-amber-600',
  },
  {
    value: FT.FeatureHealthCheck,
    label: 'Auto-Degradation',
    description: 'Automatically skip targets whose model is marked unhealthy by the health monitor',
    icon: 'gauge',
    iconClass: 'bg-green-100 text-green-600',
  },
  {
    value: FT.FeatureRequestCoalescing,
    label: 'Request Coalescing',
    description: 'Deduplicate burst traffic — one upstream call serves all concurrent identical requests',
    icon: 'refresh',
    iconClass: 'bg-sky-100 text-sky-600',
  },
  {
    value: FT.FeatureRateLimit,
    label: 'Rate Limit',
    description: 'Enforce per-router requests-per-second limits (token bucket)',
    icon: 'gauge',
    iconClass: 'bg-orange-100 text-orange-600',
  },
  {
    value: FT.FeatureBudget,
    label: 'Budget',
    description: 'Cap total requests and cost per time period',
    icon: 'dollar-bill',
    iconClass: 'bg-red-100 text-red-600',
  },
  {
    value: FT.FeatureCostAwareRouting,
    label: 'Cost-Aware Routing',
    description: 'Route short prompts to cheap models and long prompts to capable models based on character thresholds',
    icon: 'dollar-bill',
    iconClass: 'bg-green-100 text-green-600',
  },
  {
    value: FT.FeatureMCPTools,
    label: 'MCP Tools',
    description: 'Connect MCP servers — models can call external tools and data sources',
    icon: 'puzzle-piece',
    iconClass: 'bg-violet-100 text-violet-600',
  },
  {
    value: FT.FeatureStructuredOutput,
    label: 'Structured Output',
    description: 'Enforce a JSON schema on model responses and validate the output',
    icon: 'check',
    iconClass: 'bg-emerald-100 text-emerald-600',
  },
  {
    value: FT.FeatureHedging,
    label: 'Hedging',
    description: 'Race multiple models in parallel and return the first response that passes a quality check',
    icon: 'chats',
    iconClass: 'bg-pink-100 text-pink-600',
  },
  {
    value: FT.FeatureQualityGate,
    label: 'Quality Gate',
    description: 'Score each response with a judge LLM and reject or retry if it falls below a threshold',
    icon: 'check',
    iconClass: 'bg-emerald-100 text-emerald-600',
  },
  {
    value: FT.FeatureContextCompression,
    label: 'Context Compression',
    description: 'Intelligently truncate conversation history to fit within character limits',
    icon: 'cogs',
    iconClass: 'bg-zinc-100 text-zinc-500',
  },
  {
    value: FT.FeatureSemanticMemory,
    label: 'Semantic Memory',
    description: 'Inject relevant past Q&A pairs into the prompt using in-memory vector search',
    icon: 'sparkles',
    iconClass: 'bg-violet-100 text-violet-600',
  },
  {
    value: FT.FeatureResponsePrefetch,
    label: 'Response Prefetch',
    description: 'Speculatively prefetch responses for common follow-up prompts after each inference',
    icon: 'clock',
    iconClass: 'bg-sky-100 text-sky-600',
  },
  {
    value: FT.FeatureResponseFingerprinting,
    label: 'Response Fingerprinting',
    description: 'Detect anomalous response length patterns using a rolling statistical window',
    icon: 'bar-chart',
    iconClass: 'bg-orange-100 text-orange-600',
  },
]

export const BUDGET_PERIOD_OPTIONS: Option<string>[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'daily', label: 'Daily' },
]
