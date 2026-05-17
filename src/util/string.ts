import { customAlphabet } from 'nanoid'
import { isString } from './lang'

const ALPHANUMERICAL = '123456789abcdefghijklmnopqrstuvwxyz'
const alphaNumericalFn = customAlphabet(ALPHANUMERICAL)

export function octetLength(string: string): number {
  return encodeURI(string).split(/%(?:u[0-9A-F]{2})?[0-9A-F]{2}|./).length - 1
}

export function isNonEmptyString(value: unknown): boolean {
  return isString(value) && value.length > 0
}

export function splitTrimmedLines(value: unknown): string[] {
  return (typeof value === 'string' ? value : '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export function randomAlphanumeric(size: number): string {
  return alphaNumericalFn(size)
}

export function insertSpace(value: string, index: number): string {
  if (index < 0 || index > value.length) {
    return value
  }
  return `${value.slice(0, index)} ${value.slice(index)}`
}

export function elipsisString(str: string, limit: number, position: 'start' | 'middle' | 'end' = 'middle'): string {
  if (typeof str !== 'string' || limit < 1) {
    throw new Error("Invalid input: 'str' must be a string and 'limit' must be greater than 0.")
  }
  if (str.length <= limit) {
    return str
  }

  const ellipsis = '...'
  const ellipsisLength = ellipsis.length
  const trimmedLength = limit - ellipsisLength

  if (trimmedLength <= 0) {
    throw new Error('Limit too small to add ellipsis.')
  }

  switch (position) {
    case 'start':
      return ellipsis + str.slice(-trimmedLength)
    case 'middle':
      return str.slice(0, Math.floor(trimmedLength / 2)) + ellipsis + str.slice(-Math.floor(trimmedLength / 2))
    case 'end':
    default:
      return str.slice(0, trimmedLength) + ellipsis
  }
}
