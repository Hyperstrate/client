import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { DividerDirection } from './model'
import Divider from './Divider.global.vue'

describe('Divider', () => {
  it('renders a horizontal divider by default', () => {
    const wrapper = mount(Divider)
    const cls = wrapper.classes().join(' ')
    expect(cls).toContain('h-[1px]')
    expect(cls).toContain('w-full')
  })

  it('renders a vertical divider when direction=VERTICAL', () => {
    const wrapper = mount(Divider, { props: { direction: DividerDirection.VERTICAL } })
    const cls = wrapper.classes().join(' ')
    expect(cls).toContain('w-[1px]')
    expect(cls).not.toContain('w-full')
  })

  it('always has the zinc background class', () => {
    const wrapper = mount(Divider)
    expect(wrapper.classes()).toContain('bg-zinc-200')
  })
})
