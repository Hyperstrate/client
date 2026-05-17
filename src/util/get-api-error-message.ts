/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { isAxiosError, type AxiosError } from 'axios'
import { isArray, isString } from './lang'

export interface ParsedApiError {
  error: string
  fields: Record<string, string[]>
}

export function parseApiError(value: AxiosError | unknown): ParsedApiError {
  if (!isAxiosError(value)) {
    return { error: 'An unknown error occurred', fields: {} }
  }
  const data = value.response?.data as { error?: string; message?: string | string[]; fields?: Record<string, string[]> } | undefined

  let error = value.message ?? 'An unknown error occurred'
  if (isString(data?.error)) error = data.error!
  else if (isString(data?.message)) error = data.message
  else if (isArray(data?.message)) error = data.message.join(', ')

  const fields = data?.fields !== undefined && typeof data.fields === 'object' && !Array.isArray(data.fields) ? data.fields : {}

  return { error, fields }
}

export function getApiErrorMessage(value: AxiosError | unknown): string {
  return parseApiError(value).error
}
