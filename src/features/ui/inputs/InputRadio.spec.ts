import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import InputRadio from './InputRadio.global.vue'

const options = [
  { label: 'Option A', value: 'a' },
  { label: 'Option B', value: 'b' },
]

describe('InputRadio', () => {
  it('renders one radio input per option', () => {
    const wrapper = mount(InputRadio, { props: { options, modelValue: 'a' } })
    expect(wrapper.findAll('input[type="radio"]')).toHaveLength(2)
  })

  it('renders option labels', () => {
    const wrapper = mount(InputRadio, { props: { options, modelValue: 'a' } })
    expect(wrapper.text()).toContain('Option A')
    expect(wrapper.text()).toContain('Option B')
  })

  it('checks the input matching modelValue', () => {
    const wrapper = mount(InputRadio, { props: { options, modelValue: 'b' } })
    const inputs = wrapper.findAll<HTMLInputElement>('input[type="radio"]')
    expect(inputs[1].element.checked).toBe(true)
  })

  it('emits update:modelValue on selection', async () => {
    const wrapper = mount(InputRadio, { props: { options, modelValue: 'a' } })
    await wrapper.findAll('input[type="radio"]')[1].setValue('b')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b'])
  })

  it('disables inputs when disabled=true', () => {
    const wrapper = mount(InputRadio, { props: { options, modelValue: 'a', disabled: true } })
    wrapper.findAll<HTMLInputElement>('input[type="radio"]').forEach((input) => {
      expect(input.element.disabled).toBe(true)
    })
  })

  it('normalizedValue returns the current value', () => {
    const wrapper = mount(InputRadio, { props: { options, modelValue: 'a' } })
    expect((wrapper.vm as unknown as InstanceType<typeof InputRadio>).normalizedValue).toBe('a')
  })

  it('empty always returns false', () => {
    const wrapper = mount(InputRadio, { props: { options, modelValue: 'a' } })
    expect((wrapper.vm as unknown as InstanceType<typeof InputRadio>).empty).toBe(false)
  })
})
