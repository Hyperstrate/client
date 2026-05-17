/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * @AsyncData() method decorator.
 *
 * Wraps an `asyncData()` method so that, whenever it is called explicitly
 * (pagination page change, refresh, @Watch handler, etc.), its return value is
 * automatically written back to `this.$data` — the same behaviour the global
 * plugin provides on `created`.
 *
 * Usage:
 *   @AsyncData()
 *   public async asyncData(): Promise<AsyncData<MyComponent>> {
 *     this.setLoading(true)
 *     try {
 *       const { data } = await this.api.someGet()
 *       return { items: data.items, meta: data.meta }  // keys must be declared class properties
 *     } finally {
 *       this.setLoading(false)
 *     }
 *   }
 *
 * Rules:
 *   - Every key in the returned object must already be declared as a class
 *     property. The decorator uses `this.$data[key] ??= undefined` to ensure
 *     Vue has registered the property as reactive before assigning. Undeclared
 *     keys are written but will NOT be reactive.
 *   - The original return value is still returned by the wrapped method, so
 *     callers can use `await this.asyncData()` and inspect the result if needed.
 *   - Do NOT return props, computed values, or anything not in `$data` — they
 *     will silently overwrite the wrong slot.
 */
import { isFunction } from '@/util/lang'
import { isObject } from 'lodash-es'

export type AsyncDataArgs = {
  wait: number
  leading?: boolean
  trailing?: boolean
}

export function AsyncData(args?: AsyncDataArgs): MethodDecorator {
  return (_target, _propertyKey, descriptor: TypedPropertyDescriptor<any>) => {
    const method: unknown = descriptor.value

    if (!isFunction(method)) {
      return
    }

    descriptor.value = async function (...args: unknown[]) {
      const result = await method.apply(this, args)

      if (isObject(result)) {
        for (const [key, value] of Object.entries(result)) {
          //@ts-expect-error
          this.$data[key] ??= undefined
          //@ts-expect-error
          this.$data[key] = value
        }
      }

      return result
    }
  }
}
