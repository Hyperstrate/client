import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { Size, Variant } from './model'
import Link from './Link.global.vue'

// Link forwards $slots dynamically through ui-clickable; stub it to avoid a null slot key error
const stubs = { 'ui-clickable': { template: '<a><slot /><slot name="before" /><slot name="after" /></a>' } }

describe('Link', () => {
  it('renders slot content', () => {
    const wrapper = mount(Link, { slots: { default: 'Go here' }, global: { stubs } })
    expect(wrapper.text()).toContain('Go here')
  })

  it('applies underline class', () => {
    const wrapper = mount(Link, { global: { stubs } })
    expect(wrapper.classes().join(' ')).toContain('underline')
  })

  it('applies dark variant color by default', () => {
    const wrapper = mount(Link, { global: { stubs } })
    expect(wrapper.classes().join(' ')).toContain('text-zinc-800')
  })

  it('applies blue variant color', () => {
    const wrapper = mount(Link, { props: { variant: Variant.Blue }, global: { stubs } })
    expect(wrapper.classes().join(' ')).toContain('text-blue-600')
  })

  it('applies gray variant color', () => {
    const wrapper = mount(Link, { props: { variant: Variant.Gray }, global: { stubs } })
    expect(wrapper.classes().join(' ')).toContain('text-zinc-500')
  })

  it('applies SM size classes', () => {
    const wrapper = mount(Link, { props: { size: Size.SM }, global: { stubs } })
    expect(wrapper.classes().join(' ')).toContain('min-h-8')
  })

  it('applies disabled color when disabled attr is set', () => {
    const wrapper = mount(Link, { attrs: { disabled: true }, global: { stubs } })
    expect(wrapper.classes().join(' ')).toContain('text-zinc-400')
  })
})
