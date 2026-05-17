import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RoundProgress from './RoundProgress.global.vue'

const wait = (ms = 30): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

describe('RoundProgress', () => {
  it('renders the centered slot content', () => {
    const wrapper = mount(RoundProgress, {
      props: { value: 72, animated: false },
      slots: { default: '<span class="value">72</span>' },
    })

    expect(wrapper.find('.value').text()).toBe('72')
  })

  it('calculates the progress dash from value and max', () => {
    const wrapper = mount(RoundProgress, { props: { value: 50, max: 100, animated: false } })
    const [, progress] = wrapper.findAll('circle')

    expect(progress.attributes('stroke-dasharray')).toBe(`${wrapper.vm.circumference / 2} ${wrapper.vm.circumference}`)
  })

  it('clamps values outside the progress range', async () => {
    const wrapper = mount(RoundProgress, { props: { value: 150, max: 100, animated: false } })

    expect(wrapper.vm.percent).toBe(100)

    await wrapper.setProps({ value: -10 })

    expect(wrapper.vm.percent).toBe(0)
  })

  it('applies custom colors and size', () => {
    const wrapper = mount(RoundProgress, {
      props: { color: '#22c55e', trackColor: '#e5e7eb', size: 64, animated: false },
    })
    const [track, progress] = wrapper.findAll('circle')

    expect(track.attributes('stroke')).toBe('#e5e7eb')
    expect(progress.attributes('stroke')).toBe('#22c55e')
    expect(wrapper.attributes('style')).toContain('width: 64px')
    expect(wrapper.attributes('style')).toContain('height: 64px')
  })

  it('animates from zero on mount', async () => {
    const wrapper = mount(RoundProgress, { props: { value: 50, max: 100, durationMs: 1 } })
    const [, progress] = wrapper.findAll('circle')

    expect(progress.attributes('stroke-dasharray')).toBe(`0 ${wrapper.vm.circumference}`)

    await wait()
    await wrapper.vm.$nextTick()

    expect(progress.attributes('stroke-dasharray')).toBe(`${wrapper.vm.circumference / 2} ${wrapper.vm.circumference}`)
  })
})
