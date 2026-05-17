import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { Size, Variant } from './model'
import Button from './Button.global.vue'

const stubs = { 'ui-clickable': { template: '<button><slot /><slot name="before" /><slot name="after" /></button>' } }

describe('Button', () => {
  it('renders slot content', () => {
    const wrapper = mount(Button, { slots: { default: 'Click me' }, global: { stubs } })
    expect(wrapper.text()).toContain('Click me')
  })

  it('applies dark variant classes by default', () => {
    const wrapper = mount(Button)
    expect(wrapper.classes().join(' ')).toContain('bg-zinc-900')
  })

  it('applies blue variant classes', () => {
    const wrapper = mount(Button, { props: { variant: Variant.Blue } })
    expect(wrapper.classes().join(' ')).toContain('bg-blue-600')
  })

  it('applies red variant classes', () => {
    const wrapper = mount(Button, { props: { variant: Variant.Red } })
    expect(wrapper.classes().join(' ')).toContain('bg-red-600')
  })

  it('applies outlined dark classes', () => {
    const wrapper = mount(Button, { props: { variant: Variant.Dark, outlined: true } })
    expect(wrapper.classes().join(' ')).toContain('border-zinc-900')
  })

  it('applies outlined blue classes', () => {
    const wrapper = mount(Button, { props: { variant: Variant.Blue, outlined: true } })
    expect(wrapper.classes().join(' ')).toContain('text-blue-600')
  })

  it('applies SM size classes', () => {
    const wrapper = mount(Button, { props: { size: Size.SM } })
    expect(wrapper.classes().join(' ')).toContain('min-h-7')
  })

  it('applies LG size classes', () => {
    const wrapper = mount(Button, { props: { size: Size.LG } })
    expect(wrapper.classes().join(' ')).toContain('min-h-10')
  })

  it('applies square size classes', () => {
    const wrapper = mount(Button, { props: { square: true } })
    expect(wrapper.classes().join(' ')).toContain('min-h-8')
  })

  it('applies rounded class when rounded=true', () => {
    const wrapper = mount(Button, { props: { rounded: true } })
    expect(wrapper.classes().join(' ')).toContain('rounded-full')
  })

  it('applies disabled styles when disabled attr passed', () => {
    const wrapper = mount(Button, { attrs: { disabled: true } })
    expect(wrapper.classes().join(' ')).toContain('cursor-not-allowed')
  })
})
