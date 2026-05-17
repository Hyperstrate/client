import { isFunction, throttle } from 'lodash'

export function Throttle(wait = 0, leading = false, trailing = true): MethodDecorator {
  const instanceMap = new WeakMap<object, (...args: unknown[]) => unknown>()

  return function (_target, _propertyKey, descriptor: PropertyDescriptor) {
    const method: unknown = descriptor.value
    if (!isFunction(method)) {
      return
    }

    descriptor.value = function (...args: unknown[]) {
      const throttled = instanceMap.get(this) || throttle(method, wait, { leading, trailing })

      if (!instanceMap.has(this)) {
        instanceMap.set(this, throttled)
      }

      throttled.apply(this, args)
    }
  }
}
