import { describe, expect, it } from 'vitest'
import { isExpired } from './is-expired'

describe('isExpired', () => {
  it('returns true when no date provided', () => expect(isExpired(undefined)).toBe(true))
  it('returns true when null provided', () => expect(isExpired(null)).toBe(true))

  it('returns true for a past date', () => {
    const past = new Date(Date.now() - 10_000)
    expect(isExpired(past)).toBe(true)
  })

  it('returns false for a future date well beyond the threshold', () => {
    const future = new Date(Date.now() + 120_000)
    expect(isExpired(future)).toBe(false)
  })

  it('returns true when within the default 60s threshold', () => {
    const soonExpires = new Date(Date.now() + 30_000)
    expect(isExpired(soonExpires)).toBe(true)
  })

  it('respects a custom threshold', () => {
    const soonExpires = new Date(Date.now() + 30_000)
    expect(isExpired(soonExpires, 10)).toBe(false)
  })
})
