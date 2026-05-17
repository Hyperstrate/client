import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Card from './Card.global.vue'

describe('Card', () => {
  it('renders slot content', () => {
    const wrapper = mount(Card, { slots: { default: '<p>Card content</p>' } })
    expect(wrapper.text()).toContain('Card content')
  })

  it('renders a div root element', () => {
    const wrapper = mount(Card)
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('has rounded and shadow classes', () => {
    const wrapper = mount(Card)
    const cls = wrapper.classes().join(' ')
    expect(cls).toContain('rounded-xl')
    expect(cls).toContain('shadow-xs')
  })

  it('has white background', () => {
    const wrapper = mount(Card)
    expect(wrapper.classes()).toContain('bg-white')
  })
})
