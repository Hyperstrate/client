<template lang="pug">
div(class="bg-white rounded-xl border shadow-xs min-w-[185px] overflow-hidden" :class="data.target.isEnabled ? 'border-gray-200' : 'border-gray-100'")
  handle(type="target" :position="Position.Left")
  div(class="flex items-center gap-2.5 px-3 py-2.5")
    //- Provider icon with status indicator overlay
    ui-indicator(:variant="data.target.isEnabled ? Variant.Green : Variant.Gray" :size="Size.XS")
      template(#content)
        div(class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors" :class="data.target.isEnabled ? 'bg-gray-100' : 'bg-gray-50'")
          ui-icon(v-if="modelBrandIcon(data.provider)" :icon="modelBrandIcon(data.provider)" :size="14" class="text-gray-500")
          span(v-else class="text-xs font-bold text-gray-400") M
      template(#default)
        span

    //- Model info
    div(class="min-w-0 flex-1 flex flex-col gap-0.5")
      ui-tooltip(:content="data.target.modelId")
        span(class="text-xs font-semibold truncate block" :class="data.target.isEnabled ? 'text-gray-800' : 'text-gray-400'") {{ displayName }}
      span(v-if="data.modelDefinitionKey" class="text-xs font-mono text-gray-400 truncate") {{ data.modelDefinitionKey }}

    //- Strategy badge
    ui-badge(v-if="badge" :variant="data.target.isEnabled ? Variant.Green : Variant.Gray" :size="Size.SM") {{ badge }}
</template>

<script lang="ts">
import {
  HyperstrateServerInternalModulesAiDomainProvider,
  InternalModulesRouterInterfacesHttpRouterTargetResponse,
  HyperstrateServerInternalModulesRouterDomainRoutingStrategy,
} from '@/__generated__/hyperstrate-api'
import { Variant, Size } from '@/features/ui/clickables/model'
import ModelsMixin from '@/features/core/components/mixins/models.mixin'
import { Handle, Position } from '@vue-flow/core'
import { Component } from 'vue-facing-decorator'
import { RequiredProp } from '@/util/prop-decorators'

type TargetNodeData = {
  target: InternalModulesRouterInterfacesHttpRouterTargetResponse
  strategy: HyperstrateServerInternalModulesRouterDomainRoutingStrategy
  modelDefinitionKey: string
  modelDisplayName: string
  provider: HyperstrateServerInternalModulesAiDomainProvider
}

const S = HyperstrateServerInternalModulesRouterDomainRoutingStrategy

@Component({ components: { Handle } })
export default class TargetNode extends ModelsMixin {
  public readonly Position = Position
  public readonly Variant = Variant
  public readonly Size = Size

  @RequiredProp()
  public readonly data!: TargetNodeData

  public get displayName(): string {
    return this.data.modelDisplayName || this.data.target.modelId || '—'
  }

  public get badge(): string | undefined {
    const { strategy, target } = this.data
    if (strategy === S.RoutingStrategyWeighted) return `w${target.weight ?? 1}`
    if (strategy === S.RoutingStrategyPercentage) return `${target.percentage ?? 0}%`
    if (strategy === S.RoutingStrategyFailover) return `p${target.priority ?? 0}`
    return undefined
  }
}
</script>
