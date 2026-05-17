/* eslint-disable @typescript-eslint/no-explicit-any */
import { debounce } from 'lodash'

export function debounceAsyncCancelable<Fn extends (...args: any[]) => Promise<any>>(
  // The last parameter must be AbortSignal.
  fn: (...args: [...Parameters<Fn>, AbortSignal]) => ReturnType<Fn>,
  wait: number,
): (...args: Parameters<Fn>) => Promise<Awaited<ReturnType<Fn>>> {
  let pendingPromise: { resolve: (value: Awaited<ReturnType<Fn>>) => void; reject: (reason?: any) => void } | undefined = undefined
  let lastArgs: Parameters<Fn>
  let lastAbortController: AbortController | undefined = undefined

  const debounced = debounce(async () => {
    const thisAbortController = new AbortController()
    if (lastAbortController) {
      lastAbortController.abort()
    }
    lastAbortController = thisAbortController

    try {
      const result = await fn(...lastArgs, thisAbortController.signal)
      pendingPromise?.resolve(result)
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        pendingPromise?.reject(error)
      }
    }
    pendingPromise = undefined
  }, wait)

  return (...args: Parameters<Fn>): Promise<Awaited<ReturnType<Fn>>> => {
    lastArgs = args
    if (pendingPromise) {
      pendingPromise = undefined
    }
    return new Promise<Awaited<ReturnType<Fn>>>((resolve, reject) => {
      pendingPromise = { resolve, reject }
      void debounced()
    })
  }
}
