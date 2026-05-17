import { HyperstrateServerInternalModulesAiDomainProvider } from '@/__generated__/hyperstrate-api'
import { MODELS } from '@/features/core/container'
import type { Model } from '@/features/core/model'
import { Mixins } from '@/util/mixin'
import { Component as VueComponent } from 'vue'
import { Component } from 'vue-facing-decorator'
import ContainerMixin from './container.mixin'
import { Size } from '@/features/ui/clickables/model'

@Component
export default class ModelsMixin extends Mixins(ContainerMixin) {
  protected get modelBrands(): Model[] {
    return this.container(MODELS)
  }

  protected modelBrandIcon(provider: HyperstrateServerInternalModulesAiDomainProvider, size: Size = Size.SM): VueComponent | undefined {
    if (!provider) return undefined
    return this.modelBrands.find((b) => b.name === provider)?.icons?.[size]
  }
}
