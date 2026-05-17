import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Overline from './Overline.global.vue'

describe('Overline', () => {
  it('renders slot content', () => {
    const wrapper = mount(Overline, { slots: { default: 'Section title' } })
    expect(wrapper.text()).toContain('Section title')
  })

  it('renders as a span element', () => {
    const wrapper = mount(Overline)
    expect(wrapper.element.tagName).toBe('SPAN')
  })

  it('applies overline typography class', () => {
    const wrapper = mount(Overline)
    expect(wrapper.classes()).toContain('type-overline')
  })
})
