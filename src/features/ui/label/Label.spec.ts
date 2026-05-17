import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Label from './Label.global.vue'

describe('Label', () => {
  it('renders slot content', () => {
    const wrapper = mount(Label, { slots: { default: 'Email address' } })
    expect(wrapper.text()).toContain('Email address')
  })

  it('does not show required asterisk by default', () => {
    const wrapper = mount(Label, { slots: { default: 'Name' } })
    expect(wrapper.text()).not.toContain('*')
  })

  it('shows required asterisk when required=true', () => {
    const wrapper = mount(Label, {
      props: { required: true },
      slots: { default: 'Name' },
    })
    expect(wrapper.text()).toContain('*')
  })

  it('renders as a label element', () => {
    const wrapper = mount(Label)
    expect(wrapper.element.tagName.toLowerCase()).toBe('label')
  })
})
