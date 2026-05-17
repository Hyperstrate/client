import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ProgressBar from './ProgressBar.global.vue'

const wait = (ms = 30): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

describe('ProgressBar', () => {
  it('renders progress width from value and max', () => {
    const wrapper = mount(ProgressBar, { props: { value: 25, max: 100, animated: false } })
    const fill = wrapper.findAll('div')[1]

    expect(fill.attributes('style')).toContain('width: 25%')
  })

  it('clamps values outside the progress range', async () => {
    const wrapper = mount(ProgressBar, { props: { value: 120, max: 100, animated: false } })

    expect(wrapper.vm.percent).toBe(100)

    await wrapper.setProps({ value: -10 })

    expect(wrapper.vm.percent).toBe(0)
  })

  it('applies custom fill and track classes', () => {
    const wrapper = mount(ProgressBar, {
      props: { fillClass: 'bg-emerald-400', trackClass: 'bg-zinc-100', animated: false },
    })
    const fill = wrapper.findAll('div')[1]

    expect(wrapper.classes()).toContain('bg-zinc-100')
    expect(fill.classes()).toContain('bg-emerald-400')
  })

  it('applies configured height', () => {
    const wrapper = mount(ProgressBar, { props: { height: 12, animated: false } })

    expect(wrapper.attributes('style')).toContain('height: 12px')
  })

  it('animates from zero on mount', async () => {
    const wrapper = mount(ProgressBar, { props: { value: 25, max: 100, durationMs: 1 } })
    const fill = wrapper.findAll('div')[1]

    expect(fill.attributes('style')).toContain('width: 0%')

    await wait()
    await wrapper.vm.$nextTick()

    expect(fill.attributes('style')).toContain('width: 25%')
  })
})
