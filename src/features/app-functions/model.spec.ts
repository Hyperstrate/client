import { describe, expect, it } from 'vitest'
import { buildDeployFunctionInput, functionStatusVariant, invocationIsTerminal, parseJsonObject, parseLineList } from './model'
import {
  HyperstrateServerInternalModulesFunctionsDomainFunctionStatus as FunctionStatus,
  HyperstrateServerInternalModulesFunctionsDomainInvocationStatus as InvocationStatus,
} from '@/__generated__/hyperstrate-api'
import { Variant } from '@/features/ui/clickables/model'

describe('app-functions model helpers', () => {
  it('parses JSON payloads into objects and rejects arrays', () => {
    expect(parseJsonObject('{"prompt":"hello","count":2}')).toEqual({ prompt: 'hello', count: 2 })
    expect(parseJsonObject('')).toEqual({})

    expect(() => parseJsonObject('[1,2]')).toThrow('JSON must be an object')
  })

  it('normalizes line lists from textarea input', () => {
    expect(parseLineList('numpy\n\n pandas \nuvicorn')).toEqual(['numpy', 'pandas', 'uvicorn'])
  })

  it('maps function and invocation statuses for compact UI display', () => {
    expect(functionStatusVariant(FunctionStatus.FunctionStatusReady)).toBe(Variant.Green)
    expect(functionStatusVariant(FunctionStatus.FunctionStatusFailed)).toBe(Variant.Red)

    expect(invocationIsTerminal(InvocationStatus.InvocationStatusSucceeded)).toBe(true)
    expect(invocationIsTerminal(InvocationStatus.InvocationStatusRunning)).toBe(false)
  })

  it('builds a deploy request with runtime, scaling, security, provider, and image specs', () => {
    expect(
      buildDeployFunctionInput({
        name: 'embed-text',
        entrypoint: 'handler.embed',
        imageBase: 'python:3.12-slim',
        packages: 'numpy\nsentence-transformers',
        commands: 'python -m pip install --upgrade pip',
        pythonVersion: '3.12',
        cpu: '2',
        memoryMb: '4096',
        gpu: 'a10g',
        timeoutSecs: '900',
        minContainers: '0',
        maxContainers: '8',
        maxConcurrency: '4',
        scaleDownAfterSecs: '45',
        sandbox: 'gvisor',
        networkPolicy: 'restricted',
        allowOutboundHosts: 'huggingface.co\ns3.amazonaws.com',
        providerStrategy: 'price_performance',
        allowedProviders: 'aws\nrunpod',
        regions: 'us-east-1\nus-west-2',
      }),
    ).toEqual({
      name: 'embed-text',
      entrypoint: 'handler.embed',
      image: {
        base: 'python:3.12-slim',
        packages: ['numpy', 'sentence-transformers'],
        commands: ['python -m pip install --upgrade pip'],
      },
      runtime: {
        pythonVersion: '3.12',
        cpu: '2',
        memoryMb: 4096,
        gpu: 'a10g',
        timeoutSecs: 900,
      },
      autoscaling: {
        minContainers: 0,
        maxContainers: 8,
        maxConcurrency: 4,
        scaleDownAfterSecs: 45,
      },
      security: {
        sandbox: 'gvisor',
        networkPolicy: 'restricted',
        allowOutboundHosts: ['huggingface.co', 's3.amazonaws.com'],
        runAsNonRoot: true,
        readOnlyRootFs: true,
      },
      provider: {
        strategy: 'price_performance',
        allowedProviders: ['aws', 'runpod'],
        regions: ['us-east-1', 'us-west-2'],
      },
    })
  })
})
