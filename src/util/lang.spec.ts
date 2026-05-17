import { describe, expect, it } from 'vitest'
import { isArray, isDef, isNull, isFunction, isString, isNumber, isBoolean, isRecord, isFile, isObject, isEmpty } from './lang'

describe('isArray', () => {
  it('returns true for arrays', () => expect(isArray([1, 2])).toBe(true))
  it('returns false for objects', () => expect(isArray({})).toBe(false))
  it('returns false for strings', () => expect(isArray('abc')).toBe(false))
})

describe('isDef', () => {
  it('returns true for defined values', () => expect(isDef(0)).toBe(true))
  it('returns true for null', () => expect(isDef(null)).toBe(true))
  it('returns false for undefined', () => expect(isDef(undefined)).toBe(false))
})

describe('isNull', () => {
  it('returns true for null', () => expect(isNull(null)).toBe(true))
  it('returns false for undefined', () => expect(isNull(undefined)).toBe(false))
  it('returns false for 0', () => expect(isNull(0)).toBe(false))
})

describe('isFunction', () => {
  it('returns true for functions', () => expect(isFunction(() => {})).toBe(true))
  it('returns false for objects', () => expect(isFunction({})).toBe(false))
})

describe('isString', () => {
  it('returns true for strings', () => expect(isString('')).toBe(true))
  it('returns false for numbers', () => expect(isString(1)).toBe(false))
})

describe('isNumber', () => {
  it('returns true for numbers', () => expect(isNumber(42)).toBe(true))
  it('returns false for strings', () => expect(isNumber('42')).toBe(false))
})

describe('isBoolean', () => {
  it('returns true for booleans', () => expect(isBoolean(false)).toBe(true))
  it('returns false for 0', () => expect(isBoolean(0)).toBe(false))
})

describe('isRecord', () => {
  it('returns true for plain objects', () => expect(isRecord({})).toBe(true))
  it('returns false for arrays', () => expect(isRecord([])).toBe(false))
  it('returns true for null (typeof null === "object")', () => expect(isRecord(null)).toBe(true))
})

describe('isFile', () => {
  it('returns true for File instances', () => {
    const f = new File([''], 'test.txt')
    expect(isFile(f)).toBe(true)
  })
  it('returns false for plain objects', () => expect(isFile({})).toBe(false))
})

describe('isObject', () => {
  it('returns true for plain objects', () => expect(isObject({})).toBe(true))
  it('returns true for arrays', () => expect(isObject([])).toBe(true))
  it('returns false for null', () => expect(isObject(null)).toBe(false))
  it('returns false for primitives', () => expect(isObject(42)).toBe(false))
})

describe('isEmpty', () => {
  it('returns true for null', () => expect(isEmpty(null)).toBe(true))
  it('returns true for undefined', () => expect(isEmpty(undefined)).toBe(true))
  it('returns true for empty object', () => expect(isEmpty({})).toBe(true))
  it('returns true for empty array', () => expect(isEmpty([])).toBe(true))
  it('returns true for blank string', () => expect(isEmpty('   ')).toBe(true))
  it('returns false for non-empty string', () => expect(isEmpty('a')).toBe(false))
  it('returns false for non-empty array', () => expect(isEmpty([1])).toBe(false))
  it('returns false for non-empty object', () => expect(isEmpty({ a: 1 })).toBe(false))
  it('returns false for 0', () => expect(isEmpty(0)).toBe(false))
})
