import { describe, expect, it } from 'vitest'
import { cssLength } from './css-length'

describe('cssLength', () => {
  it('returns undefined when value is undefined', () => expect(cssLength(undefined)).toBeUndefined())
  it('returns string as-is', () => expect(cssLength('10rem')).toBe('10rem'))
  it('converts number > 1 to px', () => expect(cssLength(100)).toBe('100px'))
  it('converts 0 to percent', () => expect(cssLength(0)).toBe('0%'))
  it('converts 0.5 to 50%', () => expect(cssLength(0.5)).toBe('50%'))
  it('converts 1 to 100%', () => expect(cssLength(1)).toBe('100%'))
  it('converts 2 to 2px', () => expect(cssLength(2)).toBe('2px'))
})
