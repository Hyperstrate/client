import { isFunction } from '@/util/lang'
import { Component, Vue } from 'vue-facing-decorator'

/*
 * Usage:
 * class MyComponent extends Mixins(Busyable) {
 *   @Busy()
 *   public async calculate(): Promise<number> {
 *     const result = await calculation();
 *
 *     return result;
 *   }
 * }
 */

type TypedMethodDecorator<T> = (target: unknown, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T> | void

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- using generics in decorators typing is wonky
type BusyableMethod = (this: Busyable, ...args: any[]) => Promise<any>

export function Busy(): TypedMethodDecorator<BusyableMethod> {
  return (_target, _prop, descriptor) => {
    const method = descriptor.value

    if (!isFunction(method)) {
      return
    }

    descriptor.value = function (...args) {
      return this.runBusy(() => method.apply(this, args))
    }
  }
}

@Component
export default class Busyable extends Vue {
  private busyDepth = 0

  public get busy(): boolean {
    return this.busyDepth > 0
  }

  public async awaitBusy<T = unknown>(promise: Promise<T>): Promise<T> {
    this.busyDepth++
    try {
      return await promise
    } finally {
      this.busyDepth--
    }
  }

  public async runBusy<T = unknown>(action: () => Promise<T>): Promise<T> {
    if (this.busy) return undefined as T
    this.busyDepth++
    try {
      return await action()
    } finally {
      this.busyDepth--
    }
  }
}
