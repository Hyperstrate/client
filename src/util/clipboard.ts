import { type App, type ObjectDirective } from 'vue'

function makeHandler(el: Element, text: string): EventListener {
  return () => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        const original = el.textContent
        el.textContent = 'Copied!'
        setTimeout(() => {
          el.textContent = original
        }, 2000)
      })
      .catch(() => {})
  }
}

const handlers = new WeakMap<Element, EventListener>()

function attach(el: Element, text: string): void {
  const handler = makeHandler(el, text)
  handlers.set(el, handler)
  el.addEventListener('click', handler)
}

function detach(el: Element): void {
  const handler = handlers.get(el)
  if (handler) {
    el.removeEventListener('click', handler)
    handlers.delete(el)
  }
}

function createDirective(): ObjectDirective<Element, string> {
  return {
    beforeMount(el, { value }) {
      attach(el, value)
    },
    updated(el, { value }) {
      detach(el)
      attach(el, value)
    },
    unmounted(el) {
      detach(el)
    },
  }
}

export default function registerClipboard(vue: App<Element>, name = 'clipboard'): void {
  vue.directive(name, createDirective())
}
