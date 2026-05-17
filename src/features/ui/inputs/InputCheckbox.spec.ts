/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import InputCheckbox from './InputCheckbox.global.vue'

const stubs = {
  'ui-icon': { props: ['icon', 'size'], template: '<svg data-icon :data-name="icon" :data-size="size" />' },
}

function mountCheckbox(props: Record<string, unknown> = {}) {
  return mount(InputCheckbox, { props, global: { stubs } })
}

describe('InputCheckbox', () => {
  it('renders a checkbox input', () => {
    const wrapper = mountCheckbox()
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
  })

  it('renders label text', () => {
    const wrapper = mountCheckbox({ label: 'Accept terms' })
    expect(wrapper.text()).toContain('Accept terms')
  })

  it('is checked when modelValue equals trueValue', () => {
    const wrapper = mountCheckbox({ modelValue: true, trueValue: true, falseValue: false })
    expect(wrapper.find('input').element.checked).toBe(true)
  })

  it('is unchecked when modelValue equals falseValue', () => {
    const wrapper = mountCheckbox({ modelValue: false, trueValue: true, falseValue: false })
    expect(wrapper.find('input').element.checked).toBe(false)
  })

  it('emits update:modelValue with trueValue when checked', async () => {
    const wrapper = mountCheckbox({ modelValue: false, trueValue: true, falseValue: false })
    await wrapper.find('input').setValue(true)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })

  it('emits update:modelValue with falseValue when unchecked', async () => {
    const wrapper = mountCheckbox({ modelValue: true, trueValue: true, falseValue: false })
    await wrapper.find('input').setValue(false)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('applies cursor-not-allowed when disabled', () => {
    const wrapper = mountCheckbox({ disabled: true })
    expect(wrapper.find('label').classes()).toContain('cursor-not-allowed')
  })

  it('empty always returns false', () => {
    const wrapper = mountCheckbox({ modelValue: false })
    expect((wrapper.vm as unknown as InstanceType<typeof InputCheckbox>).empty).toBe(false)
  })

  it('supports array modelValue for grouped checkboxes', () => {
    const wrapper = mountCheckbox({ modelValue: ['a', 'b'], checkedValue: 'a' })
    expect(wrapper.find('input').element.checked).toBe(true)
  })

  it('renders a centered icon checkmark instead of pseudo-element geometry', () => {
    const wrapper = mountCheckbox()
    const box = wrapper.find('[data-checkbox-box]')

    expect(box.classes()).toEqual(expect.arrayContaining(['flex', 'items-center', 'justify-center']))
    expect(wrapper.find('[data-icon]').attributes('data-name')).toBe('check')
    expect(wrapper.find('[data-icon]').attributes('data-size')).toBe('12')
    expect(box.classes().some((className) => className.startsWith('before:'))).toBe(false)
  })
})
