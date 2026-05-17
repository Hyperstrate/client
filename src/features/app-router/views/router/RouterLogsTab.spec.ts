/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any */
import 'reflect-metadata'
import { shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import type { InternalModulesObservabilityInterfacesHttpInferenceLogResponse as InferenceLog } from '@/__generated__/hyperstrate-api'
import RouterLogsTab from './RouterLogsTab.vue'

const stubs = {
  'app-analytics-inference-log-detail-drawer': true,
  'domain-ui-pipeline-flame': true,
  'domain-ui-pipeline-trace': true,
  'ui-badge': true,
  'ui-button-group': true,
  'ui-divider': true,
  'ui-empty-state': true,
  'ui-icon': true,
  'ui-icon-button': true,
  'ui-clickable': true,
  'ui-overline': true,
  'ui-pagination': true,
  'ui-table': true,
}

function mountLogsTab() {
  return shallowMount(RouterLogsTab, {
    props: { routerId: 'rtr_1' },
    global: { stubs, provide: { CONTAINER: () => ({}) } },
  })
}

describe('RouterLogsTab', () => {
  it('does not render a separate details action column', () => {
    const wrapper = mountLogsTab()

    expect((wrapper.vm as any).columns.map((c: { name: string }) => c.name)).not.toContain('details')
  })

  it('opens a selected log in the detail drawer', () => {
    const wrapper = mountLogsTab()
    const log = { id: 'ilog_1', status: 'success' } as InferenceLog

    ;(wrapper.vm as any).openDetail(log)

    expect((wrapper.vm as any).selectedLog).toStrictEqual(log)
  })

  it('submits feedback from the detail drawer and updates the selected row optimistically', async () => {
    const wrapper = mountLogsTab()
    const api = { analyticsInferenceLogsIdFeedbackPatch: vi.fn().mockResolvedValue({}) }
    vi.spyOn(wrapper.vm as any, 'apiClientFactory').mockReturnValue(api)
    const log = { id: 'ilog_1', feedback: 0 } as InferenceLog

    await (wrapper.vm as any).submitFeedback(log, 1)

    expect(log.feedback).toBe(1)
    expect(api.analyticsInferenceLogsIdFeedbackPatch).toHaveBeenCalledWith({
      id: 'ilog_1',
      body: { feedback: 1 },
    })
  })
})
