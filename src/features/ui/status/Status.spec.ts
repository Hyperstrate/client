import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Pill from '../pill/Pill.global.vue'
import Status from './Status.global.vue'

const globalComponents = { 'ui-pill': Pill }

describe('Status', () => {
  it('shows active label when value=true', () => {
    const wrapper = mount(Status, {
      props: { value: true },
      global: { components: globalComponents },
    })
    expect(wrapper.text()).toContain('Active')
  })

  it('shows inactive label when value=false', () => {
    const wrapper = mount(Status, {
      props: { value: false },
      global: { components: globalComponents },
    })
    expect(wrapper.text()).toContain('Disabled')
  })

  it('respects custom active label', () => {
    const wrapper = mount(Status, {
      props: { value: true, activeLabel: 'Online' },
      global: { components: globalComponents },
    })
    expect(wrapper.text()).toContain('Online')
  })

  it('respects custom inactive label', () => {
    const wrapper = mount(Status, {
      props: { value: false, inactiveLabel: 'Offline' },
      global: { components: globalComponents },
    })
    expect(wrapper.text()).toContain('Offline')
  })
})
