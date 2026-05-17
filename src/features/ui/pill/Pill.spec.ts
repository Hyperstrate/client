import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { Variant } from '../clickables/model'
import Pill from './Pill.global.vue'

describe('Pill', () => {
  it('renders slot content', () => {
    const wrapper = mount(Pill, { slots: { default: 'Active' } })
    expect(wrapper.text()).toContain('Active')
  })

  it('applies gray classes by default', () => {
    const wrapper = mount(Pill)
    const cls = wrapper.classes().join(' ')
    expect(cls).toContain('bg-gray-100')
    expect(cls).toContain('text-gray-600')
  })

  it('applies blue classes', () => {
    const wrapper = mount(Pill, { props: { variant: Variant.Blue } })
    const cls = wrapper.classes().join(' ')
    expect(cls).toContain('bg-blue-100')
    expect(cls).toContain('text-blue-700')
  })

  it('applies red classes', () => {
    const wrapper = mount(Pill, { props: { variant: Variant.Red } })
    expect(wrapper.classes().join(' ')).toContain('bg-red-100')
  })

  it('always has rounded-full class', () => {
    const wrapper = mount(Pill)
    expect(wrapper.classes()).toContain('rounded-full')
  })
})
