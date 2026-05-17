import { isFunction } from '@/util/lang'
import { type App, type ObjectDirective } from 'vue'

type Callback = (this: Element, event: Event) => unknown

export default function registerClickOutside(vue: App<Element>, name = 'click-outside'): void {
  vue.directive(name, createDirective())
}

function createDirective(): ObjectDirective {
  const elementMap = new Map<Element, Set<Callback>>()

  function handler(event: Event): void {
    if (!(event.target instanceof Node)) {
      return
    }

    for (const [el, callbackSet] of elementMap) {
      if (el.contains(event.target)) {
        continue
      }

      for (const callback of callbackSet) {
        callback.call(el, event)
      }
    }
  }

  function addCallback(el: Element, value: unknown): void {
    if (!isFunction(value)) {
      return
    }

    if (elementMap.size === 0) {
      document.body.addEventListener('click', handler, true)
    }

    const callbackSet = elementMap.get(el) ?? new Set()
    callbackSet.add(value)
    elementMap.set(el, callbackSet)
  }

  function removeCallback(el: Element, value: unknown): void {
    if (!isFunction(value)) {
      return
    }

    const callbackSet = elementMap.get(el)
    if (callbackSet === undefined) {
      return
    }

    callbackSet.delete(value)
    if (callbackSet.size > 0) {
      return
    }

    elementMap.delete(el)
    if (elementMap.size === 0) {
      document.body.removeEventListener('click', handler, true)
    }
  }

  return {
    beforeMount(el: Element, { value }) {
      addCallback(el, value)
    },
    updated(el: Element, { value, oldValue }) {
      removeCallback(el, oldValue)
      addCallback(el, value)
    },
    unmounted(el: Element, { value }) {
      removeCallback(el, value)
    },
  }
}
