import { type Component, type DefineComponent } from 'vue'
import { componentPath } from '@/util/component-path'

const components = import.meta.glob('./**/*.vue')

export function component<T = Component | DefineComponent>(path: string): T | Lazy<T> {
  return components[componentPath(path)] as T
}
