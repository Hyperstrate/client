import 'reflect-metadata'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { APP_MAP, CONTAINER } from '../../container'
import Sidebar from './Sidebar.vue'

const appMap = {
  APP_HOME: { name: 'APP_HOME', label: 'Home', icon: 'home', order: 0, link: { to: { name: 'Home' } } },
  APP_ROUTER: { name: 'APP_ROUTER', label: 'Router', icon: 'router', order: 1, group: 'configure', link: { to: { name: 'Router' } } },
}

function mountSidebar(): ReturnType<typeof mount> {
  const container = (key: string): typeof appMap => {
    if (key === APP_MAP) return appMap
    throw new Error(`Unexpected container key: ${key}`)
  }

  return mount(Sidebar, {
    global: {
      provide: { [CONTAINER]: container },
      stubs: {
        'ui-tooltip': { template: '<span><slot /></span>' },
      },
      mocks: {
        $route: { meta: {} },
        $router: { push: vi.fn() },
      },
    },
  })
}

describe('Sidebar', () => {
  it('keeps sidebar styling in Tailwind classes instead of scoped CSS', () => {
    const source = readFileSync(join(process.cwd(), 'src/features/core/components/sidebar/Sidebar.vue'), 'utf8')

    expect(source).not.toContain('<style')
    expect(source).not.toContain('@apply')
  })

  it('keeps group separator content mounted so height can animate when collapsing', async () => {
    localStorage.clear()
    const wrapper = mountSidebar()

    expect(wrapper.get('[data-test="sidebar-group-marker"]').classes()).toContain('h-2.5')
    expect(wrapper.findAll('[data-test="sidebar-group-label"]')).toHaveLength(1)
    expect(wrapper.findAll('[data-test="sidebar-group-rule"]')).toHaveLength(1)
    expect(wrapper.get('[data-test="sidebar-group-label"]').text()).toBe('Configure')

    await wrapper.get('[data-test="sidebar-toggle"]').trigger('click')
    await nextTick()

    expect(wrapper.get('[data-test="sidebar-group-marker"]').classes()).toContain('h-px')
    expect(wrapper.findAll('[data-test="sidebar-group-label"]')).toHaveLength(1)
    expect(wrapper.findAll('[data-test="sidebar-group-rule"]')).toHaveLength(1)
  })
})
