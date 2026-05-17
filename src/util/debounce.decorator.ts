import { debounce } from 'lodash'

export function Debounce(wait = 0, leading = false, trailing = true): MethodDecorator {
  return function (_target, _propertyKey, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    descriptor.value = debounce(originalMethod, wait, { leading, trailing })
  }
}
