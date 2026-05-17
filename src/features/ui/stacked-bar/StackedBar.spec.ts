/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import StackedBar from './StackedBar.global.vue'

const SEG_A = { value: 60, colorClass: 'bg-emerald-300', label: 'cached' }
const SEG_B = { value: 30, colorClass: 'bg-indigo-300', label: 'input' }
const SEG_C = { value: 10, colorClass: 'bg-violet-300', label: 'output' }

const tooltipStub = {
  props: ['content'],
  template: '<div data-tooltip :data-content="content"><slot /></div>',
}

function mountBar(props: Record<string, unknown>) {
  return mount(StackedBar, {
    props,
    global: { stubs: { 'ui-tooltip': tooltipStub } },
  })
}

describe('StackedBar', () => {
  it('renders one data-segment per non-zero segment', () => {
    const wrapper = mountBar({ segments: [SEG_A, SEG_B, SEG_C], animated: false })
    expect(wrapper.findAll('[data-segment]').length).toBe(3)
  })

  it('omits segments with value 0', () => {
    const wrapper = mountBar({ segments: [SEG_A, { value: 0, colorClass: 'bg-red-300' }, SEG_B], animated: false })
    expect(wrapper.findAll('[data-segment]').length).toBe(2)
  })

  it('applies colorClass to each segment', () => {
    const wrapper = mountBar({ segments: [SEG_A, SEG_B], animated: false })
    const segs = wrapper.findAll('[data-segment]')
    expect(segs[0].classes()).toContain('bg-emerald-300')
    expect(segs[1].classes()).toContain('bg-indigo-300')
  })

  it('scales segment widths to max prop', () => {
    const wrapper = mountBar({ segments: [{ value: 50, colorClass: 'bg-indigo-300' }], max: 100, animated: false })
    expect(wrapper.find('[data-segment]').attributes('style')).toContain('width: 50%')
  })

  it('clamps segment widths at 100 percent when value exceeds max', () => {
    const wrapper = mountBar({ segments: [{ value: 150, colorClass: 'bg-indigo-300' }], max: 100, animated: false })
    expect(wrapper.find('[data-segment]').attributes('style')).toContain('width: 100%')
  })

  it('auto-computes max from segment sum when max is 0', () => {
    const wrapper = mountBar({
      segments: [
        { value: 25, colorClass: 'bg-indigo-300' },
        { value: 75, colorClass: 'bg-violet-300' },
      ],
      animated: false,
    })
    const segs = wrapper.findAll('[data-segment]')
    expect(segs[0].attributes('style')).toContain('width: 25%')
    expect(segs[1].attributes('style')).toContain('width: 75%')
  })

  it('applies height via inline style', () => {
    const wrapper = mountBar({ segments: [], height: 8, animated: false })
    expect(wrapper.attributes('style')).toContain('height: 8px')
  })

  it('applies rounded-full when rounded is true', () => {
    const wrapper = mountBar({ segments: [], rounded: true, animated: false })
    expect(wrapper.classes()).toContain('rounded-full')
  })

  it('omits rounded-full when rounded is false', () => {
    const wrapper = mountBar({ segments: [], rounded: false, animated: false })
    expect(wrapper.classes()).not.toContain('rounded-full')
  })

  it('applies custom trackClass', () => {
    const wrapper = mountBar({ segments: [], trackClass: 'bg-zinc-200', animated: false })
    expect(wrapper.classes()).toContain('bg-zinc-200')
  })

  it('renders nothing when segments array is empty', () => {
    const wrapper = mountBar({ segments: [], animated: false })
    expect(wrapper.findAll('[data-segment]').length).toBe(0)
  })

  it('wraps each segment in a tooltip with label and value', () => {
    const wrapper = mountBar({ segments: [SEG_A, { value: 4, colorClass: 'bg-red-300' }], animated: false })
    const tooltips = wrapper.findAll('[data-tooltip]')

    expect(tooltips).toHaveLength(2)
    expect(tooltips[0].attributes('data-content')).toBe('cached: 60')
    expect(tooltips[1].attributes('data-content')).toBe('4')
  })

  it('starts at width 0 before mount animation resolves', () => {
    const wrapper = mountBar({ segments: [SEG_A], max: 100, animated: true })
    // renderedPcts starts as zeros before nextTick fires
    expect(wrapper.find('[data-segment]').attributes('style')).toContain('width: 0%')
  })

  it('includes transition style when animated', () => {
    const wrapper = mountBar({ segments: [SEG_A], max: 100, animated: true })
    const style = wrapper.find('[data-segment]').attributes('style') ?? ''
    expect(style).toContain('transition')
  })

  it('omits transition style when not animated', () => {
    const wrapper = mountBar({ segments: [SEG_A], max: 100, animated: false })
    const style = wrapper.find('[data-segment]').attributes('style') ?? ''
    expect(style).not.toContain('transition')
  })
})
