/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Component, Vue, Watch } from 'vue-facing-decorator'
import { WatchConfig } from 'vue-facing-decorator/dist/option/watch'

/*
 * Usage with auto-rerender on property change:
 * class MyComponent extends Mixins(Rerenderable) {
 *   @RerenderOn
 *   private isOpen = false
 * }
 */

export function RerenderOn(option?: Omit<WatchConfig, 'handler' | 'key'>): PropertyDecorator {
  return (target, key: string | symbol) => {
    const watchKey = `$_rerender_watch_${String(key)}`

    //@ts-ignore
    if (!target[watchKey]) {
      //@ts-ignore
      target[watchKey] = function (this: Partial<Rerenderable>, newValue: unknown, oldValue: unknown) {
        if (newValue !== oldValue && newValue === true) {
          this.rerender?.()
        }
      }

      Watch(key as string, option)(target, watchKey)
    }
  }
}

@Component
export default class Rerenderable extends Vue {
  private _renderKey = 0

  public rerender(): void {
    this._renderKey++
  }

  public get renderKey(): number {
    return this._renderKey
  }
}
