<template lang="pug">
div(class="flex flex-col gap-4 px-6 py-5 overflow-y-auto max-h-[520px]")
  div(v-for="group in featureGroups" :key="group.label" class="flex flex-col gap-1.5")
    ui-overline {{ group.label }}
    div(class="grid grid-cols-2 gap-2")
      ui-clickable(
        v-for="ft in group.features"
        :key="ft.value"
        tag="button"
        type="button"
        class="text-left rounded-xl border px-3 py-2.5 flex items-start gap-3 transition-all hover:border-purple-300 hover:shadow-xs focus:outline-hidden focus:ring-2 focus:ring-purple-400 focus:ring-offset-1"
        :class="featureType === ft.value ? 'border-purple-400 bg-purple-50/60 ring-1 ring-purple-400' : 'border-gray-200 bg-white hover:bg-purple-50/20'"
        @click="onSelect(ft.value)"
      )
        div(class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" :class="ft.iconClass")
          ui-icon(:icon="ft.icon" :size="15")
        div(class="flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5")
          div(class="flex items-center gap-1.5")
            span(class="text-xs font-semibold text-gray-900 leading-tight") {{ ft.label }}
            span(v-if="!hasConfig(ft.value)" class="shrink-0 rounded px-1 py-px text-[10px] font-medium leading-none bg-gray-100 text-gray-400") instant
          span(class="text-xs text-gray-400 leading-relaxed") {{ ft.description }}
</template>

<script lang="ts">
import { HyperstrateServerInternalModulesRouterDomainRouterFeatureType } from '@/__generated__/hyperstrate-api'
import StepMixin from '@/features/ui/stepper/step.mixin'
import { Mixins } from '@/util/mixin'
import { StringProp } from '@/util/prop-decorators'
import { Component } from 'vue-facing-decorator'
import { FEATURE_TYPE_OPTIONS, type TypeOption } from '../../model'

const FT = HyperstrateServerInternalModulesRouterDomainRouterFeatureType

const NO_CONFIG_TYPES = new Set([
  FT.FeatureFallback,
  FT.FeatureHealthCheck,
  FT.FeaturePromptCaching,
  FT.FeatureTokenCostOptimization,
  FT.FeaturePromptOptimizer,
])

type FeatureOption = TypeOption<HyperstrateServerInternalModulesRouterDomainRouterFeatureType>

const FEATURE_GROUPS: Array<{ label: string; features: FeatureOption[] }> = [
  {
    label: 'Context',
    features: FEATURE_TYPE_OPTIONS.filter((o) =>
      [
        FT.FeatureTokenOptimization,
        FT.FeatureContextTrimming,
        FT.FeatureTokenCostOptimization,
        FT.FeaturePromptOptimizer,
        FT.FeatureContextCompression,
      ].includes(o.value),
    ),
  },
  {
    label: 'Rollout',
    features: FEATURE_TYPE_OPTIONS.filter((o) => [FT.FeaturePromptPolicyRollout].includes(o.value)),
  },
  {
    label: 'Caching',
    features: FEATURE_TYPE_OPTIONS.filter((o) => [FT.FeatureResponseCache, FT.FeatureSemanticCache, FT.FeaturePromptCaching].includes(o.value)),
  },
  {
    label: 'Resilience',
    features: FEATURE_TYPE_OPTIONS.filter((o) => [FT.FeatureRetry, FT.FeatureFallback, FT.FeatureHealthCheck, FT.FeatureRequestCoalescing].includes(o.value)),
  },
  {
    label: 'Traffic & Cost',
    features: FEATURE_TYPE_OPTIONS.filter((o) => [FT.FeatureRateLimit, FT.FeatureBudget, FT.FeatureCostAwareRouting].includes(o.value)),
  },
  {
    label: 'Quality',
    features: FEATURE_TYPE_OPTIONS.filter((o) =>
      [FT.FeatureQualityGate, FT.FeatureHedging, FT.FeatureStructuredOutput, FT.FeatureResponseFingerprinting].includes(o.value),
    ),
  },
  {
    label: 'Intelligence',
    features: FEATURE_TYPE_OPTIONS.filter((o) => [FT.FeatureMCPTools, FT.FeatureSemanticMemory, FT.FeatureResponsePrefetch].includes(o.value)),
  },
]

type FeatureSelectedEmits = { (e: 'feature-selected', type: HyperstrateServerInternalModulesRouterDomainRouterFeatureType): void; (e: string): void }

@Component
export default class FeatureSelectStep extends Mixins(StepMixin) {
  public readonly featureGroups = FEATURE_GROUPS

  @StringProp()
  public readonly featureType?: string

  declare public $emit: FeatureSelectedEmits

  public hasConfig(type: HyperstrateServerInternalModulesRouterDomainRouterFeatureType): boolean {
    return !NO_CONFIG_TYPES.has(type)
  }

  public onSelect(type: HyperstrateServerInternalModulesRouterDomainRouterFeatureType): void {
    this.$emit('feature-selected', type)
    this.next()
  }
}
</script>
