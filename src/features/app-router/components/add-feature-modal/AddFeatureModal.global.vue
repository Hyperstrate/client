<template lang="pug">
ui-modal(ref="modalRef")
  template(#trigger="props")
    slot(name="trigger" v-bind="props")

  template(#default)
    ui-stepper(
      :initial-config="stepperConfig"
      :router-id="routerId"
      :targets="targets"
      :feature-type="selectedFeatureType"
      class="flex flex-col"
      @feature-selected="onFeatureSelected"
      @added="onAdded"
    )
      template(#header="{ currentStep, previous }")
        //- Step 1 header
        div(v-if="currentStep === 1" class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100")
          div(class="flex flex-col gap-0.5")
            h2(class="text-base font-semibold text-gray-900") Add Pipeline Feature
            p(class="text-sm text-gray-500 mt-0.5") Select a feature to attach to this router
          ui-button(:variant="Variant.Gray" :size="Size.SM" @click="close") Cancel

        //- Step 2 header
        div(v-else class="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100")
          ui-clickable(
            tag="button"
            class="w-7 h-7 items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 shrink-0 transition-colors"
            @click="previous"
          )
            ui-icon(icon="arrow-left" :size="16")
          div(class="flex flex-col gap-0.5 flex-1 min-w-0")
            h2(class="text-sm font-semibold text-gray-900") {{ selectedOption?.label }}
            p(class="text-xs text-gray-400 line-clamp-1") {{ selectedOption?.description }}
</template>

<script lang="ts">
import {
  HyperstrateServerInternalModulesRouterApplicationRouterFeatureResponse,
  HyperstrateServerInternalModulesRouterDomainRouterFeatureType,
  InternalModulesRouterInterfacesHttpRouterTargetResponse,
} from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import Modal from '@/features/ui/modal/Modal.global.vue'
import { Mixins } from '@/util/mixin'
import { Variant, Size } from '@/features/ui/clickables/model'
import { markRaw } from 'vue'
import { Component, Ref } from 'vue-facing-decorator'
import { ArrayProp, StringProp } from '@/util/prop-decorators'
import { FEATURE_TYPE_OPTIONS } from '../../model'
import FeatureSelectStep from './FeatureSelectStep.vue'
import FeatureConfigureStep from './FeatureConfigureStep.vue'

type RouterTarget = InternalModulesRouterInterfacesHttpRouterTargetResponse
const FT = HyperstrateServerInternalModulesRouterDomainRouterFeatureType

type AddFeatureModalEmits = {
  (e: 'added', value: HyperstrateServerInternalModulesRouterApplicationRouterFeatureResponse): void
  (e: string): void
}

interface StepperConfig {
  steps: Array<{ name: string; component: unknown }>
}

@Component
export default class AddFeatureModal extends Mixins(ApiClientsMixin) {
  public Variant = Variant
  public Size = Size

  @StringProp(true)
  public readonly routerId!: string

  @ArrayProp(() => [])
  public readonly targets!: RouterTarget[]

  @Ref()
  public readonly modalRef!: Modal

  declare public $emit: AddFeatureModalEmits

  public selectedFeatureType?: HyperstrateServerInternalModulesRouterDomainRouterFeatureType

  public get stepperConfig(): StepperConfig {
    return {
      steps: [
        { name: 'Select type', component: markRaw(FeatureSelectStep) },
        { name: 'Configure', component: markRaw(FeatureConfigureStep) },
      ],
    }
  }

  public get selectedOption(): (typeof FEATURE_TYPE_OPTIONS)[number] | undefined {
    return FEATURE_TYPE_OPTIONS.find((o) => o.value === this.selectedFeatureType)
  }

  public onFeatureSelected(type: HyperstrateServerInternalModulesRouterDomainRouterFeatureType): void {
    this.selectedFeatureType = type
  }

  public onAdded(feature: HyperstrateServerInternalModulesRouterApplicationRouterFeatureResponse): void {
    this.$emit('added', feature)
    this.close()
  }

  public open(): void {
    this.modalRef?.open()
  }

  public close(): void {
    this.modalRef?.close()
  }
}
</script>
