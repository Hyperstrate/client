import { RequiredProp } from '@/util/prop-decorators'
import { Component, Inject, Vue } from 'vue-facing-decorator'
import { LayoutEngineRoot } from './layout-engine'
import { type ComponentReference, REGISTER_LAYOUT, UNREGISTER_LAYOUT } from './model'
import { Fragment, h, VNode } from 'vue'

@Component({ inheritAttrs: false })
export class Layout extends Vue {
  @RequiredProp()
  public use!: ComponentReference

  @Inject({ from: REGISTER_LAYOUT })
  public readonly registerLayout!: LayoutEngineRoot['registerLayout']

  @Inject({ from: UNREGISTER_LAYOUT })
  public readonly unregisterLayout!: LayoutEngineRoot['unregisterLayout']

  public render(): VNode {
    this.registerLayout(this, {
      _isVue: true,
      use: this.use,
      attrs: this.$attrs,
    })

    return h(
      Fragment,
      Object.values(this.$slots).flatMap((slot) => slot?.() || []),
    )
  }

  public beforeUnmount(): void {
    this.unregisterLayout(this)
  }
}
