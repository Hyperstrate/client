import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import InputBare from './InputBare.global.vue'

describe('InputBare', () => {
  it('renders an input element', () => {
    const wrapper = mount(InputBare)
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('sets value from modelValue', () => {
    const wrapper = mount(InputBare, { props: { modelValue: 'hello' } })
    expect(wrapper.find('input').element.value).toBe('hello')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(InputBare, { props: { modelValue: '' } })
    await wrapper.find('input').setValue('world')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['world'])
  })

  it('renders as password type when password=true', () => {
    const wrapper = mount(InputBare, { props: { password: true } })
    expect(wrapper.find('input').attributes('type')).toBe('password')
  })

  it('normalizedValue trims by default', () => {
    const wrapper = mount(InputBare, { props: { modelValue: '  hi  ' } })
    expect((wrapper.vm as unknown as InstanceType<typeof InputBare>).normalizedValue).toBe('hi')
  })

  it('empty returns true for blank string', () => {
    const wrapper = mount(InputBare, { props: { modelValue: '  ' } })
    expect((wrapper.vm as unknown as InstanceType<typeof InputBare>).empty).toBe(true)
  })

  it('empty returns false for non-blank string', () => {
    const wrapper = mount(InputBare, { props: { modelValue: 'x' } })
    expect((wrapper.vm as unknown as InstanceType<typeof InputBare>).empty).toBe(false)
  })
})
