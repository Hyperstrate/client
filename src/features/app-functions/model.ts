import type { HyperstrateServerInternalModulesFunctionsApplicationDeployFunctionInput } from '@/__generated__/hyperstrate-api'
import {
  HyperstrateServerInternalModulesFunctionsDomainFunctionStatus as FunctionStatus,
  HyperstrateServerInternalModulesFunctionsDomainInvocationStatus as InvocationStatus,
  HyperstrateServerInternalModulesFunctionsDomainRunnerAgentStatus as RunnerAgentStatus,
  HyperstrateServerInternalModulesFunctionsDomainRunnerPoolStatus as RunnerPoolStatus,
} from '@/__generated__/hyperstrate-api'
import { Variant } from '@/features/ui/clickables/model'

export type JsonRecord = Record<string, unknown>

export interface DeployFunctionFormData {
  name?: string
  entrypoint?: string
  imageBase?: string
  packages?: string
  commands?: string
  pythonVersion?: string
  cpu?: string
  memoryMb?: string
  gpu?: string
  timeoutSecs?: string
  minContainers?: string
  maxContainers?: string
  maxConcurrency?: string
  scaleDownAfterSecs?: string
  sandbox?: string
  networkPolicy?: string
  allowOutboundHosts?: string
  providerStrategy?: string
  allowedProviders?: string
  regions?: string
}

export function parseJsonObject(value: string | undefined | null): JsonRecord {
  const trimmed = value?.trim()
  if (!trimmed) return {}

  const parsed = JSON.parse(trimmed) as unknown
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('JSON must be an object')
  }
  return parsed as JsonRecord
}

export function parseLineList(value: string | undefined | null): string[] {
  return (value ?? '')
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function formatJson(value: unknown): string {
  if (value === undefined || value === null || value === '') return ''
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    if (typeof value === 'bigint') return value.toString()
    if (value instanceof Error) return value.message
    return ''
  }
}

export function buildDeployFunctionInput(form: DeployFunctionFormData): HyperstrateServerInternalModulesFunctionsApplicationDeployFunctionInput {
  return {
    name: trim(form.name),
    entrypoint: trim(form.entrypoint),
    image: {
      base: trim(form.imageBase),
      packages: parseLineList(form.packages),
      commands: parseLineList(form.commands),
    },
    runtime: {
      pythonVersion: trim(form.pythonVersion),
      cpu: trim(form.cpu),
      memoryMb: numberOrUndefined(form.memoryMb),
      gpu: trim(form.gpu),
      timeoutSecs: numberOrUndefined(form.timeoutSecs),
    },
    autoscaling: {
      minContainers: numberOrUndefined(form.minContainers),
      maxContainers: numberOrUndefined(form.maxContainers),
      maxConcurrency: numberOrUndefined(form.maxConcurrency),
      scaleDownAfterSecs: numberOrUndefined(form.scaleDownAfterSecs),
    },
    security: {
      sandbox: trim(form.sandbox),
      networkPolicy: trim(form.networkPolicy),
      allowOutboundHosts: parseLineList(form.allowOutboundHosts),
      runAsNonRoot: true,
      readOnlyRootFs: true,
    },
    provider: {
      strategy: trim(form.providerStrategy),
      allowedProviders: parseLineList(form.allowedProviders),
      regions: parseLineList(form.regions),
    },
  }
}

export function functionStatusVariant(status?: FunctionStatus | string): Variant {
  switch (status) {
    case FunctionStatus.FunctionStatusReady:
      return Variant.Green
    case FunctionStatus.FunctionStatusFailed:
      return Variant.Red
    case FunctionStatus.FunctionStatusDeploying:
      return Variant.Orange
    default:
      return Variant.Gray
  }
}

export function invocationStatusVariant(status?: InvocationStatus | string): Variant {
  switch (status) {
    case InvocationStatus.InvocationStatusSucceeded:
      return Variant.Green
    case InvocationStatus.InvocationStatusFailed:
    case InvocationStatus.InvocationStatusCanceled:
    case InvocationStatus.InvocationStatusTimedOut:
    case InvocationStatus.InvocationStatusExpired:
    case InvocationStatus.InvocationStatusDeadLettered:
      return Variant.Red
    case InvocationStatus.InvocationStatusRunning:
    case InvocationStatus.InvocationStatusStarting:
    case InvocationStatus.InvocationStatusAssigned:
      return Variant.Blue
    case InvocationStatus.InvocationStatusRetrying:
      return Variant.Orange
    default:
      return Variant.Gray
  }
}

export function runnerPoolStatusVariant(status?: RunnerPoolStatus | string): Variant {
  return status === RunnerPoolStatus.RunnerPoolStatusActive ? Variant.Green : Variant.Gray
}

export function runnerAgentStatusVariant(status?: RunnerAgentStatus | string): Variant {
  switch (status) {
    case RunnerAgentStatus.RunnerAgentStatusOnline:
      return Variant.Green
    case RunnerAgentStatus.RunnerAgentStatusRevoked:
      return Variant.Red
    default:
      return Variant.Gray
  }
}

export function invocationIsTerminal(status?: InvocationStatus | string): boolean {
  return (
    status === InvocationStatus.InvocationStatusSucceeded ||
    status === InvocationStatus.InvocationStatusFailed ||
    status === InvocationStatus.InvocationStatusCanceled ||
    status === InvocationStatus.InvocationStatusTimedOut ||
    status === InvocationStatus.InvocationStatusExpired ||
    status === InvocationStatus.InvocationStatusDeadLettered
  )
}

export function statusLabel(status?: string): string {
  if (!status) return ''
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function trim(value: string | undefined | null): string {
  return value?.trim() ?? ''
}

function numberOrUndefined(value: string | number | undefined | null): number | undefined {
  if (value === undefined || value === null || value === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}
