/* eslint-disable @typescript-eslint/no-explicit-any */
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import InputSelect from './InputSelect.global.vue'

const options = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
]

describe('InputSelect', () => {
  it('renders without crashing', () => {
    const wrapper = mount(InputSelect, { props: { options } })
    expect(wrapper.exists()).toBe(true)
  })

  it('shows placeholder when no value selected', () => {
    const wrapper = mount(InputSelect, {
      props: { options, modelValue: undefined, placeholder: 'Pick one' },
    })
    expect(wrapper.text()).toContain('Pick one')
  })

  it('empty returns true when value is undefined', () => {
    const wrapper = mount(InputSelect, { props: { options, modelValue: undefined } })
    expect((wrapper.vm as unknown as InstanceType<typeof InputSelect>).empty).toBe(true)
  })

  it('empty returns false when value is set', () => {
    const wrapper = mount(InputSelect, { props: { options, modelValue: options[0] } })
    expect((wrapper.vm as unknown as InstanceType<typeof InputSelect>).empty).toBe(false)
  })

  it('normalizedValue returns the current value', () => {
    const wrapper = mount(InputSelect, { props: { options, modelValue: options[0] } })
    expect((wrapper.vm as unknown as InstanceType<typeof InputSelect>).normalizedValue).toEqual(options[0])
  })

  it('shows labels for multiple selected option objects', () => {
    const wrapper = mount(InputSelect, {
      props: { options, modelValue: [options[0], options[1]], multiple: true },
    })
    expect((wrapper.vm as any).displayValue).toBe('Apple, Banana')
  })

  it('shows labels for multiple selected raw values', () => {
    const wrapper = mount(InputSelect, {
      props: { options, modelValue: ['apple', 'banana'], multiple: true },
    })
    expect((wrapper.vm as any).displayValue).toBe('Apple, Banana')
  })

  it('applies error classes on trigger when error=true', () => {
    const wrapper = mount(InputSelect, { props: { options, error: true } })
    expect(wrapper.html()).toContain('border-red-400')
  })
})
