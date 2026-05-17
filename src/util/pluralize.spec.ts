import { describe, expect, it } from 'vitest'
import { pluralize } from './pluralize'

describe('pluralize', () => {
  it('uses singular for count=1', () => expect(pluralize(1, 'item')).toBe('1 item'))
  it('uses plural suffix for count=0', () => expect(pluralize(0, 'item')).toBe('0 items'))
  it('uses plural suffix for count>1', () => expect(pluralize(3, 'item')).toBe('3 items'))
  it('uses custom suffix', () => expect(pluralize(2, 'fox', 'es')).toBe('2 foxes'))
  it('singular with custom suffix', () => expect(pluralize(1, 'fox', 'es')).toBe('1 fox'))
})
