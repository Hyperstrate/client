/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata'
import { mount, shallowMount, type VueWrapper } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import {
  HyperstrateServerInternalModulesRouterDomainRouterInterceptorType,
  HyperstrateServerInternalModulesRouterDomainRouterInterceptorType as IT,
  type InternalModulesRouterInterfacesHttpRouterTargetResponse as RouterTarget,
} from '@/__generated__/hyperstrate-api'
import InterceptorConfigureStep from './InterceptorConfigureStep.vue'
import EditInterceptorModal from '../edit-interceptor-modal/EditInterceptorModal.global.vue'
import { type AddInterceptorFormData } from './form-data'

const targetA = { id: 'tgt_a', modelId: 'mdl_a' } as RouterTarget
const targetB = { id: 'tgt_b', modelId: 'mdl_b' } as RouterTarget
const stubs = {
  'ui-form': { template: '<div><slot :validated="true" :submit="() => undefined" :busy="false" :formData="{}" /></div>' },
  'ui-modal': { template: '<div><slot name="trigger" /><slot /></div>' },
  'ui-form-field': true,
  'ui-button': true,
  'ui-icon': true,
  'ui-badge': true,
  'interceptor-semantic-classifier': true,
  'interceptor-ab-test': true,
  'interceptor-content-filter': true,
  'interceptor-pii-detector': true,
  'interceptor-prompt-guard': true,
  'interceptor-prompt-shield': true,
  'interceptor-team-budget': true,
}
const global = { stubs, provide: { CONTAINER: () => ({}) } }

type InterceptorCase = {
  name: string
  type: IT
  formData: AddInterceptorFormData
  expected: Record<string, unknown>
}

const interceptorCases: InterceptorCase[] = [
  {
    name: 'semantic classifier',
    type: IT.InterceptorSemanticClassifier,
    formData: {
      modelId: { id: 'mdl_embed' },
      similarityThreshold: '0.82',
      type: HyperstrateServerInternalModulesRouterDomainRouterInterceptorType.InterceptorSemanticClassifier,
    },
    expected: { model_id: 'mdl_embed', threshold: 0.82 },
  },
  {
    name: 'ab test',
    type: IT.InterceptorABTest,
    formData: {
      abVariants: [{ name: 'alpha', modelId: targetA, weight: '2' }],
      abPartitionKey: 'user_id',
      type: HyperstrateServerInternalModulesRouterDomainRouterInterceptorType.InterceptorSemanticClassifier,
    },
    expected: { variants: [{ name: 'alpha', model_id: 'mdl_a', weight: 2 }], partition_key: 'user_id' },
  },
  {
    name: 'content filter',
    type: IT.InterceptorContentFilter,
    formData: {
      blockedPatterns: 'secret\npassword',
      type: HyperstrateServerInternalModulesRouterDomainRouterInterceptorType.InterceptorSemanticClassifier,
    },
    expected: { blocked_patterns: ['secret', 'password'] },
  },
  {
    name: 'pii detector',
    type: IT.InterceptorPIIDetector,
    formData: {
      redact: true,
      type: HyperstrateServerInternalModulesRouterDomainRouterInterceptorType.InterceptorSemanticClassifier,
    },
    expected: { redact: true },
  },
  {
    name: 'prompt guard',
    type: IT.InterceptorPromptGuard,
    formData: {
      sensitivity: 'high',
      type: HyperstrateServerInternalModulesRouterDomainRouterInterceptorType.InterceptorSemanticClassifier,
    },
    expected: { sensitivity: 'high' },
  },
  {
    name: 'prompt shield',
    type: IT.InterceptorPromptShield,
    formData: {
      shieldPolicies: 'no secrets\nno exfiltration',
      shieldModelId: { id: 'mdl_shield' },
      type: HyperstrateServerInternalModulesRouterDomainRouterInterceptorType.InterceptorSemanticClassifier,
    },
    expected: { policies: ['no secrets', 'no exfiltration'], shield_model_id: 'mdl_shield' },
  },
  {
    name: 'team budget',
    type: IT.InterceptorTeamBudget,
    formData: {
      teamBudgets: [{ teamId: { id: 'team_1' }, maxCostUsd: '10.5', maxRequests: '100', overflowTargetId: { id: 'tgt_b' } }],
      type: HyperstrateServerInternalModulesRouterDomainRouterInterceptorType.InterceptorSemanticClassifier,
    },
    expected: { budgets: { team_1: { max_cost_usd: 10.5, max_requests: 100, overflow_target_id: 'tgt_b' } } },
  },
]

function mountAddInterceptor(type: IT): VueWrapper<InterceptorConfigureStep, InterceptorConfigureStep> {
  const wrapper = mount(
    {
      name: 'Stepper',
      components: { InterceptorConfigureStep },
      template: '<interceptor-configure-step ref="step" :selected-type="type" router-id="rtr_1" :targets="targets" />',
      data: () => ({ type, targets: [targetA, targetB] }),
      methods: { previous: () => undefined },
    },
    {
      global,
    },
  )
  return wrapper.findComponent(InterceptorConfigureStep)
}

function mountEditInterceptor(type: IT): VueWrapper {
  return shallowMount(EditInterceptorModal, {
    props: {
      routerId: 'rtr_1',
      targets: [targetA, targetB],
      interceptor: { id: 'rint_1', routerId: 'rtr_1', type, config: {}, executionOrder: 0, isEnabled: true },
    },
    global,
  })
}

describe('InterceptorConfigureStep', () => {
  it.each(interceptorCases)('builds add config for $name', ({ type, formData, expected }) => {
    const wrapper = mountAddInterceptor(type)
    expect(wrapper.vm.buildConfig(formData)).toEqual(expected)
  })

  it('submits create payload with interceptor type and config body', async () => {
    const wrapper = mountAddInterceptor(IT.InterceptorContentFilter)
    const api = { routerIdInterceptorsPost: vi.fn().mockResolvedValue({ data: { id: 'rint_1' } }) }
    vi.spyOn(wrapper.vm as any, 'apiClientFactory').mockReturnValue(api)

    await wrapper.vm.doSubmit({
      blockedPatterns: 'secret',
      type: HyperstrateServerInternalModulesRouterDomainRouterInterceptorType.InterceptorSemanticClassifier,
    })

    expect(api.routerIdInterceptorsPost).toHaveBeenCalledWith({
      id: 'rtr_1',
      body: { type: IT.InterceptorContentFilter, config: { blocked_patterns: ['secret'] } },
    })
    expect(wrapper.emitted('added')?.[0]).toEqual([{ id: 'rint_1' }])
  })
})

describe('EditInterceptorModal', () => {
  it.each(interceptorCases)('builds edit config for $name', ({ type, formData, expected }) => {
    const wrapper = mountEditInterceptor(type)
    expect((wrapper.vm as any).buildConfig(formData)).toEqual(expected)
  })

  it('submits edit payload with interceptor config body', async () => {
    const wrapper = mountEditInterceptor(IT.InterceptorContentFilter)
    const api = { routerIdInterceptorsInterceptorIdPatch: vi.fn().mockResolvedValue({ data: { id: 'rint_1', config: { blocked_patterns: ['secret'] } } }) }
    vi.spyOn(wrapper.vm as any, 'apiClientFactory').mockReturnValue(api)
    vi.spyOn(wrapper.vm as any, 'close').mockImplementation(() => undefined)

    await (wrapper.vm as any).doSubmit({ blockedPatterns: 'secret' })

    expect(api.routerIdInterceptorsInterceptorIdPatch).toHaveBeenCalledWith({
      id: 'rtr_1',
      interceptorId: 'rint_1',
      body: { config: { blocked_patterns: ['secret'] } },
    })
    expect(wrapper.emitted('updated')?.[0]).toEqual([{ id: 'rint_1', config: { blocked_patterns: ['secret'] } }])
  })
})
