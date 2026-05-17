/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { type ComponentType } from 'types/component-type'
import { toNative } from 'vue-facing-decorator'
import { type Cons } from 'vue-facing-decorator/dist/component'

// WIP: not to be used now

// Alternative: More specific extraction based on decorators
export function typedComponent<T extends Cons>(
  componentClass: T,
): ComponentType<
  ExtractDecoratedProps<InstanceType<T>>,
  ExtractVueEmits<InstanceType<T>>,
  Record<string, any> // Slots are harder to infer automatically
> {
  return toNative(componentClass) as unknown as ComponentType<ExtractDecoratedProps<InstanceType<T>>, ExtractVueEmits<InstanceType<T>>, Record<string, any>>
}

// More sophisticated prop extraction for decorated properties
type ExtractDecoratedProps<T> = {
  [K in keyof T as T[K] extends Function ? never : K extends `$${string}` ? never : K extends `_${string}` ? never : K]?: T[K]
}

// Extract Vue emits (methods that call this.$emit)
type ExtractVueEmits<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any ? (K extends `on${infer EventName}` ? Lowercase<EventName> : never) : never]: T[K] extends (
    ...args: infer Args
  ) => any
    ? Args
    : []
}
