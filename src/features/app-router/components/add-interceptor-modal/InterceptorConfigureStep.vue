<template lang="pug">
ui-form(v-slot="{ validated, submit, busy, formData }" :validation="AddInterceptorFormData" :action="doSubmit" no-reset auto-dirty)
  div(class="hidden")
    ui-form-field(path="type" input="ui-input-text" :default-value="selectedType")

  div(class="px-6 py-5 flex flex-col gap-5 overflow-y-auto max-h-[460px]")
    template(v-if="selectedType === IT.InterceptorSemanticClassifier")
      interceptor-semantic-classifier

    template(v-if="selectedType === IT.InterceptorABTest")
      interceptor-ab-test(:form-data="formData" :target-options="targetOptions")

    template(v-if="selectedType === IT.InterceptorContentFilter")
      interceptor-content-filter(:form-data="formData")

    template(v-if="selectedType === IT.InterceptorPIIDetector")
      interceptor-pii-detector

    template(v-if="selectedType === IT.InterceptorPromptGuard")
      interceptor-prompt-guard

    template(v-if="selectedType === IT.InterceptorPromptShield")
      interceptor-prompt-shield

    template(v-if="selectedType === IT.InterceptorTeamBudget")
      interceptor-team-budget

  div(class="flex items-center justify-between gap-2 px-6 py-4 border-t border-gray-100")
    ui-button(type="button" :variant="Variant.Gray" @click="stepper.previous()")
      ui-icon(icon="arrow-left" :size="14")
      | Back
    ui-button(type="button" :disabled="!validated || !isFormReadyFor(formData) || busy" :busy="busy" @click="submit") Add Interceptor
</template>

<script lang="ts">
import {
  HyperstrateApi,
  HyperstrateServerInternalModulesRouterApplicationRouterInterceptorResponse,
  HyperstrateServerInternalModulesRouterDomainRouterInterceptorType,
  InternalModulesRouterInterfacesHttpRouterTargetResponse,
} from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Variant } from '@/features/ui/clickables/model'
import StepMixin from '@/features/ui/stepper/step.mixin'
import { Mixins } from '@/util/mixin'
import { ArrayProp, RequiredProp, StringProp } from '@/util/prop-decorators'
import { splitTrimmedLines } from '@/util/string'
import type { Option } from '@/features/ui/inputs/model'
import { Component } from 'vue-facing-decorator'
import { AddInterceptorFormData } from './form-data'
import InterceptorAbTest from './InterceptorABTest.vue'
import InterceptorContentFilter from './InterceptorContentFilter.vue'
import InterceptorPiiDetector from './InterceptorPIIDetector.vue'
import InterceptorPromptGuard from './InterceptorPromptGuard.vue'
import InterceptorPromptShield from './InterceptorPromptShield.vue'
import InterceptorSemanticClassifier from './InterceptorSemanticClassifier.vue'
import InterceptorTeamBudget from './InterceptorTeamBudget.vue'

const IT = HyperstrateServerInternalModulesRouterDomainRouterInterceptorType
type RouterTarget = InternalModulesRouterInterfacesHttpRouterTargetResponse

type InterceptorConfigureEmits = {
  (e: 'added', value: HyperstrateServerInternalModulesRouterApplicationRouterInterceptorResponse): void
  (e: string): void
}

@Component({
  emits: ['added'],
  components: {
    InterceptorSemanticClassifier,
    InterceptorAbTest,
    InterceptorContentFilter,
    InterceptorPiiDetector,
    InterceptorPromptGuard,
    InterceptorPromptShield,
    InterceptorTeamBudget,
  },
})
export default class InterceptorConfigureStep extends Mixins(ApiClientsMixin, StepMixin) {
  public Variant = Variant
  public IT = IT
  public readonly AddInterceptorFormData = AddInterceptorFormData

  @RequiredProp()
  public readonly selectedType!: HyperstrateServerInternalModulesRouterDomainRouterInterceptorType

  @StringProp(true)
  public readonly routerId!: string

  @ArrayProp(() => [])
  public readonly targets!: RouterTarget[]

  public get targetOptions(): Option<RouterTarget>[] {
    return this.targets.map((t) => ({
      value: t,
      label: t.model?.displayName ?? t.model?.alias ?? t.modelId ?? t.id,
    }))
  }

  declare public $emit: InterceptorConfigureEmits

  public isFormReadyFor(formData: Record<string, unknown>): boolean {
    if (this.selectedType === IT.InterceptorABTest) {
      const variants = formData.abVariants as Array<{ name?: string }> | undefined
      const names = (variants ?? []).map((v) => v.name?.trim()).filter(Boolean) as string[]
      return new Set(names).size === names.length
    }
    if (this.selectedType === IT.InterceptorTeamBudget) {
      return ((formData.teamBudgets as unknown[]) ?? []).length > 0
    }
    if (this.selectedType === IT.InterceptorPromptShield) {
      return !!formData.shieldModelId
    }
    return true
  }

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  public async doSubmit(formData: AddInterceptorFormData): Promise<void> {
    const { data: interceptor } = await this.api.routerIdInterceptorsPost({
      id: this.routerId,
      body: { type: this.selectedType as never, config: this.buildConfig(formData) as Record<string, object> },
    })
    this.$emit('added', interceptor)
  }

  private mid(v: unknown): string {
    return (v as { id?: string } | null | undefined)?.id ?? ''
  }

  // eslint-disable-next-line complexity
  public buildConfig(formData: AddInterceptorFormData): Record<string, unknown> {
    const cfg: Record<string, unknown> = {}
    if (this.selectedType === IT.InterceptorSemanticClassifier) {
      const id = this.mid(formData.modelId)
      if (id) cfg.model_id = id
      if (formData.similarityThreshold) cfg.threshold = Number(formData.similarityThreshold)
    }
    if (this.selectedType === IT.InterceptorABTest) {
      cfg.variants = (formData.abVariants ?? [])
        .filter((v) => v.name?.trim() && v.modelId)
        .map((v) => ({ name: v.name.trim(), model_id: (v.modelId as RouterTarget)?.modelId ?? '', weight: Number(v.weight) || 1 }))
      const pk = formData.abPartitionKey?.trim()
      if (pk) cfg.partition_key = pk
    }
    if (this.selectedType === IT.InterceptorContentFilter) {
      cfg.blocked_patterns = splitTrimmedLines(formData.blockedPatterns)
    }
    if (this.selectedType === IT.InterceptorPIIDetector) cfg.redact = formData.redact ?? false
    if (this.selectedType === IT.InterceptorPromptGuard) cfg.sensitivity = formData.sensitivity ?? 'medium'
    if (this.selectedType === IT.InterceptorPromptShield) {
      cfg.policies = splitTrimmedLines(formData.shieldPolicies)
      const shieldId = this.mid(formData.shieldModelId)
      if (shieldId) cfg.shield_model_id = shieldId
    }
    if (this.selectedType === IT.InterceptorTeamBudget) {
      const budgets: Record<string, unknown> = {}
      for (const tb of (formData.teamBudgets ?? []).filter((t) => t.teamId)) {
        const b: Record<string, unknown> = { max_cost_usd: Number(tb.maxCostUsd) || 0, max_requests: Number(tb.maxRequests) || 0 }
        const overflowId = this.mid(tb.overflowTargetId)
        if (overflowId) b.overflow_target_id = overflowId
        budgets[this.mid(tb.teamId)] = b
      }
      cfg.budgets = budgets
    }
    return cfg
  }
}
</script>
