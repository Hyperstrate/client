<template lang="pug">
div(class="p-4 flex flex-col gap-3")
  div(class="flex items-center justify-between")
    ui-overline Features
    app-router-add-feature-modal(v-if="!hideAdd" :router-id="routerId" :targets="targets" @added="$emit('added', $event)")
      template(#trigger)
        ui-button(:size="Size.SM")
          ui-icon(icon="plus" :size="12")
          | Add
  ui-empty-state(v-if="!features.length" heading="No features yet" subheading="Features run in the pipeline before forwarding.")
  ui-draggable-list(:items="features" key-by="id" class="grid gap-2" @reorder="onReorder")
    template(#default="{ item: feature }")
      div(class="flex flex-col rounded-lg border border-gray-200 bg-white overflow-hidden")
        component(
          :is="featureChipComponent(feature)"
          :feature="feature"
          :label="featureLabel(feature.featureType)"
          :router-id="routerId"
          :model-display-name-map="modelDisplayNameMap"
        )
          template(#drag-handle)
            ui-icon(icon="drag-handle" :size="16" class="text-gray-300 shrink-0")
          template(#actions)
            ui-dropdown(align="end")
              template(#trigger)
                ui-icon-button(icon="dots-horizontal" :icon-size="16" :size="Size.SM" :variant="Variant.Gray" :square="true")
              template(#content="{ close }")
                div(class="p-1 flex flex-col")
                  app-router-edit-feature-modal(:feature="feature" :router-id="routerId" :targets="targets" @updated="$emit('updated', $event)")
                    template(#trigger)
                      ui-clickable(
                        tag="button"
                        class="flex items-center gap-2 w-full px-3 py-2 text-xs text-left text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                      ) Edit
                  ui-clickable(
                    tag="button"
                    class="flex items-center gap-2 w-full px-3 py-2 text-xs text-left text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    @click.stop="toggle(feature), close()"
                  ) {{ feature.isEnabled ? 'Disable' : 'Enable' }}
                  ui-divider
                  domain-ui-confirm-delete-modal(
                    :name="featureLabel(feature.featureType)"
                    description="This feature will be removed from the pipeline."
                    @confirm="remove(feature.id)"
                  )
                    template(#trigger)
                      ui-clickable(
                        tag="button"
                        class="flex items-center gap-2 w-full px-3 py-2 text-xs text-leHyperstrateServerInternalModulesRouterDomainRouterFeatureType text-red-600 rounded-md hover:bg-red-50 transition-colors"
                      ) Remove
</template>

<script lang="ts">
import {
  HyperstrateApi,
  HyperstrateServerInternalModulesRouterApplicationRouterFeatureResponse,
  HyperstrateServerInternalModulesRouterDomainRouterFeatureType,
  InternalModulesRouterInterfacesHttpRouterTargetResponse,
} from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Mixins } from '@/util/mixin'
import { Size, Variant } from '@/features/ui/clickables/model'
import { Component } from 'vue-facing-decorator'
import { ArrayProp, BooleanProp, ObjectProp, StringProp } from '@/util/prop-decorators'
import { type Component as VueComponent } from 'vue'
import { FEATURE_TYPE_OPTIONS } from '../../model'

import FeatureChipDefault from './feature-chips/FeatureChipDefault.vue'
import FeatureChipBudget from './feature-chips/FeatureChipBudget.vue'
import FeatureChipContextCompression from './feature-chips/FeatureChipContextCompression.vue'
import FeatureChipContextTrimming from './feature-chips/FeatureChipContextTrimming.vue'
import FeatureChipCostAwareRouting from './feature-chips/FeatureChipCostAwareRouting.vue'
import FeatureChipHedging from './feature-chips/FeatureChipHedging.vue'
import FeatureChipMCPTools from './feature-chips/FeatureChipMCPTools.vue'
import FeatureChipPromptPolicyRollout from './feature-chips/FeatureChipPromptPolicyRollout.vue'
import FeatureChipQualityGate from './feature-chips/FeatureChipQualityGate.vue'
import FeatureChipRateLimit from './feature-chips/FeatureChipRateLimit.vue'
import FeatureChipRequestCoalescing from './feature-chips/FeatureChipRequestCoalescing.vue'
import FeatureChipResponseCache from './feature-chips/FeatureChipResponseCache.vue'
import FeatureChipResponseFingerprinting from './feature-chips/FeatureChipResponseFingerprinting.vue'
import FeatureChipResponsePrefetch from './feature-chips/FeatureChipResponsePrefetch.vue'
import FeatureChipRetry from './feature-chips/FeatureChipRetry.vue'
import FeatureChipSemanticCache from './feature-chips/FeatureChipSemanticCache.vue'
import FeatureChipSemanticMemory from './feature-chips/FeatureChipSemanticMemory.vue'
import FeatureChipTokenOptimization from './feature-chips/FeatureChipTokenOptimization.vue'

type RouterTarget = InternalModulesRouterInterfacesHttpRouterTargetResponse
type RouterFeature = HyperstrateServerInternalModulesRouterApplicationRouterFeatureResponse
type RouterFeatureType = HyperstrateServerInternalModulesRouterDomainRouterFeatureType

const CHIP_MAP: Partial<Record<RouterFeatureType, VueComponent>> = {
  [HyperstrateServerInternalModulesRouterDomainRouterFeatureType.FeatureTokenOptimization]: FeatureChipTokenOptimization,
  [HyperstrateServerInternalModulesRouterDomainRouterFeatureType.FeatureContextTrimming]: FeatureChipContextTrimming,
  [HyperstrateServerInternalModulesRouterDomainRouterFeatureType.FeatureResponseCache]: FeatureChipResponseCache,
  [HyperstrateServerInternalModulesRouterDomainRouterFeatureType.FeatureSemanticCache]: FeatureChipSemanticCache,
  [HyperstrateServerInternalModulesRouterDomainRouterFeatureType.FeatureRetry]: FeatureChipRetry,
  [HyperstrateServerInternalModulesRouterDomainRouterFeatureType.FeatureRateLimit]: FeatureChipRateLimit,
  [HyperstrateServerInternalModulesRouterDomainRouterFeatureType.FeatureBudget]: FeatureChipBudget,
  [HyperstrateServerInternalModulesRouterDomainRouterFeatureType.FeatureMCPTools]: FeatureChipMCPTools,
  [HyperstrateServerInternalModulesRouterDomainRouterFeatureType.FeaturePromptPolicyRollout]: FeatureChipPromptPolicyRollout,
  [HyperstrateServerInternalModulesRouterDomainRouterFeatureType.FeatureRequestCoalescing]: FeatureChipRequestCoalescing,
  [HyperstrateServerInternalModulesRouterDomainRouterFeatureType.FeatureHedging]: FeatureChipHedging,
  [HyperstrateServerInternalModulesRouterDomainRouterFeatureType.FeatureQualityGate]: FeatureChipQualityGate,
  [HyperstrateServerInternalModulesRouterDomainRouterFeatureType.FeatureContextCompression]: FeatureChipContextCompression,
  [HyperstrateServerInternalModulesRouterDomainRouterFeatureType.FeatureSemanticMemory]: FeatureChipSemanticMemory,
  [HyperstrateServerInternalModulesRouterDomainRouterFeatureType.FeatureCostAwareRouting]: FeatureChipCostAwareRouting,
  [HyperstrateServerInternalModulesRouterDomainRouterFeatureType.FeatureResponsePrefetch]: FeatureChipResponsePrefetch,
  [HyperstrateServerInternalModulesRouterDomainRouterFeatureType.FeatureResponseFingerprinting]: FeatureChipResponseFingerprinting,
}

@Component({ emits: ['added', 'toggled', 'reordered', 'removed', 'updated'] })
export default class RouterFeaturesControl extends Mixins(ApiClientsMixin) {
  public readonly Variant = Variant
  public readonly Size = Size

  @StringProp(true)
  public readonly routerId!: string

  @ArrayProp(() => [])
  public readonly features!: RouterFeature[]

  @ArrayProp(() => [])
  public readonly targets!: RouterTarget[]

  @ObjectProp(() => ({}))
  public readonly modelDisplayNameMap!: Record<string, string>

  @BooleanProp(false)
  public readonly hideAdd!: boolean

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  public featureLabel(type?: RouterFeatureType): string {
    if (!type) return '—'
    return FEATURE_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type
  }

  public featureChipComponent(feature: RouterFeature): VueComponent {
    return CHIP_MAP[feature.featureType] ?? FeatureChipDefault
  }

  public async toggle(feature: RouterFeature): Promise<void> {
    if (!feature.id) return
    const { data: updated } = await this.api.routerIdFeaturesFeatureIdPatch({
      id: this.routerId,
      featureId: feature.id,
      body: { isEnabled: !feature.isEnabled },
    })
    this.$emit('toggled', updated)
  }

  public async onReorder(newOrder: RouterFeature[]): Promise<void> {
    const ordered = newOrder.map((f, i) => ({ ...f, executionOrder: i }))
    const previousOrderById = new Map(this.features.map((feature) => [feature.id, feature.executionOrder ?? 0]))
    const changed = ordered.filter((feature) => feature.id && previousOrderById.get(feature.id) !== feature.executionOrder)

    await Promise.all(
      changed.map((feature) =>
        this.api.routerIdFeaturesFeatureIdPatch({
          id: this.routerId,
          featureId: feature.id,
          body: { executionOrder: feature.executionOrder },
        }),
      ),
    )
    this.$emit('reordered', ordered)
  }

  public async remove(featureId: string | undefined): Promise<void> {
    if (!featureId) return
    await this.api.routerIdFeaturesFeatureIdDelete({ id: this.routerId, featureId })
    this.$emit('removed', featureId)
  }
}
</script>
