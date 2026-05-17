import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { Size, Variant } from '../clickables/model'
import Badge from './Badge.global.vue'

describe('Badge', () => {
  it('renders slot content', () => {
    const wrapper = mount(Badge, { slots: { default: 'Hello' } })
    expect(wrapper.text()).toContain('Hello')
  })

  it('applies gray variant classes by default', () => {
    const wrapper = mount(Badge)
    const cls = wrapper.classes().join(' ')
    expect(cls).toContain('bg-gray-100')
    expect(cls).toContain('text-gray-600')
  })

  it('applies blue variant classes', () => {
    const wrapper = mount(Badge, { props: { variant: Variant.Blue } })
    const cls = wrapper.classes().join(' ')
    expect(cls).toContain('bg-blue-50')
    expect(cls).toContain('text-blue-700')
  })

  it('applies red variant classes', () => {
    const wrapper = mount(Badge, { props: { variant: Variant.Red } })
    expect(wrapper.classes().join(' ')).toContain('bg-red-50')
  })

  it('applies XS size classes', () => {
    const wrapper = mount(Badge, { props: { size: Size.XS } })
    expect(wrapper.classes().join(' ')).toContain('px-1')
  })

  it('applies LG size classes', () => {
    const wrapper = mount(Badge, { props: { size: Size.LG } })
    expect(wrapper.classes().join(' ')).toContain('py-1')
  })

  it('renders dot span when dot=true', () => {
    const wrapper = mount(Badge, { props: { dot: true } })
    // root span + inner dot span
    const spans = wrapper.findAll('span')
    expect(spans.length).toBe(2)
    // the inner dot span (index 1) has the rounded-full class
    expect(spans[1].classes().join(' ')).toContain('rounded-full')
  })

  it('does not render inner dot span when dot=false', () => {
    const wrapper = mount(Badge, { props: { dot: false } })
    // only the root span, no dot child
    expect(wrapper.findAll('span').length).toBe(1)
  })
})
