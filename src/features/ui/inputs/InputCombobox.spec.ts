/* eslint-disable @typescript-eslint/no-explicit-any */
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import InputCombobox from './InputCombobox.global.vue'

const options = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
]

describe('InputCombobox', () => {
  it('shows selected labels for multiple values when closed', () => {
    const wrapper = mount(InputCombobox, {
      props: {
        options,
        modelValue: [options[0], options[1]],
        multiple: true,
      },
    })

    expect(wrapper.find('[data-testid="combobox-selected-display"]').text()).toBe('Apple, Banana')
    expect((wrapper.vm as any).inputTitle).toBe('Apple, Banana')
  })

  it('shows selected labels for multiple raw values when closed', () => {
    const wrapper = mount(InputCombobox, {
      props: {
        options,
        modelValue: ['apple', 'banana'],
        multiple: true,
      },
    })

    expect(wrapper.find('[data-testid="combobox-selected-display"]').text()).toBe('Apple, Banana')
  })

  it('passes multiple selection props to the selected-multiple slot', () => {
    const wrapper = mount(InputCombobox, {
      props: {
        options,
        modelValue: [options[0], options[1]],
        multiple: true,
      },
      slots: {
        'selected-multiple': '<span data-testid="custom-selected">{{ option?.label }} / {{ displayValue }} / {{ count }}</span>',
      },
    })

    expect(wrapper.find('[data-testid="custom-selected"]').text()).toBe('Apple / Apple, Banana / 2')
    expect(wrapper.find('[data-testid="combobox-selected-display"]').exists()).toBe(false)
  })

  it('does not reuse the single selected slot for multiple values', () => {
    const wrapper = mount(InputCombobox, {
      props: {
        options,
        modelValue: [options[0], options[1]],
        multiple: true,
      },
      slots: {
        selected: '<span data-testid="custom-selected">{{ option?.label }}</span>',
      },
    })

    expect(wrapper.find('[data-testid="custom-selected"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="combobox-selected-display"]').text()).toBe('Apple, Banana')
  })

  it('keeps using the selected slot for single values', () => {
    const wrapper = mount(InputCombobox, {
      props: {
        options,
        modelValue: options[0],
      },
      slots: {
        selected: '<span data-testid="custom-selected">{{ option?.label }}</span>',
      },
    })

    expect(wrapper.find('[data-testid="custom-selected"]').text()).toBe('Apple')
  })

  it('treats an empty multiple value as empty', () => {
    const wrapper = mount(InputCombobox, {
      props: {
        options,
        modelValue: [],
        multiple: true,
      },
    })

    expect((wrapper.vm as unknown as InstanceType<typeof InputCombobox>).empty).toBe(true)
  })
})
