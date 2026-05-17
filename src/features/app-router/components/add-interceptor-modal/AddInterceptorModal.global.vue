<template lang="pug">
ui-modal(ref="modalRef")
  template(#trigger="props")
    slot(name="trigger" v-bind="props")

  template(#default)
    ui-stepper(
      :initial-config="stepperConfig"
      :router-id="routerId"
      :selected-type="selectedType"
      :targets="targets"
      class="flex flex-col"
      @interceptor-selected="onInterceptorSelected"
      @added="onAdded"
    )
      template(#header="{ currentStep, previous }")
        //- Step 1 header
        div(v-if="currentStep === 1" class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100")
          div(class="flex flex-col gap-0.5")
            h2(class="text-base font-semibold text-gray-900") Add Interceptor
            p(class="text-sm text-gray-500 mt-0.5") Interceptors run before target selection on every request
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
  HyperstrateServerInternalModulesRouterApplicationRouterInterceptorResponse,
  HyperstrateServerInternalModulesRouterDomainRouterInterceptorType,
} from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import Modal from '@/features/ui/modal/Modal.global.vue'
import { Mixins } from '@/util/mixin'
import { Variant, Size } from '@/features/ui/clickables/model'
import { markRaw } from 'vue'
import { Component, Ref } from 'vue-facing-decorator'
import { ArrayProp, StringProp } from '@/util/prop-decorators'
import type { InternalModulesRouterInterfacesHttpRouterTargetResponse as RouterTarget } from '@/__generated__/hyperstrate-api'
import { INTERCEPTOR_TYPE_OPTIONS } from '../../model'
import InterceptorSelectStep from './InterceptorSelectStep.vue'
import InterceptorConfigureStep from './InterceptorConfigureStep.vue'

// Re-export so EditInterceptorModal keeps its existing import path
export { AddInterceptorFormData } from './form-data'

type AddInterceptorModalEmits = {
  (e: 'added', value: HyperstrateServerInternalModulesRouterApplicationRouterInterceptorResponse): void
  (e: string): void
}

interface StepperConfig {
  steps: Array<{ name: string; component: unknown }>
}

@Component
export default class AddInterceptorModal extends Mixins(ApiClientsMixin) {
  public Variant = Variant
  public Size = Size

  @StringProp(true)
  public readonly routerId!: string

  @ArrayProp(() => [])
  public readonly targets!: RouterTarget[]

  @Ref()
  public readonly modalRef!: Modal

  declare public $emit: AddInterceptorModalEmits

  public selectedType?: HyperstrateServerInternalModulesRouterDomainRouterInterceptorType

  public get stepperConfig(): StepperConfig {
    return {
      steps: [
        { name: 'Select type', component: markRaw(InterceptorSelectStep) },
        { name: 'Configure', component: markRaw(InterceptorConfigureStep) },
      ],
    }
  }

  public get selectedOption(): (typeof INTERCEPTOR_TYPE_OPTIONS)[number] | undefined {
    return INTERCEPTOR_TYPE_OPTIONS.find((o) => o.value === this.selectedType)
  }

  public onInterceptorSelected(type: HyperstrateServerInternalModulesRouterDomainRouterInterceptorType): void {
    this.selectedType = type
  }

  public onAdded(interceptor: HyperstrateServerInternalModulesRouterApplicationRouterInterceptorResponse): void {
    this.$emit('added', interceptor)
    this.close()
  }

  public open(): void {
    this.modalRef?.open()
  }

  public close(): void {
    this.selectedType = undefined
    this.modalRef.close()
  }
}
</script>
