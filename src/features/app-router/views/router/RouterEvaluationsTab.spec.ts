/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any */
import 'reflect-metadata'
import { shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import {
  HyperstrateServerInternalModulesRouterApplicationEvaluationCaseInputScoreMethodEnum as ScoreMethod,
  type HyperstrateServerInternalModulesAiApplicationModelResponse as ModelResponse,
} from '@/__generated__/hyperstrate-api'
import RouterEvaluationsTab from './RouterEvaluationsTab.vue'

const stubs = {
  'app-router-create-evaluation-modal': true,
  'app-router-add-evaluation-case-modal': true,
  'domain-ui-confirm-delete-modal': true,
  'domain-ui-input-combobox-model': true,
  'ui-badge': true,
  'ui-button': true,
  'ui-empty-state': true,
  'ui-icon': true,
  'ui-icon-button': true,
  'ui-indicator': true,
  'ui-label': true,
}

function mountTab() {
  return shallowMount(RouterEvaluationsTab, {
    props: { routerId: 'rtr_1' },
    global: { stubs, provide: { CONTAINER: () => ({}) } },
  })
}

describe('RouterEvaluationsTab', () => {
  it('requires a selected judge model before running LLM-scored evaluations', async () => {
    const wrapper = mountTab()
    const api = { routerEvaluationsEvalIdRunPost: vi.fn() }
    vi.spyOn(wrapper.vm as any, 'apiClientFactory').mockReturnValue(api)
    ;(wrapper.vm as any).selectedEval = { id: 'eval_1' }
    ;(wrapper.vm as any).cases = [{ id: 'case_1', scoreMethod: ScoreMethod.LLM }]

    expect((wrapper.vm as any).requiresLLMJudge).toBe(true)
    expect((wrapper.vm as any).canRunEvaluation).toBe(false)

    await (wrapper.vm as any).runEvaluation()

    expect(api.routerEvaluationsEvalIdRunPost).not.toHaveBeenCalled()
  })

  it('passes the selected judge model id when running LLM-scored evaluations', async () => {
    const wrapper = mountTab()
    const api = { routerEvaluationsEvalIdRunPost: vi.fn().mockResolvedValue({ data: { results: [] } }) }
    vi.spyOn(wrapper.vm as any, 'apiClientFactory').mockReturnValue(api)
    ;(wrapper.vm as any).selectedEval = { id: 'eval_1' }
    ;(wrapper.vm as any).cases = [{ id: 'case_1', scoreMethod: ScoreMethod.LLM }]
    ;(wrapper.vm as any).judgeModel = { label: 'Judge', value: { id: 'mdl_judge' } as ModelResponse }

    await (wrapper.vm as any).runEvaluation()

    expect(api.routerEvaluationsEvalIdRunPost).toHaveBeenCalledWith({
      evalId: 'eval_1',
      judgeModelId: 'mdl_judge',
    })
  })
})
