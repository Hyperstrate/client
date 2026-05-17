<template lang="pug">
div(class="bg-white rounded-xl border border-blue-200 shadow-xs min-w-[220px] overflow-hidden")
  handle#features-bottom(type="target" :position="Position.Bottom")

  //- Header
  div(class="bg-blue-50 px-3.5 py-2.5 flex items-center gap-2.5")
    div(class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600")
      ui-icon(icon="router" :size="16")
    div(class="min-w-0 flex-1 flex flex-col gap-0.5")
      span(class="text-xs font-bold uppercase tracking-widest text-blue-500") Router
      ui-tooltip(:content="data.router.name")
        span(class="text-sm font-semibold text-gray-900 truncate block") {{ data.router.name }}

  //- Footer
  div(class="px-3.5 py-2 flex items-center gap-2 border-t border-blue-100")
    ui-badge(:dot="true" :variant="statusVariant" :size="Size.SM") {{ statusLabel }}
    div(class="flex-1")
    ui-pill(:variant="Variant.Blue") {{ strategyLabel }}

  handle#right-out(type="source" :position="Position.Right")
</template>

<script lang="ts">
import {
  HyperstrateServerInternalModulesRouterApplicationRouterResponse,
  HyperstrateServerInternalModulesRouterDomainRouterStatus,
  HyperstrateServerInternalModulesRouterDomainRoutingStrategy,
} from '@/__generated__/hyperstrate-api'
import { Variant, Size } from '@/features/ui/clickables/model'
import { Handle, Position } from '@vue-flow/core'
import { Component, Vue } from 'vue-facing-decorator'
import { RequiredProp } from '@/util/prop-decorators'

const RS = HyperstrateServerInternalModulesRouterDomainRouterStatus
const Strategy = HyperstrateServerInternalModulesRouterDomainRoutingStrategy

@Component({ components: { Handle } })
export default class RouterNode extends Vue {
  public readonly Position = Position
  public readonly Variant = Variant
  public readonly Size = Size

  @RequiredProp()
  public readonly data!: {
    router: HyperstrateServerInternalModulesRouterApplicationRouterResponse
  }

  public get statusVariant(): Variant {
    const s = this.data.router.status
    if (s === RS.RouterStatusActive) return Variant.Green
    if (s === RS.RouterStatusDraft) return Variant.Orange
    return Variant.Gray
  }

  public get statusLabel(): string {
    const s = this.data.router.status
    if (s === RS.RouterStatusActive) return 'Active'
    if (s === RS.RouterStatusDraft) return 'Draft'
    return 'Inactive'
  }

  public get strategyLabel(): string {
    const map: Record<string, string> = {
      [Strategy.RoutingStrategyRoundRobin]: 'Round Robin',
      [Strategy.RoutingStrategyWeighted]: 'Weighted',
      [Strategy.RoutingStrategyPercentage]: 'Percentage',
      [Strategy.RoutingStrategyFailover]: 'Failover',
      [Strategy.RoutingStrategyRandom]: 'Random',
      [Strategy.RoutingStrategyLatencyBased]: 'Latency',
    }
    const s = this.data.router.strategy
    return s ? (map[s] ?? s) : '—'
  }
}
</script>
