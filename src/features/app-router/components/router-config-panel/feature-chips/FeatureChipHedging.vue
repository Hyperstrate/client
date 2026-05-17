<template lang="pug">
div(class="flex items-center gap-2 px-3 py-2.5 cursor-grab active:cursor-grabbing")
  slot(name="drag-handle")
  div(class="w-1.5 h-1.5 rounded-full shrink-0" :class="feature.isEnabled ? 'bg-purple-500' : 'bg-gray-300'")
  div(class="flex-1 min-w-0")
    p(class="text-xs font-medium text-gray-800 truncate") {{ label }}
    p(v-if="subtitle" class="text-xs text-gray-400 truncate") {{ subtitle }}
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
export default class FeatureChipHedging extends Vue {
  @StringProp(true)
  public readonly label!: string

  @RequiredProp()
  public readonly feature!: RouterFeature

  public get subtitle(): string | undefined {
    const cfg = routerFeatureConfig<FT.FeatureHedging>(this.feature)
    const check = cfg.quality_check
    const timeout = cfg.timeout_ms
    const parts: string[] = []
    if (check && check !== 'any') parts.push(check.replace('_', ' '))
    if (timeout) parts.push(`${timeout}ms timeout`)
    return parts.length ? parts.join(' · ') : undefined
  }
}
</script>
