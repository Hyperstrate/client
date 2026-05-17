import { describe, expect, it, vi } from 'vitest'
import { useAnimatedIndicator } from './use-animated-indicator'

interface RectFixture {
  x?: number
  y?: number
  top?: number
  left?: number
  right?: number
  bottom?: number
  width?: number
  height?: number
}

const elementWithRect = (rects: RectFixture[]): HTMLElement => {
  const element = document.createElement('div')
  let rectIndex = 0
  const nextRect = vi.fn(() => {
    const rect = rects[Math.min(rectIndex, rects.length - 1)]
    rectIndex += 1
    const left = rect.x ?? rect.left ?? 0
    const top = rect.y ?? rect.top ?? 0
    const width = rect.width ?? (rect.right ?? left) - left
    const height = rect.height ?? (rect.bottom ?? top) - top
    return DOMRect.fromRect({ x: left, y: top, width, height })
  })
  element.getBoundingClientRect = nextRect
  return element
}

describe('useAnimatedIndicator', () => {
  it('measures a left and width indicator for fixed-width controls', () => {
    const indicator = useAnimatedIndicator({ strategy: 'width' })
    const container = elementWithRect([{ left: 10, right: 310, width: 300 }])
    const active = elementWithRect([{ left: 50, right: 130, width: 80 }])

    indicator.update(container, active)

    expect(indicator.style.value).toEqual({ left: '40px', width: '80px' })
    expect(indicator.classes).toMatchObject({ on: true, left: false, right: false })
  })

  it('tracks movement direction after the indicator is visible', () => {
    const indicator = useAnimatedIndicator({ strategy: 'width' })
    const container = elementWithRect([{ left: 0, right: 300, width: 300 }])
    const first = elementWithRect([{ left: 40, right: 120, width: 80 }])
    const second = elementWithRect([{ left: 12, right: 92, width: 80 }])
    const third = elementWithRect([{ left: 120, right: 200, width: 80 }])

    indicator.update(container, first)
    indicator.update(container, second)
    expect(indicator.classes).toMatchObject({ on: true, left: true, right: false })

    indicator.update(container, third)
    expect(indicator.classes).toMatchObject({ on: true, left: false, right: true })
  })

  it('measures a scroll-aware left and right indicator for scrollable controls', () => {
    const indicator = useAnimatedIndicator({ strategy: 'edges', scrollPadding: 40 })
    const container = elementWithRect([{ left: 0, right: 100, width: 100 }])
    Object.defineProperties(container, {
      clientWidth: { value: 100 },
      scrollWidth: { value: 300 },
      scrollLeft: { value: 0, writable: true },
    })
    const active = elementWithRect([
      { left: 90, right: 130, width: 40 },
      { left: 20, right: 60, width: 40 },
    ])

    indicator.update(container, active)

    expect(container.scrollLeft).toBe(70)
    expect(indicator.style.value).toEqual({ left: '90px', right: '-30px' })
  })

  it('hides the indicator when there is no active element', () => {
    const indicator = useAnimatedIndicator({ strategy: 'width' })
    const container = elementWithRect([{ left: 0, right: 100, width: 100 }])
    const active = elementWithRect([{ left: 10, right: 40, width: 30 }])

    indicator.update(container, active)
    indicator.update(container, undefined)

    expect(indicator.classes).toMatchObject({ on: false, left: false, right: false })
  })
})
