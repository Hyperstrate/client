/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import OptionPicker from './OptionPicker.global.vue'

const options = [
  { label: 'Option A', description: 'Desc A', value: 'a' },
  { label: 'Option B', value: 'b' },
]

describe('OptionPicker', () => {
  const mountPicker = (modelValue: unknown = null) =>
    mount(OptionPicker, {
      props: { options, modelValue },
      global: {
        stubs: {
          'ui-clickable': {
            props: ['tag'],
            template: '<button type="button" v-bind="$attrs" @click="$emit(\'click\', $event)"><slot /></button>',
          },
        },
      },
    })

  it('renders all options', () => {
    const wrapper = mountPicker()
    expect(wrapper.findAll('button')).toHaveLength(2)
  })

  it('renders option labels', () => {
    const wrapper = mountPicker()
    expect(wrapper.text()).toContain('Option A')
    expect(wrapper.text()).toContain('Option B')
  })

  it('renders option descriptions', () => {
    const wrapper = mountPicker()
    expect(wrapper.text()).toContain('Desc A')
  })

  it('highlights selected option with border class', () => {
    const wrapper = mountPicker('a')
    const buttons = wrapper.findAll('button')
    expect(buttons[0].classes().join(' ')).toContain('border-violet-500')
    expect(buttons[1].classes().join(' ')).toContain('border-zinc-200')
  })

  it('emits update:modelValue on click', async () => {
    const wrapper = mountPicker('a')
    await wrapper.findAll('button')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b'])
  })

  it('empty returns true when modelValue is null', () => {
    const wrapper = mountPicker()
    expect((wrapper.vm as InstanceType<typeof OptionPicker>).empty).toBe(true)
  })

  it('empty returns false when modelValue is set', () => {
    const wrapper = mountPicker('a')
    expect((wrapper.vm as InstanceType<typeof OptionPicker>).empty).toBe(false)
  })
})
