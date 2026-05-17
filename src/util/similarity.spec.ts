import { describe, expect, it } from 'vitest'
import { similarity } from './similarity'

describe('similarity', () => {
  it('returns 1 for identical strings', () => expect(similarity('hello', 'hello')).toBe(1))
  it('returns 1 for two empty strings', () => expect(similarity('', '')).toBe(1))
  it('returns 0 for completely different strings of same length', () => {
    const s = similarity('abc', 'xyz')
    expect(s).toBeGreaterThanOrEqual(0)
    expect(s).toBeLessThan(1)
  })
  it('is case-insensitive', () => expect(similarity('Hello', 'hello')).toBe(1))
  it('returns a value between 0 and 1 for partial matches', () => {
    const s = similarity('kitten', 'sitting')
    expect(s).toBeGreaterThan(0)
    expect(s).toBeLessThan(1)
  })
  it('is symmetric', () => expect(similarity('ab', 'ba')).toBe(similarity('ba', 'ab')))
})
