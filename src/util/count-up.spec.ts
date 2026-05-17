import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { countUp } from './count-up'

describe('countUp', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    let rafId = 0
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
      rafId++
      void Promise.resolve().then(() => cb(performance.now()))
      return rafId
    })
    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('calls onUpdate(0) immediately when to=0', () => {
    const onUpdate = vi.fn()
    countUp(0, 500, onUpdate)
    expect(onUpdate).toHaveBeenCalledWith(0)
  })

  it('returns a cancel function', () => {
    const cancel = countUp(100, 500, vi.fn())
    expect(typeof cancel).toBe('function')
  })

  it('cancel calls cancelAnimationFrame', async () => {
    const cancel = countUp(100, 500, vi.fn())
    cancel()
    expect(cancelAnimationFrame).toHaveBeenCalled()
  })
})
