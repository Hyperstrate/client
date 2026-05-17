<template lang="pug">
div(class="flex-1 min-w-0")
  p(class="text-xs font-medium text-gray-800 truncate") {{ label }}
  p(v-if="serverCount > 0" class="text-xs text-gray-400 truncate")
    span(class="font-numeric tabular-nums") {{ serverCount }}
    |
    | server{{ serverCount !== 1 ? 's' : '' }} configured
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
export default class FeatureChipMCPTools extends Vue {
  @StringProp(true)
  public readonly label!: string

  @RequiredProp()
  public readonly feature!: RouterFeature

  public get serverCount(): number {
    const ids = routerFeatureConfig<FT.FeatureMCPTools>(this.feature).server_ids
    return ids?.length ?? 0
  }
}
</script>
