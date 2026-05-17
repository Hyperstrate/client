import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const apiPath = path.join(process.cwd(), 'src', '__generated__', 'hyperstrate-api', 'api.ts')
let source = fs.readFileSync(apiPath, 'utf8')

// OpenAPI Generator names OAS3 request-body properties after their schema refs
// when useSingleRequestParameter=true. The existing app convention is
// request.body, so normalize only generated request-body-looking parameters.
source = source.replace(/readonly (hyperstrateServer[A-Za-z0-9_]+|internalModules[A-Za-z0-9_]+):/g, 'readonly body:')
source = source.replace(/requestParameters\.(hyperstrateServer[A-Za-z0-9_]+|internalModules[A-Za-z0-9_]+)/g, 'requestParameters.body')

const app = 'HyperstrateServerInternalModulesRouterApplication'
const featureEnum = 'HyperstrateServerInternalModulesRouterDomainRouterFeatureType'
const features = [
  ['Budget', 'FeatureBudget'],
  ['ContextCompression', 'FeatureContextCompression'],
  ['ContextTrimming', 'FeatureContextTrimming'],
  ['CostAwareRouting', 'FeatureCostAwareRouting'],
  ['Fallback', 'FeatureFallback'],
  ['HealthCheck', 'FeatureHealthCheck'],
  ['Hedging', 'FeatureHedging'],
  ['McpTools', 'FeatureMCPTools'],
  ['PromptCaching', 'FeaturePromptCaching'],
  ['PromptOptimizer', 'FeaturePromptOptimizer'],
  ['PromptPolicyRollout', 'FeaturePromptPolicyRollout'],
  ['QualityGate', 'FeatureQualityGate'],
  ['RateLimit', 'FeatureRateLimit'],
  ['RequestCoalescing', 'FeatureRequestCoalescing'],
  ['ResponseCache', 'FeatureResponseCache'],
  ['ResponseFingerprinting', 'FeatureResponseFingerprinting'],
  ['ResponsePrefetch', 'FeatureResponsePrefetch'],
  ['Retry', 'FeatureRetry'],
  ['SemanticCache', 'FeatureSemanticCache'],
  ['SemanticMemory', 'FeatureSemanticMemory'],
  ['StructuredOutput', 'FeatureStructuredOutput'],
  ['TokenCostOptimization', 'FeatureTokenCostOptimization'],
  ['TokenOptimization', 'FeatureTokenOptimization'],
]

const addFeatureInput = features
  .map(([suffix, enumMember]) => `Omit<${app}Add${suffix}FeatureInput, 'featureType'> & { featureType: ${featureEnum}.${enumMember} }`)
  .join(' | ')
source = source.replace(
  /export type HyperstrateServerInternalModulesRouterApplicationAddFeatureInput = .*?;\n/,
  `export type ${app}AddFeatureInput = ${addFeatureInput};\n`,
)

const routerFeatureResponse = features
  .map(([suffix, enumMember]) => `Omit<${app}${suffix}FeatureResponse, 'featureType'> & { featureType: ${featureEnum}.${enumMember} }`)
  .join(' | ')
source = source.replace(
  /export type HyperstrateServerInternalModulesRouterApplicationRouterFeatureResponse = .*?;\n/,
  `export type ${app}RouterFeatureResponse = ${routerFeatureResponse};\n`,
)

fs.writeFileSync(apiPath, source)
