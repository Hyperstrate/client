import type {
  HyperstrateServerInternalModulesFunctionsApplicationAppResponse,
  HyperstrateServerInternalModulesFunctionsApplicationCreateAppInput,
  HyperstrateServerInternalModulesFunctionsApplicationCreateRunnerPoolInput,
  HyperstrateServerInternalModulesFunctionsApplicationDeployFunctionInput,
  HyperstrateServerInternalModulesFunctionsApplicationFunctionResponse,
  HyperstrateServerInternalModulesFunctionsApplicationInvocationResponse,
  HyperstrateServerInternalModulesFunctionsApplicationInvokeFunctionInput,
  HyperstrateServerInternalModulesFunctionsApplicationLogResponse,
  HyperstrateServerInternalModulesFunctionsApplicationRunnerPoolResponse,
  HyperstrateServerInternalModulesFunctionsApplicationRuntimeSpec,
  HyperstrateServerInternalModulesFunctionsApplicationImageSpec,
  HyperstrateServerInternalModulesFunctionsApplicationAutoscalingSpec,
  HyperstrateServerInternalModulesFunctionsApplicationSecuritySpec,
  HyperstrateServerInternalModulesFunctionsApplicationProviderPlacementSpec,
  HyperstrateServerInternalSharedPaginationPaginatedMeta,
} from '@/__generated__/hyperstrate-api'

export type ApiResult<T> = Promise<{ data: T }>
export type FunctionsApp = HyperstrateServerInternalModulesFunctionsApplicationAppResponse
export type FunctionItem = HyperstrateServerInternalModulesFunctionsApplicationFunctionResponse
export type FunctionInvocation = HyperstrateServerInternalModulesFunctionsApplicationInvocationResponse
export type FunctionLog = HyperstrateServerInternalModulesFunctionsApplicationLogResponse
export type RunnerPool = HyperstrateServerInternalModulesFunctionsApplicationRunnerPoolResponse

export interface PageParams {
  page?: number
  perPage?: number
}

export interface PaginatedResponse<T> {
  items?: T[]
  data?: T[]
  meta?: HyperstrateServerInternalSharedPaginationPaginatedMeta
}

export interface FunctionBuild {
  id?: string
  appId?: string
  functionId?: string
  revisionId?: string
  status?: string
  source?: Record<string, unknown>
  artifact?: Record<string, unknown>
  error?: string
  startedAt?: string
  finishedAt?: string
  createdAt?: string
  modifiedAt?: string
}

export interface FunctionRevision {
  id?: string
  appId?: string
  functionId?: string
  version?: number
  entrypoint?: string
  image?: HyperstrateServerInternalModulesFunctionsApplicationImageSpec
  runtime?: HyperstrateServerInternalModulesFunctionsApplicationRuntimeSpec
  autoscaling?: HyperstrateServerInternalModulesFunctionsApplicationAutoscalingSpec
  security?: HyperstrateServerInternalModulesFunctionsApplicationSecuritySpec
  provider?: HyperstrateServerInternalModulesFunctionsApplicationProviderPlacementSpec
  buildId?: string
  build?: FunctionBuild
  createdAt?: string
}

export interface FunctionDetail extends FunctionItem {
  activeRevision?: FunctionRevision
  latestBuild?: FunctionBuild
}

export interface RunnerAgent {
  id?: string
  poolId?: string
  hostname?: string
  status?: string
  capabilities?: Record<string, unknown>
  lastHeartbeatAt?: string
  sessionExpiresAt?: string
  createdAt?: string
  modifiedAt?: string
}

export interface FunctionsControlPlaneApi {
  functionsAppsGet(requestParameters?: PageParams): ApiResult<PaginatedResponse<FunctionsApp> | FunctionsApp[]>
  functionsAppsPost(requestParameters: { body: HyperstrateServerInternalModulesFunctionsApplicationCreateAppInput }): ApiResult<FunctionsApp>
  functionsAppsAppIdFunctionsGet(requestParameters: { appId: string } & PageParams): ApiResult<PaginatedResponse<FunctionItem> | FunctionItem[]>
  functionsAppsAppIdFunctionsPost(requestParameters: {
    appId: string
    body: HyperstrateServerInternalModulesFunctionsApplicationDeployFunctionInput
  }): ApiResult<FunctionItem>
  functionsFunctionsFunctionIdGet(requestParameters: { functionId: string }): ApiResult<FunctionDetail>
  functionsFunctionsFunctionIdRevisionsGet(
    requestParameters: { functionId: string } & PageParams,
  ): ApiResult<PaginatedResponse<FunctionRevision> | FunctionRevision[]>
  functionsFunctionsFunctionIdInvocationsGet(
    requestParameters: { functionId: string } & PageParams,
  ): ApiResult<PaginatedResponse<FunctionInvocation> | FunctionInvocation[]>
  functionsFunctionIdInvocationsPost(requestParameters: {
    functionId: string
    body: HyperstrateServerInternalModulesFunctionsApplicationInvokeFunctionInput
  }): ApiResult<FunctionInvocation>
  functionsInvocationsInvocationIdGet(requestParameters: { invocationId: string }): ApiResult<FunctionInvocation>
  functionsInvocationsInvocationIdLogsGet(requestParameters: { invocationId: string } & PageParams): ApiResult<PaginatedResponse<FunctionLog> | FunctionLog[]>
  functionsRunnerPoolsGet(requestParameters?: PageParams): ApiResult<PaginatedResponse<RunnerPool> | RunnerPool[]>
  functionsRunnerPoolsPost(requestParameters: { body: HyperstrateServerInternalModulesFunctionsApplicationCreateRunnerPoolInput }): ApiResult<RunnerPool>
  functionsRunnerPoolsPoolIdAgentsGet(requestParameters: { poolId: string } & PageParams): ApiResult<PaginatedResponse<RunnerAgent> | RunnerAgent[]>
}

export function itemsFromPage<T>(value: PaginatedResponse<T> | T[] | undefined): T[] {
  if (Array.isArray(value)) return value
  return value?.items ?? value?.data ?? []
}

export function metaFromPage<T>(value: PaginatedResponse<T> | T[] | undefined): HyperstrateServerInternalSharedPaginationPaginatedMeta | undefined {
  if (!value || Array.isArray(value)) return undefined
  return value.meta
}
