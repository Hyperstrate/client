import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EmptyState from './EmptyState.global.vue'

describe('EmptyState', () => {
  it('renders heading', () => {
    const wrapper = mount(EmptyState, { props: { heading: 'No items found' } })
    expect(wrapper.text()).toContain('No items found')
  })

  it('renders subheading when provided', () => {
    const wrapper = mount(EmptyState, { props: { heading: 'Empty', subheading: 'Try adding something' } })
    expect(wrapper.text()).toContain('Try adding something')
  })

  it('does not render subheading element when not provided', () => {
    const wrapper = mount(EmptyState, { props: { heading: 'Empty', subheading: '' } })
    const paras = wrapper.findAll('p')
    expect(paras).toHaveLength(1)
  })

  it('applies centering layout', () => {
    const wrapper = mount(EmptyState, { props: { heading: 'Empty' } })
    expect(wrapper.classes().join(' ')).toContain('items-center')
  })
})
