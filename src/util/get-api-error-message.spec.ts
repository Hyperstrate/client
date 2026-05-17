/* eslint-disable @typescript-eslint/explicit-function-return-type */
import axios from 'axios'
import { describe, expect, it } from 'vitest'
import { parseApiError, getApiErrorMessage } from './get-api-error-message'

function makeAxiosError(data: unknown, message = 'Request failed') {
  const err = new axios.AxiosError(message)
  err.response = { data, status: 400, statusText: 'Bad Request', headers: {}, config: {} as never }
  return err
}

describe('parseApiError', () => {
  it('returns fallback for non-axios errors', () => {
    expect(parseApiError(new Error('oops'))).toEqual({ error: 'An unknown error occurred', fields: {} })
  })

  it('uses data.error when present', () => {
    const err = makeAxiosError({ error: 'custom error' })
    expect(parseApiError(err).error).toBe('custom error')
  })

  it('uses data.message string when present', () => {
    const err = makeAxiosError({ message: 'msg error' })
    expect(parseApiError(err).error).toBe('msg error')
  })

  it('joins data.message array', () => {
    const err = makeAxiosError({ message: ['a', 'b'] })
    expect(parseApiError(err).error).toBe('a, b')
  })

  it('falls back to axios message when no data', () => {
    const err = makeAxiosError(undefined, 'network error')
    expect(parseApiError(err).error).toBe('network error')
  })

  it('extracts fields', () => {
    const err = makeAxiosError({ error: 'e', fields: { name: ['required'] } })
    expect(parseApiError(err).fields).toEqual({ name: ['required'] })
  })

  it('returns empty fields when not an object', () => {
    const err = makeAxiosError({ error: 'e', fields: 'bad' })
    expect(parseApiError(err).fields).toEqual({})
  })
})

describe('getApiErrorMessage', () => {
  it('returns error string directly', () => {
    const err = makeAxiosError({ error: 'oops' })
    expect(getApiErrorMessage(err)).toBe('oops')
  })

  it('returns fallback for unknown errors', () => {
    expect(getApiErrorMessage('something')).toBe('An unknown error occurred')
  })
})
