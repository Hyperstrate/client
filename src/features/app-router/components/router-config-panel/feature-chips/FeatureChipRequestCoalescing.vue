<template lang="pug">
div(class="flex items-center gap-2 px-3 py-2.5 cursor-grab active:cursor-grabbing")
  slot(name="drag-handle")
  div(class="w-1.5 h-1.5 rounded-full shrink-0" :class="feature.isEnabled ? 'bg-purple-500' : 'bg-gray-300'")
  div(class="flex-1 min-w-0")
    p(class="text-xs font-medium text-gray-800 truncate") {{ label }}
    p(class="text-xs text-gray-400 truncate") {{ subtitle }}
  slot(name="actions")
</template>

<script lang="ts">
import {
  HyperstrateServerInternalModulesRouterApplicationRouterFeatureResponse,
  HyperstrateServerInternalModulesRouterDomainRouterFeatureType as FT,
} from '@/__generated__/hyperstrate-api'
import { Component, Vue } from 'vue-facing-decorator'
import { RequiredProp, StringProp } from '@/util/prop-decorators'
import { routerFeatureConfig } from '@/features/app-router/feature-config'

type RouterFeature = HyperstrateServerInternalModulesRouterApplicationRouterFeatureResponse

@Component
export default class FeatureChipRequestCoalescing extends Vue {
  @StringProp(true)
  public readonly label!: string

  @RequiredProp()
  public readonly feature!: RouterFeature

  public get subtitle(): string {
    const cfg = routerFeatureConfig<FT.FeatureRequestCoalescing>(this.feature)
    const ms = cfg.window_ms
    const max = cfg.max_waiters
    const parts: string[] = []
    if (ms !== undefined && ms > 0) parts.push(`${ms}ms window`)
    if (max !== undefined && max > 0) parts.push(`max ${max} waiters`)
    return parts.length ? parts.join(' · ') : 'default settings'
  }
}
</script>
