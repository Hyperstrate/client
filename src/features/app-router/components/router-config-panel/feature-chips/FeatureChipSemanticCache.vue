<template lang="pug">
div(class="flex items-center gap-2 px-3 py-2.5 cursor-grab active:cursor-grabbing")
  slot(name="drag-handle")
  div(class="w-1.5 h-1.5 rounded-full shrink-0" :class="feature.isEnabled ? 'bg-purple-500' : 'bg-gray-300'")
  div(class="flex-1 min-w-0")
    p(class="text-xs font-medium text-gray-800 truncate") {{ label }}
    p(v-if="embeddingModel" class="text-xs text-gray-400 truncate") via {{ embeddingModel }}
    p(v-if="ttl" class="text-xs text-gray-400 truncate")
      span(class="font-numeric tabular-nums") {{ ttl }}s
      |
      | TTL
  slot(name="actions")
</template>

<script lang="ts">
import {
  HyperstrateServerInternalModulesRouterApplicationRouterFeatureResponse,
  HyperstrateServerInternalModulesRouterDomainRouterFeatureType as FT,
} from '@/__generated__/hyperstrate-api'
import { Component, Vue } from 'vue-facing-decorator'
import { ObjectProp, RequiredProp, StringProp } from '@/util/prop-decorators'
import { routerFeatureConfig } from '@/features/app-router/feature-config'

type RouterFeature = HyperstrateServerInternalModulesRouterApplicationRouterFeatureResponse

@Component
export default class FeatureChipSemanticCache extends Vue {
  @StringProp(true)
  public readonly label!: string

  @RequiredProp()
  public readonly feature!: RouterFeature

  @ObjectProp(() => ({}))
  public readonly modelDisplayNameMap!: Record<string, string>

  public get embeddingModel(): string | undefined {
    const id = routerFeatureConfig<FT.FeatureSemanticCache>(this.feature).model_id
    return id ? this.modelDisplayNameMap[id] || id : undefined
  }

  public get ttl(): number | undefined {
    return routerFeatureConfig<FT.FeatureSemanticCache>(this.feature).ttl_seconds
  }
}
</script>
