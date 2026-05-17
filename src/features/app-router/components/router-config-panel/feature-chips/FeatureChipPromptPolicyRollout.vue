<template lang="pug">
div(class="flex items-center gap-2 px-3 py-2.5 cursor-grab active:cursor-grabbing")
  slot(name="drag-handle")
  div(class="w-1.5 h-1.5 rounded-full shrink-0" :class="feature.isEnabled ? 'bg-purple-500' : 'bg-gray-300'")
  div(class="flex-1 min-w-0")
    p(class="text-xs font-medium text-gray-800 truncate") {{ label }}
    p(class="text-xs text-gray-400 truncate") {{ variantSummary }}
  slot(name="actions")
</template>

<script lang="ts">
import {
  HyperstrateServerInternalModulesRouterApplicationRouterFeatureResponse,
  HyperstrateServerInternalModulesRouterDomainRouterFeatureType as FT,
} from '@/__generated__/hyperstrate-api'
import { routerFeatureConfig } from '@/features/app-router/feature-config'
import { RequiredProp, StringProp } from '@/util/prop-decorators'
import { Component, Vue } from 'vue-facing-decorator'

type RouterFeature = HyperstrateServerInternalModulesRouterApplicationRouterFeatureResponse

@Component
export default class FeatureChipPromptPolicyRollout extends Vue {
  @StringProp(true)
  public readonly label!: string

  @RequiredProp()
  public readonly feature!: RouterFeature

  public get variantSummary(): string {
    const variants = routerFeatureConfig<FT.FeaturePromptPolicyRollout>(this.feature).variants ?? []
    if (!variants.length) return 'No variants configured'
    const total = variants.reduce((sum, variant) => sum + Number(variant.percentage ?? 0), 0)
    return `${variants.length} variant${variants.length === 1 ? '' : 's'} · ${total}% traffic`
  }
}
</script>
