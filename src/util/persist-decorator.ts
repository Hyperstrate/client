/* eslint-disable @typescript-eslint/no-explicit-any */
import { createDecorator } from 'vue-facing-decorator'
import { isString } from './lang'

interface PersistOptions {
  key?: string
  defaultValue?: unknown
  serializer?: {
    read: (value: string) => unknown
    write: (value: unknown) => string
  }
}

interface ComponentInstance {
  constructor: ComponentConstructor
  $options?: ComponentOptions
  [key: string]: any
}

interface ComponentConstructor {
  name?: string
}

interface ComponentOptions {
  name?: string
  _componentTag?: string
  data?: () => Record<string, any>
  watch?: Record<string, any>
}

export function Persist(options: PersistOptions | string = {}): PropertyDecorator {
  const config: PersistOptions = isString(options) ? { key: options } : options
  //@ts-expect-error mismatch type
  return createDecorator((componentOptions: ComponentOptions, propertyKey: string | symbol) => {
    const getStorageKey = (componentInstance: ComponentInstance): string => {
      if (config.key) {
        return config.key
      }

      const componentName = componentInstance.constructor?.name || componentInstance.$options?.name || componentInstance.$options?._componentTag || 'Component'

      return `${componentName}_${String(propertyKey)}`
    }

    const serializer = config.serializer || {
      read: JSON.parse,
      write: JSON.stringify,
    }

    const originalData =
      componentOptions.data ||
      function (): Record<string, any> {
        return {}
      }

    componentOptions.data = function (this: ComponentInstance): Record<string, any> {
      const data: Record<string, any> = originalData.call(this)

      let value: unknown = data[String(propertyKey)] ?? config.defaultValue
      try {
        const storageKey = getStorageKey(this)
        const stored = localStorage.getItem(storageKey)
        if (stored !== null && stored !== '') {
          value = serializer.read(stored)
        }
      } catch (error: unknown) {
        const storageKey: string = getStorageKey(this)
        console.warn(`Failed to load ${storageKey} from localStorage:`, error)
      }

      data[String(propertyKey)] = value
      return data
    }

    // Always use array form so the persist watcher stays independent from any
    // existing @Watch decorators — each entry keeps its own options.
    componentOptions.watch = componentOptions.watch || {}

    const persistWatcher = {
      handler(this: ComponentInstance, newValue: unknown): void {
        try {
          const storageKey: string = getStorageKey(this)
          if (newValue !== undefined && newValue !== null) {
            localStorage.setItem(storageKey, serializer.write(newValue))
          } else {
            localStorage.removeItem(storageKey)
          }
        } catch (error: unknown) {
          const storageKey: string = getStorageKey(this)
          console.warn(`Failed to save ${storageKey} to localStorage:`, error)
        }
      },
      deep: true,
      immediate: false,
    }

    const existingWatcher = componentOptions.watch[String(propertyKey)]
    if (existingWatcher) {
      const existing = Array.isArray(existingWatcher) ? existingWatcher : [existingWatcher]
      componentOptions.watch[String(propertyKey)] = [...existing, persistWatcher]
    } else {
      componentOptions.watch[String(propertyKey)] = persistWatcher
    }
  })
}
