import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { Size, Variant } from '../clickables/model'
import Indicator from './Indicator.global.vue'
import { IndicatorPosition } from './model'

describe('Indicator', () => {
  it('renders content slot', () => {
    const wrapper = mount(Indicator, {
      slots: { content: '<div class="test-content">content</div>' },
    })
    expect(wrapper.find('.test-content').exists()).toBe(true)
  })

  it('renders badge slot when provided', () => {
    const wrapper = mount(Indicator, {
      slots: { default: '3' },
    })
    expect(wrapper.text()).toContain('3')
  })

  it('does not render badge div when no default slot', () => {
    const wrapper = mount(Indicator)
    // Without default slot, the conditional v-if="$slots['default']" should hide the badge
    expect(wrapper.find('.absolute').exists()).toBe(false)
  })

  it('applies blue variant by default', () => {
    const wrapper = mount(Indicator, { slots: { default: '!' } })
    expect(wrapper.find('.absolute').classes().join(' ')).toContain('bg-blue-600')
  })

  it('applies red variant', () => {
    const wrapper = mount(Indicator, {
      props: { variant: Variant.Red },
      slots: { default: '!' },
    })
    expect(wrapper.find('.absolute').classes().join(' ')).toContain('bg-red-600')
  })

  it('applies medium size by default', () => {
    const wrapper = mount(Indicator, { slots: { default: '!' } })
    const cls = wrapper.find('.absolute').classes()
    expect(cls).toContain('w-6')
    expect(cls).toContain('h-6')
  })

  it('applies xs size', () => {
    const wrapper = mount(Indicator, {
      props: { size: Size.XS },
      slots: { default: '!' },
    })
    const cls = wrapper.find('.absolute').classes()
    expect(cls).toContain('w-2')
    expect(cls).toContain('h-2')
  })

  it('positions badge at top-right by default', () => {
    const wrapper = mount(Indicator, { slots: { default: '1' } })
    const badge = wrapper.find('.absolute')
    const cls = badge.classes()
    expect(cls).toContain('top-0')
    expect(cls).toContain('right-0')
  })

  it('positions badge at bottom-left when position=BOTTOM_LEFT', () => {
    const wrapper = mount(Indicator, {
      props: { position: IndicatorPosition.BOTTOM_LEFT },
      slots: { default: '1' },
    })
    const badge = wrapper.find('.absolute')
    const cls = badge.classes()
    expect(cls).toContain('bottom-0')
    expect(cls).toContain('left-0')
  })
})
