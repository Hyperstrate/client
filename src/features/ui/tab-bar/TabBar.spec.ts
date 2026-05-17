import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import TabBar from './TabBar.global.vue'
import TabButton from './TabButton.global.vue'

const source = readFileSync(join(process.cwd(), 'src/features/ui/tab-bar/TabBar.global.vue'), 'utf8')

const UiClickableStub = defineComponent({
  name: 'UiClickableStub',
  emits: ['click'],
  template: '<button v-bind="$attrs" @click="$emit(\'click\', $event)"><slot /></button>',
})

const mountTabBar = (props: Record<string, unknown> = {}): ReturnType<typeof mount> =>
  mount(TabBar, {
    props,
    slots: {
      default: `
        <ui-tab-button value="logs">Logs</ui-tab-button>
        <ui-tab-button value="analytics">Analytics</ui-tab-button>
      `,
    },
    global: {
      components: { 'ui-tab-button': TabButton },
      stubs: { 'ui-clickable': UiClickableStub },
    },
  })

describe('TabBar', () => {
  it('uses the shared animated indicator abstraction', () => {
    expect(source).toContain('useAnimatedIndicator')
    expect(source).toContain('@Setup(() =>')
    expect(source).not.toContain('interface IndicatorPosition')
    expect(source).not.toContain('private indicatorPosition')
  })

  it('renders a tab button for each tab', () => {
    const wrapper = mountTabBar()

    expect(wrapper.findAll('button')).toHaveLength(2)
    expect(wrapper.text()).toContain('Logs')
    expect(wrapper.text()).toContain('Analytics')
  })

  it('emits the selected tab value when a tab is clicked', async () => {
    const wrapper = mountTabBar()

    await wrapper.findAll('button')[1].trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['analytics']])
  })

  it('renders the animated indicator element', () => {
    const wrapper = mountTabBar()
    const indicator = wrapper.find('[role="presentation"]')

    expect(indicator.exists()).toBe(true)
    expect(indicator.classes()).toContain('indicator')
  })

  it('keeps the active pill tab background on the animated indicator', async () => {
    const wrapper = mountTabBar({ modelValue: 'logs', variant: 'pill' })

    await nextTick()
    await nextTick()

    const indicator = wrapper.find('[role="presentation"]')
    expect(indicator.classes()).toContain('bg-white')
    expect(indicator.classes()).toContain('on')
  })
})
