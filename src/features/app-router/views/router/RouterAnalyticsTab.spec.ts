/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any */
import 'reflect-metadata'
import { shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import RouterAnalyticsTab from './RouterAnalyticsTab.vue'

const stubs = {
  'ui-badge': { template: '<span><slot /></span>' },
  'ui-icon': true,
  'ui-empty-state': true,
  'ui-indicator': true,
  'ui-overline': true,
  'ui-stacked-bar': true,
}

function mountTab() {
  return shallowMount(RouterAnalyticsTab, {
    props: { routerId: 'rtr_1' },
    global: { stubs, provide: { CONTAINER: () => ({}) } },
  })
}

describe('RouterAnalyticsTab', () => {
  it('builds cache distribution segments from normalized stats', () => {
    const wrapper = mountTab()
    ;(wrapper.vm as any).stats = {
      totalRequests: 100,
      analyzedLogs: 20,
      cache: { totalRequests: 100, exactHits: 25, semanticHits: 15, misses: 60, hitRatePct: 40, estSavedUsd: 1.25 },
      features: [],
      interceptors: [],
    }

    expect((wrapper.vm as any).cacheSegments.map((s: any) => ({ key: s.key, pct: s.pct }))).toEqual([
      { key: 'exact', pct: 25 },
      { key: 'semantic', pct: 15 },
      { key: 'miss', pct: 60 },
    ])
    expect((wrapper.vm as any).cacheStackSegments).toEqual([
      { value: 25, colorClass: 'bg-indigo-500', label: 'Exact hits' },
      { value: 15, colorClass: 'bg-violet-500', label: 'Semantic hits' },
      { value: 60, colorClass: 'bg-gray-300', label: 'Misses' },
    ])
  })

  it('builds sorted animated outcome segments and summary text', () => {
    const wrapper = mountTab()
    const stat = {
      kind: 'interceptor',
      name: 'Policy',
      extraAttempts: 0,
      outcomes: { skipped: 1, passed: 10, blocked: 4, error: 2 },
    }

    expect((wrapper.vm as any).topOutcomeEntries(stat)).toEqual([
      ['passed', 10],
      ['blocked', 4],
      ['error', 2],
    ])
    expect((wrapper.vm as any).outcomeSegments(stat)).toEqual([
      { value: 10, colorClass: 'bg-emerald-400', label: 'passed' },
      { value: 4, colorClass: 'bg-red-400', label: 'blocked' },
      { value: 2, colorClass: 'bg-red-400', label: 'error' },
      { value: 1, colorClass: 'bg-slate-400', label: 'skipped' },
    ])
    expect((wrapper.vm as any).outcomeSummary(stat)).toBe('passed 10 / blocked 4 / error 2')
  })

  it('labels and colors target selection outcomes explicitly', () => {
    const wrapper = mountTab()
    const stat = {
      kind: 'transform',
      name: 'Cost-Aware Routing',
      extraAttempts: 0,
      outcomes: { target_selected: 3 },
    }

    expect((wrapper.vm as any).outcomeSegments(stat)).toEqual([{ value: 3, colorClass: 'bg-blue-400', label: 'target selected' }])
    expect((wrapper.vm as any).outcomeSummary(stat)).toBe('target selected 3')
  })

  it('keeps team budget skipped and overflow values visible', () => {
    const wrapper = mountTab()
    const stat = {
      kind: 'interceptor',
      name: 'Team Budget',
      extraAttempts: 0,
      outcomes: { skipped: 5, overflow_routed: 2 },
    }

    expect((wrapper.vm as any).outcomeSegments(stat)).toEqual([
      { value: 5, colorClass: 'bg-slate-400', label: 'skipped' },
      { value: 2, colorClass: 'bg-amber-400', label: 'overflow routed' },
    ])
    expect((wrapper.vm as any).outcomeSummary(stat)).toBe('skipped 5 / overflow routed 2')
  })

  it('normalizes text and numeric alignment inside outcome badges with flex gap spacing', async () => {
    const wrapper = mountTab()
    ;(wrapper.vm as any).stats = {
      totalRequests: 15,
      analyzedLogs: 15,
      cache: { totalRequests: 0, exactHits: 0, semanticHits: 0, misses: 0, hitRatePct: 0, estSavedUsd: 0 },
      features: [{ kind: 'cache', name: 'Cache', extraAttempts: 0, outcomes: { passed: 12 } }],
      interceptors: [{ kind: 'policy', name: 'Policy', extraAttempts: 0, outcomes: { blocked: 3 } }],
    }
    await nextTick()

    const contents = wrapper.findAll('[data-test="outcome-badge-content"]')
    const values = wrapper.findAll('[data-test="outcome-badge-value"]')

    expect(contents).toHaveLength(2)
    expect(contents.every((node) => node.classes().includes('type-badge-inline'))).toBe(true)
    expect(values).toHaveLength(2)
    expect(values.every((node) => node.classes().includes('type-badge-number'))).toBe(true)
    expect(values.every((node) => !node.classes().some((className) => /^(?:m[lrbt]|translate-y)-/.test(className)))).toBe(true)
  })
})
