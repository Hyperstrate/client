/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any */
import 'reflect-metadata'
import { shallowMount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { HyperstrateServerInternalModulesObservabilityDomainABVariantStats as ABVariantStats } from '@/__generated__/hyperstrate-api'
import RouterABTab from './RouterABTab.vue'

const stubs = {
  'ui-button': true,
  'ui-icon': true,
  'ui-indicator': true,
  'ui-stacked-bar': true,
}

function mountTab() {
  return shallowMount(RouterABTab, {
    props: { routerId: 'rtr_1', interceptors: [], targets: [] },
    global: { stubs, provide: { CONTAINER: () => ({}) } },
  })
}

describe('RouterABTab', () => {
  it('calculates group requests and traffic share for comparison rows', () => {
    const wrapper = mountTab()
    const variants = [
      { variant: 'a', requests: 30 },
      { variant: 'b', requests: 70 },
    ] as ABVariantStats[]

    expect((wrapper.vm as any).groupRequests({ variants })).toBe(100)
    expect((wrapper.vm as any).trafficShare(variants[0], variants)).toBe(30)
    expect((wrapper.vm as any).trafficShare(variants[1], variants)).toBe(70)
    expect((wrapper.vm as any).trafficSegments({ variants })).toEqual([
      { value: 30, colorClass: 'bg-indigo-400', label: 'a' },
      { value: 70, colorClass: 'bg-violet-400', label: 'b' },
    ])
  })

  it('highlights risky and leading variant metrics', () => {
    const wrapper = mountTab()
    const variants = [
      { variant: 'a', requests: 100, errorCount: 8, avgLatencyMs: 120, costUsd: 2 },
      { variant: 'b', requests: 100, errorCount: 1, avgLatencyMs: 80, costUsd: 5 },
    ] as ABVariantStats[]

    expect((wrapper.vm as any).errorRateClass(variants[0])).toContain('text-red')
    expect((wrapper.vm as any).latencyClass(variants[1], variants)).toContain('text-emerald')
    expect((wrapper.vm as any).costClass(variants[1], variants)).toContain('text-amber')
  })
})
