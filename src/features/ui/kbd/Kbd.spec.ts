import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Kbd from './Kbd.global.vue'

describe('Kbd', () => {
  it('renders a kbd element', () => {
    const wrapper = mount(Kbd)
    expect(wrapper.element.tagName.toLowerCase()).toBe('kbd')
  })

  it('renders slot content', () => {
    const wrapper = mount(Kbd, { slots: { default: '⌘K' } })
    expect(wrapper.text()).toBe('⌘K')
  })

  it('has monospace font class', () => {
    const wrapper = mount(Kbd)
    expect(wrapper.classes()).toContain('font-mono')
  })

  it('has border and shadow classes', () => {
    const wrapper = mount(Kbd)
    const cls = wrapper.classes().join(' ')
    expect(cls).toContain('border-zinc-200')
    expect(cls).toContain('shadow-xs')
  })
})
