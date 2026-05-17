import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { SpacerDirection, SpacerSize } from './model'
import Spacer from './Spacer.global.vue'

describe('Spacer', () => {
  it('renders a vertical spacer by default', () => {
    const wrapper = mount(Spacer)
    expect(wrapper.attributes('style')).toContain('height')
    expect(wrapper.attributes('style')).not.toContain('width')
  })

  it('renders a horizontal spacer when direction=HORIZONTAL', () => {
    const wrapper = mount(Spacer, { props: { direction: SpacerDirection.HORIZONTAL } })
    expect(wrapper.attributes('style')).toContain('width')
    expect(wrapper.attributes('style')).not.toContain('height')
  })

  it('applies the correct size in px', () => {
    const wrapper = mount(Spacer, { props: { size: SpacerSize.LG } })
    expect(wrapper.attributes('style')).toContain('24px')
  })

  it('defaults to MD size', () => {
    const wrapper = mount(Spacer)
    expect(wrapper.attributes('style')).toContain('16px')
  })

  it('always has block and shrink-0 classes', () => {
    const wrapper = mount(Spacer)
    expect(wrapper.classes()).toContain('block')
    expect(wrapper.classes()).toContain('shrink-0')
  })
})
