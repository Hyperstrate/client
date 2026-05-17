import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import InputTextarea from './InputTextarea.global.vue'

describe('InputTextarea', () => {
  it('renders a textarea element', () => {
    const wrapper = mount(InputTextarea)
    expect(wrapper.find('textarea').exists()).toBe(true)
  })

  it('sets textarea value from modelValue', () => {
    const wrapper = mount(InputTextarea, { props: { modelValue: 'hello' } })
    expect(wrapper.find('textarea').element.value).toBe('hello')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(InputTextarea, { props: { modelValue: '' } })
    await wrapper.find('textarea').setValue('world')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['world'])
  })

  it('applies error border class when error=true', () => {
    const wrapper = mount(InputTextarea, { props: { error: true } })
    expect(wrapper.find('textarea').classes().join(' ')).toContain('border-red-400')
  })

  it('applies readonly classes when readonly=true', () => {
    const wrapper = mount(InputTextarea, { props: { readonly: true } })
    expect(wrapper.find('textarea').classes().join(' ')).toContain('cursor-default')
  })

  it('applies disabled classes when disabled attr passed', () => {
    const wrapper = mount(InputTextarea, { attrs: { disabled: true } })
    expect(wrapper.find('textarea').classes().join(' ')).toContain('cursor-not-allowed')
  })

  it('normalizedValue trims by default', () => {
    const wrapper = mount(InputTextarea, { props: { modelValue: '  hi  ' } })
    expect((wrapper.vm as unknown as InstanceType<typeof InputTextarea>).normalizedValue).toBe('hi')
  })

  it('empty returns true for blank value', () => {
    const wrapper = mount(InputTextarea, { props: { modelValue: '' } })
    expect((wrapper.vm as unknown as InstanceType<typeof InputTextarea>).empty).toBe(true)
  })

  it('respects rows prop', () => {
    const wrapper = mount(InputTextarea, { props: { rows: 6 } })
    expect(wrapper.find('textarea').attributes('rows')).toBe('6')
  })
})
