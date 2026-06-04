/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type */
import 'reflect-metadata'
import { shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { API_CLIENT_MAP, CONTAINER } from '@/features/core/container'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import AppView from './AppView.vue'

const stubs = {
  'app-functions-create-functions-app-modal': true,
  'app-functions-create-runner-pool-modal': true,
  'app-functions-deploy-function-modal': true,
  'app-functions-invocation-detail-drawer': true,
  'app-functions-invoke-function-modal': true,
  'domain-ui-page-header': true,
  'ui-badge': true,
  'ui-button': true,
  'ui-clickable': true,
  'ui-icon': true,
  'ui-layout': { template: '<div><slot /></div>' },
  'ui-tab-bar': true,
  'ui-tab-button': true,
  'ui-tooltip': true,
}

function makeApi() {
  return {
    functionsAppsGet: vi.fn().mockResolvedValue({ data: { items: [{ id: 'fapp_1', name: 'Embeddings' }] } }),
    functionsRunnerPoolsGet: vi.fn().mockResolvedValue({ data: { items: [] } }),
    functionsAppsAppIdFunctionsGet: vi.fn().mockResolvedValue({
      data: { items: [{ id: 'fn_1', appId: 'fapp_1', name: 'embed', entrypoint: 'main.embed', status: 'ready' }] },
    }),
    functionsFunctionsFunctionIdGet: vi.fn().mockResolvedValue({
      data: { id: 'fn_1', appId: 'fapp_1', name: 'embed', entrypoint: 'main.embed', status: 'ready' },
    }),
    functionsFunctionsFunctionIdRevisionsGet: vi.fn().mockResolvedValue({ data: { items: [] } }),
    functionsFunctionsFunctionIdInvocationsGet: vi.fn().mockResolvedValue({ data: { items: [] } }),
  }
}

function mountView(api = makeApi()) {
  const container = (key: string): unknown => {
    if (key === API_CLIENT_MAP) return { [HYPERSTRATE_API]: { name: HYPERSTRATE_API, client: api } }
    throw new Error(`Unexpected container key: ${key}`)
  }

  return shallowMount(AppView, {
    global: {
      provide: { [CONTAINER]: container },
      stubs,
      mocks: {
        $route: { query: {} },
        $router: { replace: vi.fn(), push: vi.fn() },
      },
    },
  })
}

describe('Functions AppView', () => {
  it('loads functions for the first app after loading the control plane', async () => {
    const api = makeApi()
    const wrapper = mountView(api)

    await (wrapper.vm as any).asyncData()

    expect((wrapper.vm as any).selectedAppId).toBe('fapp_1')
    expect((wrapper.vm as any).functions).toHaveLength(1)
    expect(api.functionsAppsAppIdFunctionsGet).toHaveBeenCalledWith({ appId: 'fapp_1', page: 1, perPage: 50 })
  })
})
