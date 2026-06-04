/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { shallowMount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { API_CLIENT_MAP, CONTAINER, MODELS } from '@/features/core/container'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { InputComboboxSearch, type SearchFnArgs, type SearchFnReturnType } from '@/features/ui/inputs/InputComboboxSearch'
import InputComboboxModelDefinition from './InputComboboxModelDefinition.global.vue'

const catalogItem = {
  key: 'openai/gpt-4o',
  displayName: 'GPT-4o',
  modelId: 'gpt-4o',
  provider: 'openai',
}

class OverridableDebounceSearch extends InputComboboxSearch<{ id: string }> {
  protected override get debouncedSearch(): () => Promise<void> {
    return async () => undefined
  }

  protected async searchFn(_args: SearchFnArgs): Promise<SearchFnReturnType<{ id: string }>> {
    return {
      items: [],
      meta: { count: 0, page: 1, pages: 1, perPage: 0, total: 0 },
    }
  }

  protected getOptionLabel(item: { id: string }): string {
    return item.id
  }

  protected getOptionId(item: { id: string }): string {
    return item.id
  }
}

function mountCombobox(api = { aiCatalogGet: vi.fn().mockResolvedValue({ data: [catalogItem] }) }) {
  const container = (name: string) => {
    if (name === MODELS) return []
    if (name === API_CLIENT_MAP) return { [HYPERSTRATE_API]: { client: api } }
    throw new Error(`${name} not found`)
  }

  const wrapper = shallowMount(InputComboboxModelDefinition, {
    global: {
      provide: { [CONTAINER]: container },
      stubs: {
        'ui-input-combobox': true,
      },
    },
  })

  return { wrapper, api }
}

describe('InputComboboxModelDefinition', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows subclasses to override the protected debounced search hook', () => {
    expect(OverridableDebounceSearch).toBeDefined()
  })

  it('marks the combobox as loading while a debounced catalog search is pending', async () => {
    vi.useFakeTimers()
    const { wrapper } = mountCombobox()
    const vm = wrapper.vm as unknown as { onSearch: (value: string) => void; loading: boolean }

    vm.onSearch('gpt')
    await nextTick()

    expect(vm.loading).toBe(true)

    await vi.advanceTimersByTimeAsync(150)
    expect(vm.loading).toBe(false)
  })

  it('debounces catalog searches while the user types', async () => {
    vi.useFakeTimers()
    const { wrapper, api } = mountCombobox()
    const vm = wrapper.vm as unknown as { onSearch: (value: string) => void }

    vm.onSearch('g')
    vm.onSearch('gp')
    vm.onSearch('gpt')
    await nextTick()

    await vi.advanceTimersByTimeAsync(149)
    expect(api.aiCatalogGet).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    expect(api.aiCatalogGet).toHaveBeenCalledTimes(1)
    expect(api.aiCatalogGet).toHaveBeenCalledWith({ query: 'gpt' })
  })
})
