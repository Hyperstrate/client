import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it } from 'vitest'
import ButtonGroup from './ButtonGroup.global.vue'

const options = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
]

const source = readFileSync(join(process.cwd(), 'src/features/ui/button-group/ButtonGroup.global.vue'), 'utf8')

const UiClickableStub = defineComponent({
  name: 'UiClickableStub',
  props: {
    tag: { type: String, default: 'button' },
  },
  emits: ['click'],
  template: '<button v-bind="$attrs" @click="$emit(\'click\', $event)"><slot /></button>',
})

const mountButtonGroup = (props: Record<string, unknown> = {}): ReturnType<typeof mount> =>
  mount(ButtonGroup, {
    props: { options, ...props },
    global: { stubs: { 'ui-clickable': UiClickableStub } },
  })

describe('ButtonGroup', () => {
  it('uses Reka toggle group semantics with ui-clickable children and no local component registration', () => {
    expect(source).toContain('ToggleGroupRoot')
    expect(source).toContain('ToggleGroupItem')
    expect(source).toContain('reka-ui')
    expect(source).toContain('ui-clickable(')
    expect(source).not.toContain('components:')
  })

  it('renders an animated active indicator', () => {
    expect(source).toContain('useAnimatedIndicator')
    expect(source).toContain("@Setup(() => useAnimatedIndicator({ strategy: 'width' }))")
    expect(source).toContain('indicatorStyle')
    expect(source).toContain('transition-all')
    expect(source).toContain('duration-200')
  })

  it('exposes option, index, and active state to the default slot', () => {
    const wrapper = mount(ButtonGroup, {
      props: { options, modelValue: options[1] },
      slots: {
        default: '<template #default="{ option, index, active }"><span>{{ index }}:{{ option.label }}:{{ active ? "on" : "off" }}</span></template>',
      },
      global: { stubs: { 'ui-clickable': UiClickableStub } },
    })

    expect(wrapper.text()).toContain('1:Week:on')
    expect(wrapper.text()).toContain('0:Day:off')
  })

  it('renders one button per option', () => {
    const wrapper = mountButtonGroup()
    expect(wrapper.findAll('button')).toHaveLength(3)
  })

  it('renders option labels', () => {
    const wrapper = mountButtonGroup()
    expect(wrapper.text()).toContain('Day')
    expect(wrapper.text()).toContain('Week')
    expect(wrapper.text()).toContain('Month')
  })

  it('applies sm size classes by default', () => {
    const wrapper = mountButtonGroup()
    expect(wrapper.find('button').classes().join(' ')).toContain('text-xs')
  })

  it('applies md size classes when size=md', () => {
    const wrapper = mountButtonGroup({ size: 'md' })
    expect(wrapper.find('button').classes().join(' ')).toContain('text-sm')
  })

  it('marks the active option as pressed', () => {
    const wrapper = mountButtonGroup({ modelValue: options[1] })
    expect(wrapper.findAll('button')[1].attributes('aria-pressed')).toBe('true')
    expect(wrapper.findAll('button')[0].attributes('aria-pressed')).toBe('false')
  })

  it('emits update:modelValue when an option is clicked', async () => {
    const wrapper = mountButtonGroup({ modelValue: options[0] })
    await wrapper.findAll('button')[1].trigger('click')
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toEqual([[options[1]]])
  })
})
