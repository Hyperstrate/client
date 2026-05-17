import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Clickable from './Clickable.global.vue'

describe('Clickable', () => {
  it('renders default slot', () => {
    const wrapper = mount(Clickable, { slots: { default: 'content' } })
    expect(wrapper.text()).toContain('content')
  })

  it('renders as anchor by default', () => {
    const wrapper = mount(Clickable)
    expect(wrapper.element.tagName.toLowerCase()).toBe('a')
  })

  it('renders as custom tag when tag attr provided', () => {
    const wrapper = mount(Clickable, { attrs: { tag: 'span' } })
    expect(wrapper.element.tagName.toLowerCase()).toBe('span')
  })

  it('applies cursor-pointer when not disabled', () => {
    const wrapper = mount(Clickable)
    expect(wrapper.classes()).toContain('cursor-pointer')
  })

  it('applies pointer-events-none when disabled', () => {
    const wrapper = mount(Clickable, { props: { disabled: true } })
    expect(wrapper.classes()).toContain('pointer-events-none')
  })

  it('renders before slot', () => {
    const wrapper = mount(Clickable, { slots: { before: '<span>before</span>' } })
    expect(wrapper.text()).toContain('before')
  })

  it('renders after slot', () => {
    const wrapper = mount(Clickable, { slots: { after: '<span>after</span>' } })
    expect(wrapper.text()).toContain('after')
  })
})
