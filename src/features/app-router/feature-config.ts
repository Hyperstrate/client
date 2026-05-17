import {
  type HyperstrateServerInternalModulesRouterApplicationFeatureBudgetConfig as FeatureBudgetConfig,
  type HyperstrateServerInternalModulesRouterApplicationFeatureContextCompressionConfig as FeatureContextCompressionConfig,
  type HyperstrateServerInternalModulesRouterApplicationFeatureContextTrimmingConfig as FeatureContextTrimmingConfig,
  type HyperstrateServerInternalModulesRouterApplicationFeatureCostAwareRoutingConfig as FeatureCostAwareRoutingConfig,
  type HyperstrateServerInternalModulesRouterApplicationFeatureHedgingConfig as FeatureHedgingConfig,
  type HyperstrateServerInternalModulesRouterApplicationFeatureMCPToolsConfig as FeatureMCPToolsConfig,
  type HyperstrateServerInternalModulesRouterApplicationFeaturePromptOptimizerConfig as FeaturePromptOptimizerConfig,
  type HyperstrateServerInternalModulesRouterApplicationFeaturePromptPolicyRolloutConfig as FeaturePromptPolicyRolloutConfig,
  type HyperstrateServerInternalModulesRouterApplicationFeatureQualityGateConfig as FeatureQualityGateConfig,
  type HyperstrateServerInternalModulesRouterApplicationFeatureRateLimitConfig as FeatureRateLimitConfig,
  type HyperstrateServerInternalModulesRouterApplicationFeatureRequestCoalescingConfig as FeatureRequestCoalescingConfig,
  type HyperstrateServerInternalModulesRouterApplicationFeatureResponseCacheConfig as FeatureResponseCacheConfig,
  type HyperstrateServerInternalModulesRouterApplicationFeatureResponseFingerprintingConfig as FeatureResponseFingerprintingConfig,
  type HyperstrateServerInternalModulesRouterApplicationFeatureResponsePrefetchConfig as FeatureResponsePrefetchConfig,
  type HyperstrateServerInternalModulesRouterApplicationFeatureRetryConfig as FeatureRetryConfig,
  type HyperstrateServerInternalModulesRouterApplicationFeatureSemanticCacheConfig as FeatureSemanticCacheConfig,
  type HyperstrateServerInternalModulesRouterApplicationFeatureSemanticMemoryConfig as FeatureSemanticMemoryConfig,
  type HyperstrateServerInternalModulesRouterApplicationFeatureStructuredOutputConfig as FeatureStructuredOutputConfig,
  type HyperstrateServerInternalModulesRouterApplicationFeatureTokenCostOptimizationConfig as FeatureTokenCostOptimizationConfig,
  type HyperstrateServerInternalModulesRouterApplicationFeatureTokenOptimizationConfig as FeatureTokenOptimizationConfig,
  type HyperstrateServerInternalModulesRouterApplicationRouterFeatureResponse as RouterFeatureResponse,
  type HyperstrateServerInternalModulesRouterDomainRouterFeatureType as FeatureType,
} from '@/__generated__/hyperstrate-api'

type EmptyFeatureConfig = Record<string, never>

export type FeatureConfigByType = {
  [FeatureType.FeatureTokenOptimization]: FeatureTokenOptimizationConfig
  [FeatureType.FeatureContextTrimming]: FeatureContextTrimmingConfig
  [FeatureType.FeatureTokenCostOptimization]: FeatureTokenCostOptimizationConfig
  [FeatureType.FeaturePromptOptimizer]: FeaturePromptOptimizerConfig
  [FeatureType.FeaturePromptPolicyRollout]: FeaturePromptPolicyRolloutConfig
  [FeatureType.FeatureResponseCache]: FeatureResponseCacheConfig
  [FeatureType.FeatureSemanticCache]: FeatureSemanticCacheConfig
  [FeatureType.FeatureRetry]: FeatureRetryConfig
  [FeatureType.FeatureRateLimit]: FeatureRateLimitConfig
  [FeatureType.FeatureBudget]: FeatureBudgetConfig
  [FeatureType.FeatureFallback]: EmptyFeatureConfig
  [FeatureType.FeatureMCPTools]: FeatureMCPToolsConfig
  [FeatureType.FeatureHealthCheck]: EmptyFeatureConfig
  [FeatureType.FeatureStructuredOutput]: FeatureStructuredOutputConfig
  [FeatureType.FeatureRequestCoalescing]: FeatureRequestCoalescingConfig
  [FeatureType.FeaturePromptCaching]: EmptyFeatureConfig
  [FeatureType.FeatureHedging]: FeatureHedgingConfig
  [FeatureType.FeatureQualityGate]: FeatureQualityGateConfig
  [FeatureType.FeatureContextCompression]: FeatureContextCompressionConfig
  [FeatureType.FeatureSemanticMemory]: FeatureSemanticMemoryConfig
  [FeatureType.FeatureCostAwareRouting]: FeatureCostAwareRoutingConfig
  [FeatureType.FeatureResponsePrefetch]: FeatureResponsePrefetchConfig
  [FeatureType.FeatureResponseFingerprinting]: FeatureResponseFingerprintingConfig
}

export type FeatureConfigFor<T extends keyof FeatureConfigByType> = FeatureConfigByType[T]

export function routerFeatureConfig<T extends keyof FeatureConfigByType>(feature: { config?: unknown }): FeatureConfigFor<T> {
  return (feature.config ?? {}) as FeatureConfigFor<T>
}

export type RouterFeatureDraft = {
  [T in keyof FeatureConfigByType]: {
    featureType: T
    config: FeatureConfigByType[T]
  }
}[keyof FeatureConfigByType]

export type TypedRouterFeatureResponse = Omit<RouterFeatureResponse, 'featureType' | 'config'> & RouterFeatureDraft
