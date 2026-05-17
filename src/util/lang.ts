export const { isArray } = Array

export function isDef<T>(value: T): value is Exclude<T, undefined> {
  return value !== undefined
}

export function isNull(value: unknown): value is null {
  return value === null
}

export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function'
}

export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number'
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && !isArray(value)
}

export const isFile = (value: unknown): value is File => {
  return value instanceof File
}

export const isObject = (input: unknown): input is object => input instanceof Object

export const isEmpty = (input: unknown): boolean => {
  return (
    input === null ||
    input === undefined ||
    (isObject(input) && Object.keys(input).length === 0) ||
    (isArray(input) && (input as unknown[]).length === 0) ||
    (typeof input === 'string' && input.trim().length === 0)
  )
}
