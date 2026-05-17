import { OptionalProp } from '@/util/prop-decorators'
import { ComponentPublicInstance, h, resolveComponent, VNode } from 'vue'
import { Component, Provide, Vue } from 'vue-facing-decorator'
import { Layout } from './layout'
import { type ComponentReference, EMPTY_CONFIG, REGISTER_LAYOUT, UNREGISTER_LAYOUT } from './model'

interface LayoutConfig {
  _isVue: true
  use?: ComponentReference
  attrs?: ComponentPublicInstance['$attrs']
}

export type LayoutEngineRoot = LayoutEngine

@Component
export default class LayoutEngine extends Vue {
  @OptionalProp()
  private defaultLayout?: ComponentReference

  private config: LayoutConfig = EMPTY_CONFIG
  private owner?: Layout

  @Provide(REGISTER_LAYOUT)
  public registerLayout(owner: Layout, config: LayoutConfig): void {
    this.owner = owner
    this.config = config
  }

  @Provide(UNREGISTER_LAYOUT)
  public unregisterLayout(owner: Layout): void {
    if (owner !== this.owner) {
      return
    }

    this.owner = undefined
    this.config = EMPTY_CONFIG
  }

  public render(): VNode {
    return (this.createLayoutVNode() ?? this.$slots.default?.() ?? h('div')) as VNode
  }

  private createLayoutVNode(): VNode | undefined {
    if (this.config === EMPTY_CONFIG) {
      return undefined
    }

    const component = this.config.use || this.defaultLayout || 'div'

    return h(typeof component === 'string' && component !== 'div' ? resolveComponent(component, true) : component, this.config.attrs, this.$slots)
  }
}
