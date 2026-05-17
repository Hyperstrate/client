import { describe, expect, it } from 'vitest'
import { octetLength, isNonEmptyString, insertSpace, elipsisString } from './string'

describe('octetLength', () => {
  it('returns byte length for ASCII', () => expect(octetLength('abc')).toBe(3))
  it('returns byte length for multi-byte characters', () => expect(octetLength('é')).toBeGreaterThan(1))
  it('returns 0 for empty string', () => expect(octetLength('')).toBe(0))
})

describe('isNonEmptyString', () => {
  it('returns true for non-empty string', () => expect(isNonEmptyString('a')).toBe(true))
  it('returns false for empty string', () => expect(isNonEmptyString('')).toBe(false))
  it('returns false for number', () => expect(isNonEmptyString(1)).toBe(false))
  it('returns false for undefined', () => expect(isNonEmptyString(undefined)).toBe(false))
})

describe('insertSpace', () => {
  it('inserts space at index', () => expect(insertSpace('hello', 2)).toBe('he llo'))
  it('inserts at index 0', () => expect(insertSpace('hello', 0)).toBe(' hello'))
  it('inserts at end', () => expect(insertSpace('hello', 5)).toBe('hello '))
  it('returns original string for negative index', () => expect(insertSpace('hello', -1)).toBe('hello'))
  it('returns original string for out-of-bounds index', () => expect(insertSpace('hello', 10)).toBe('hello'))
})

describe('elipsisString', () => {
  it('returns the string unchanged if within limit', () => expect(elipsisString('hi', 10)).toBe('hi'))
  it('truncates from end', () => expect(elipsisString('hello world', 8, 'end')).toBe('hello...'))
  it('truncates from start', () => expect(elipsisString('hello world', 8, 'start')).toBe('...world'))
  it('truncates in middle', () => {
    // trimmedLength = 8 - 3 = 5; each side = floor(5/2) = 2; result = 2 + 3 + 2 = 7
    const result = elipsisString('hello world', 8, 'middle')
    expect(result).toContain('...')
    expect(result.length).toBe(7)
  })
  it('throws for non-string input', () => expect(() => elipsisString(42 as unknown as string, 5)).toThrow())
  it('throws for limit < 1', () => expect(() => elipsisString('hello', 0)).toThrow())
  it('throws when limit too small for ellipsis', () => expect(() => elipsisString('hello', 2)).toThrow())
})
