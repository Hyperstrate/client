import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { Size } from '../clickables/model'
import InputText from './InputText.global.vue'

describe('InputText', () => {
  it('renders an input element', () => {
    const wrapper = mount(InputText)
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('sets input value from modelValue', () => {
    const wrapper = mount(InputText, { props: { modelValue: 'hello' } })
    expect(wrapper.find('input').element.value).toBe('hello')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(InputText, { props: { modelValue: '' } })
    await wrapper.find('input').setValue('world')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['world'])
  })

  it('renders as password type when password=true', () => {
    const wrapper = mount(InputText, { props: { password: true } })
    expect(wrapper.find('input').attributes('type')).toBe('password')
  })

  it('applies error classes when error=true', () => {
    const wrapper = mount(InputText, { props: { error: true } })
    expect(wrapper.find('.flex').classes().join(' ')).toContain('border-red-400')
  })

  it('applies SM size classes', () => {
    const wrapper = mount(InputText, { props: { size: Size.SM } })
    expect(wrapper.classes().join(' ')).toContain('min-h-6')
  })

  it('applies LG size classes', () => {
    const wrapper = mount(InputText, { props: { size: Size.LG } })
    expect(wrapper.classes().join(' ')).toContain('min-h-10')
  })

  it('normalizedValue trims whitespace by default', () => {
    const wrapper = mount(InputText, { props: { modelValue: '  hi  ' } })
    expect((wrapper.vm as unknown as InstanceType<typeof InputText>).normalizedValue).toBe('hi')
  })

  it('normalizedValue does not trim when noTrim=true', () => {
    const wrapper = mount(InputText, { props: { modelValue: '  hi  ', noTrim: true } })
    expect((wrapper.vm as unknown as InstanceType<typeof InputText>).normalizedValue).toBe('  hi  ')
  })

  it('empty returns true for blank value', () => {
    const wrapper = mount(InputText, { props: { modelValue: '   ' } })
    expect((wrapper.vm as unknown as InstanceType<typeof InputText>).empty).toBe(true)
  })

  it('empty returns false for non-blank value', () => {
    const wrapper = mount(InputText, { props: { modelValue: 'hi' } })
    expect((wrapper.vm as unknown as InstanceType<typeof InputText>).empty).toBe(false)
  })
})
