<template lang="pug">
div(class="flex flex-col gap-4 px-6 py-5 overflow-y-auto max-h-[480px]")
  div(v-for="group in interceptorGroups" :key="group.label" class="flex flex-col gap-1.5")
    ui-overline {{ group.label }}
    div(class="grid grid-cols-2 gap-2")
      ui-clickable(
        v-for="it in group.interceptors"
        :key="it.value"
        tag="button"
        type="button"
        class="text-left rounded-xl border px-3 py-2.5 flex items-start gap-3 transition-all hover:border-indigo-300 hover:shadow-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1"
        :class="selectedType === it.value ? 'border-indigo-400 bg-indigo-50/60 ring-1 ring-indigo-400' : 'border-gray-200 bg-white hover:bg-indigo-50/20'"
        @click="onSelect(it.value)"
      )
        div(class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" :class="it.iconClass")
          ui-icon(:icon="it.icon" :size="15")
        div(class="flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5")
          span(class="text-xs font-semibold text-gray-900 leading-tight") {{ it.label }}
          span(class="text-xs text-gray-400 leading-relaxed") {{ it.description }}
</template>

<script lang="ts">
import { HyperstrateServerInternalModulesRouterDomainRouterInterceptorType } from '@/__generated__/hyperstrate-api'
import StepMixin from '@/features/ui/stepper/step.mixin'
import { Mixins } from '@/util/mixin'
import { StringProp } from '@/util/prop-decorators'
import { Component } from 'vue-facing-decorator'
import { INTERCEPTOR_TYPE_OPTIONS, type TypeOption } from '../../model'

type InterceptorType = HyperstrateServerInternalModulesRouterDomainRouterInterceptorType
type InterceptorOption = TypeOption<InterceptorType>
const IT = HyperstrateServerInternalModulesRouterDomainRouterInterceptorType

const INTERCEPTOR_GROUPS: Array<{ label: string; interceptors: InterceptorOption[] }> = [
  {
    label: 'Routing',
    interceptors: INTERCEPTOR_TYPE_OPTIONS.filter((o) => [IT.InterceptorSemanticClassifier, IT.InterceptorABTest].includes(o.value)),
  },
  {
    label: 'Safety',
    interceptors: INTERCEPTOR_TYPE_OPTIONS.filter((o) =>
      [IT.InterceptorContentFilter, IT.InterceptorPIIDetector, IT.InterceptorPromptGuard, IT.InterceptorPromptShield].includes(o.value),
    ),
  },
  {
    label: 'Traffic',
    interceptors: INTERCEPTOR_TYPE_OPTIONS.filter((o) => [IT.InterceptorTeamBudget].includes(o.value)),
  },
]

type InterceptorSelectedEmits = { (e: 'interceptor-selected', type: InterceptorType): void; (e: string): void }

@Component
export default class InterceptorSelectStep extends Mixins(StepMixin) {
  public readonly interceptorGroups = INTERCEPTOR_GROUPS

  @StringProp()
  public readonly selectedType?: string

  declare public $emit: InterceptorSelectedEmits

  public onSelect(type: InterceptorType): void {
    this.$emit('interceptor-selected', type)
    this.next()
  }
}
</script>
