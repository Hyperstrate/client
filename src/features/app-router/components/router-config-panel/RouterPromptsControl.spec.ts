/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any */
import 'reflect-metadata'
import { shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import type {
  HyperstrateServerInternalModulesPromptsApplicationPromptResponse as PromptResponse,
  InternalModulesRouterInterfacesHttpRouterTargetResponse as RouterTarget,
} from '@/__generated__/hyperstrate-api'
import type { Option } from '@/features/ui/inputs/model'
import RouterPromptsControl from './RouterPromptsControl.vue'

const stubs = {
  'domain-ui-input-combobox-prompt': true,
  'ui-button': true,
  'ui-empty-state': true,
  'ui-overline': true,
}

function mountControl(targets: RouterTarget[], initialRouterPromptId = '') {
  return shallowMount(RouterPromptsControl, {
    props: {
      routerId: 'rtr_1',
      initialRouterPromptId,
      targets,
    },
    global: { stubs, provide: { CONTAINER: () => ({}) } },
  })
}

function promptOption(id: string): Option<PromptResponse> {
  return { label: id, value: { id } as PromptResponse }
}

describe('RouterPromptsControl', () => {
  it('keeps the router prompt clean when the combobox re-emits the initial value', () => {
    const wrapper = mountControl([], 'prm_saved')

    ;(wrapper.vm as any).onRouterPromptChange(promptOption('prm_saved'))

    expect((wrapper.vm as any).routerPromptModified).toBe(false)
  })

  it('marks the router prompt dirty only when it differs from the saved value', () => {
    const wrapper = mountControl([], 'prm_saved')

    ;(wrapper.vm as any).onRouterPromptChange(promptOption('prm_next'))

    expect((wrapper.vm as any).routerPromptModified).toBe(true)
  })

  it('keeps a saved router prompt clean when the combobox re-emits the saved value', async () => {
    const wrapper = mountControl([], '')
    const api = {
      routerIdPatch: vi.fn().mockResolvedValue({}),
    }
    vi.spyOn(wrapper.vm as any, 'apiClientFactory').mockReturnValue(api)
    ;(wrapper.vm as any).onRouterPromptChange(promptOption('prm_1'))
    expect((wrapper.vm as any).routerPromptModified).toBe(true)

    await (wrapper.vm as any).saveRouterPrompt()
    ;(wrapper.vm as any).onRouterPromptChange(promptOption('prm_1'))

    expect((wrapper.vm as any).routerPromptModified).toBe(false)
  })

  it('keeps a saved target override clean when the combobox re-emits the saved value', async () => {
    const target = { id: 'tgt_1', promptId: '', modelId: 'mdl_1' } as RouterTarget
    const wrapper = mountControl([target])
    const api = {
      routerIdTargetsTargetIdPatch: vi.fn().mockResolvedValue({
        data: { ...target, promptId: 'prm_1' },
      }),
    }
    vi.spyOn(wrapper.vm as any, 'apiClientFactory').mockReturnValue(api)
    ;(wrapper.vm as any).onTargetPromptChange('tgt_1', promptOption('prm_1'))
    expect((wrapper.vm as any).targetState('tgt_1').modified).toBe(true)

    await (wrapper.vm as any).saveTargetPrompt('tgt_1')
    ;(wrapper.vm as any).onTargetPromptChange('tgt_1', promptOption('prm_1'))

    expect((wrapper.vm as any).targetState('tgt_1').modified).toBe(false)
  })
})
