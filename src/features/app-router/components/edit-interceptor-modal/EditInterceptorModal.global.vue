<template lang="pug">
ui-modal(ref="modalRef")
  template(#trigger="props")
    slot(name="trigger" v-bind="props")

  template(#default)
    div(class="w-full")
      div(class="px-6 pt-6 pb-4 border-b border-gray-100")
        div(class="flex items-center gap-3")
          div(class="flex flex-col gap-0.5 flex-1")
            h2(class="text-base font-semibold text-gray-900") Edit Interceptor
            p(class="text-sm text-gray-500") Update the configuration for this interceptor
          ui-badge(:variant="Variant.Indigo") {{ interceptorLabel }}

      ui-form(
        v-slot="{ validated, submit, busy, formData }"
        :validation="AddInterceptorFormData"
        :action="doSubmit"
        no-reset
        auto-dirty
        :initial-data="initialFormData"
      )
        //- Hidden type field so ValidateIf conditions in the form data class work correctly
        div(class="hidden")
          ui-form-field(path="type" input="ui-input-text" :default-value="interceptor.type")

        div(class="flex flex-col gap-5 px-6 py-5 max-h-[60vh] overflow-y-auto")
          template(v-if="interceptor.type === IT.InterceptorSemanticClassifier")
            interceptor-semantic-classifier(
              :default-model-id="config['model_id']"
              :default-threshold="config['threshold'] !== undefined ? String(config['threshold']) : undefined"
            )

          template(v-if="interceptor.type === IT.InterceptorABTest")
            interceptor-ab-test(
              :form-data="formData"
              :initial-variants="initialABVariants"
              :default-partition-key="config['partition_key']"
              :target-options="targetOptions"
            )

          template(v-if="interceptor.type === IT.InterceptorContentFilter")
            interceptor-content-filter(:form-data="formData" :default-patterns="contentFilterPatterns")

          template(v-if="interceptor.type === IT.InterceptorPIIDetector")
            interceptor-pii-detector(:default-redact="!!config['redact']")

          template(v-if="interceptor.type === IT.InterceptorPromptGuard")
            interceptor-prompt-guard(:default-sensitivity="config['sensitivity'] || 'medium'")

          template(v-if="interceptor.type === IT.InterceptorPromptShield")
            interceptor-prompt-shield(:default-shield-model-id="config['shield_model_id']" :default-policies="shieldPolicies")

          template(v-if="interceptor.type === IT.InterceptorTeamBudget")
            interceptor-team-budget(:initial-budgets="initialTeamBudgets")

        div(class="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100")
          ui-button(type="button" :variant="Variant.Gray" @click="close") Cancel
          ui-button(type="button" :disabled="!validated || !isFormReadyFor(formData) || busy" @click="submit") Save changes
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
import Modal from '@/features/ui/modal/Modal.global.vue'
import { Mixins } from '@/util/mixin'
import { splitTrimmedLines } from '@/util/string'
import { Component, Ref } from 'vue-facing-decorator'
import type { Option } from '@/features/ui/inputs/model'
import { ArrayProp, RequiredProp, StringProp } from '@/util/prop-decorators'
import { INTERCEPTOR_TYPE_OPTIONS } from '../../model'
import { AddInterceptorFormData } from '../add-interceptor-modal/form-data'
import InterceptorAbTest from '../add-interceptor-modal/InterceptorABTest.vue'
import InterceptorContentFilter from '../add-interceptor-modal/InterceptorContentFilter.vue'
import InterceptorPiiDetector from '../add-interceptor-modal/InterceptorPIIDetector.vue'
import InterceptorPromptGuard from '../add-interceptor-modal/InterceptorPromptGuard.vue'
import InterceptorPromptShield from '../add-interceptor-modal/InterceptorPromptShield.vue'
import InterceptorSemanticClassifier from '../add-interceptor-modal/InterceptorSemanticClassifier.vue'
import InterceptorTeamBudget from '../add-interceptor-modal/InterceptorTeamBudget.vue'

type RouterInterceptor = HyperstrateServerInternalModulesRouterApplicationRouterInterceptorResponse
type RouterTarget = InternalModulesRouterInterfacesHttpRouterTargetResponse

type EditInterceptorModalEmits = {
  (e: 'updated', value: RouterInterceptor): void
  (e: string): void
}

@Component({
  emits: ['updated'],
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
export default class EditInterceptorModal extends Mixins(ApiClientsMixin) {
  public Variant = Variant
  public IT = HyperstrateServerInternalModulesRouterDomainRouterInterceptorType
  public readonly AddInterceptorFormData = AddInterceptorFormData

  @RequiredProp()
  public readonly interceptor!: RouterInterceptor

  @StringProp(true)
  public readonly routerId!: string

  @Ref()
  public readonly modalRef!: Modal

  @ArrayProp(() => [])
  public readonly targets!: RouterTarget[]

  declare public $emit: EditInterceptorModalEmits

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  public get config(): Record<string, unknown> {
    return (this.interceptor.config ?? {}) as Record<string, unknown>
  }

  public get interceptorLabel(): string {
    return INTERCEPTOR_TYPE_OPTIONS.find((o) => o.value === this.interceptor.type)?.label ?? this.interceptor.type ?? '—'
  }

  public get initialABVariants(): Array<{ name: string; model_id: string; weight: number }> {
    const raw = this.config['variants']
    if (!Array.isArray(raw)) return []
    return raw as Array<{ name: string; model_id: string; weight: number }>
  }

  public get contentFilterPatterns(): string {
    const raw = this.config['blocked_patterns']
    if (!Array.isArray(raw)) return ''
    return (raw as string[]).join('\n')
  }

  public get shieldPolicies(): string {
    const raw = this.config['policies']
    if (!Array.isArray(raw)) return ''
    return (raw as string[]).join('\n')
  }

  public get initialTeamBudgets(): Array<{ teamId: string; maxCostUsd: string; maxRequests: string; overflowTargetId?: string }> {
    const raw = this.config['budgets'] as Record<string, { max_cost_usd?: number; max_requests?: number; overflow_target_id?: string }> | undefined
    if (!raw) return []
    return Object.entries(raw).map(([teamId, b]) => ({
      teamId,
      maxCostUsd: String(b.max_cost_usd ?? 0),
      maxRequests: String(b.max_requests ?? 0),
      overflowTargetId: b.overflow_target_id,
    }))
  }

  private static readonly SENSITIVITY_OPTIONS = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
  ]

  public get targetOptions(): Option<RouterTarget>[] {
    return this.targets.map((t) => ({
      value: t,
      label: t.model?.displayName ?? t.model?.alias ?? t.modelId ?? t.id,
    }))
  }

  private targetOpt(modelId: string | undefined): Option<RouterTarget> | undefined {
    if (!modelId) return undefined
    return this.targetOptions.find((option) => option.value.modelId === modelId)
  }

  private modelOpt(id: string | undefined): { value: { id: string }; label: string } | undefined {
    if (!id) return undefined
    return { value: { id }, label: id }
  }

  private mid(v: unknown): string {
    return (v as { id?: string } | null | undefined)?.id ?? ''
  }

  private teamOpt(id: string | undefined): { value: { id: string }; label: string } | undefined {
    if (!id) return undefined
    return { value: { id }, label: id }
  }

  public get initialFormData(): Record<string, unknown> {
    const c = this.config
    const IT = HyperstrateServerInternalModulesRouterDomainRouterInterceptorType
    const t = this.interceptor.type
    const base = { type: t }
    const s = (v: unknown): string => {
      if (typeof v === 'string') return v
      if (typeof v === 'number' || typeof v === 'boolean') return String(v)
      return ''
    }

    if (t === IT.InterceptorSemanticClassifier) {
      return {
        ...base,
        modelId: this.modelOpt(c['model_id'] as string | undefined),
        similarityThreshold: s(c['threshold']) || undefined,
      }
    }
    if (t === IT.InterceptorABTest) {
      const variants = (c['variants'] as Array<{ name: string; model_id: string; weight: number }> | undefined) ?? []
      return {
        ...base,
        abPartitionKey: c['partition_key'] as string | undefined,
        abVariants: variants.map((v) => ({ name: v.name, modelId: this.targetOpt(v.model_id), weight: String(v.weight ?? 1) })),
      }
    }
    if (t === IT.InterceptorContentFilter) {
      return { ...base, blockedPatterns: ((c['blocked_patterns'] as string[] | undefined) ?? []).join('\n') }
    }
    if (t === IT.InterceptorPIIDetector) {
      return { ...base, redact: !!c['redact'] }
    }
    if (t === IT.InterceptorPromptGuard) {
      const sens = s(c['sensitivity'] ?? 'medium')
      return { ...base, sensitivity: EditInterceptorModal.SENSITIVITY_OPTIONS.find((o) => o.value === sens) }
    }
    if (t === IT.InterceptorPromptShield) {
      return {
        ...base,
        shieldPolicies: ((c['policies'] as string[] | undefined) ?? []).join('\n'),
        shieldModelId: this.modelOpt(c['shield_model_id'] as string | undefined),
      }
    }
    if (t === IT.InterceptorTeamBudget) {
      const budgets = c['budgets'] as Record<string, { max_cost_usd?: number; max_requests?: number; overflow_target_id?: string }> | undefined
      return {
        ...base,
        teamBudgets: budgets
          ? Object.entries(budgets).map(([teamId, b]) => ({
              teamId: this.teamOpt(teamId),
              maxCostUsd: String(b.max_cost_usd ?? 0),
              maxRequests: String(b.max_requests ?? 0),
              overflowTargetId: this.modelOpt((b as Record<string, unknown>)['overflow_target_id'] as string | undefined),
            }))
          : [],
      }
    }
    return base
  }

  public isFormReadyFor(formData: Record<string, unknown>): boolean {
    if (this.interceptor.type === HyperstrateServerInternalModulesRouterDomainRouterInterceptorType.InterceptorABTest) {
      const variants = formData.abVariants as Array<{ name?: string }> | undefined
      const names = (variants ?? []).map((v) => v.name?.trim()).filter(Boolean) as string[]
      return new Set(names).size === names.length
    }
    if (this.interceptor.type === HyperstrateServerInternalModulesRouterDomainRouterInterceptorType.InterceptorTeamBudget) {
      return ((formData.teamBudgets as unknown[]) ?? []).length > 0
    }
    if (this.interceptor.type === HyperstrateServerInternalModulesRouterDomainRouterInterceptorType.InterceptorPromptShield) {
      return !!formData.shieldModelId
    }
    return true
  }

  public async doSubmit(formData: AddInterceptorFormData): Promise<void> {
    const { data: updated } = await this.api.routerIdInterceptorsInterceptorIdPatch({
      id: this.routerId,
      interceptorId: this.interceptor.id,
      body: { config: this.buildConfig(formData) as Record<string, object> },
    })
    this.$emit('updated', updated)
    this.close()
  }

  // eslint-disable-next-line complexity
  private buildConfig(formData: AddInterceptorFormData): Record<string, unknown> {
    const cfg: Record<string, unknown> = {}
    const IT = HyperstrateServerInternalModulesRouterDomainRouterInterceptorType

    if (this.interceptor.type === IT.InterceptorSemanticClassifier) {
      const scModelId = this.mid(formData.modelId)
      if (scModelId) cfg.model_id = scModelId
      if (formData.similarityThreshold) cfg.threshold = Number(formData.similarityThreshold)
    }
    if (this.interceptor.type === IT.InterceptorABTest) {
      cfg.variants = (formData.abVariants ?? [])
        .filter((v) => v.name?.trim() && v.modelId)
        .map((v) => ({ name: v.name.trim(), model_id: (v.modelId as RouterTarget)?.modelId ?? '', weight: Number(v.weight) || 1 }))
      const pk = formData.abPartitionKey?.trim()
      if (pk) cfg.partition_key = pk
    }
    if (this.interceptor.type === IT.InterceptorContentFilter) {
      cfg.blocked_patterns = splitTrimmedLines(formData.blockedPatterns)
    }
    if (this.interceptor.type === IT.InterceptorPIIDetector) {
      cfg.redact = formData.redact ?? false
    }
    if (this.interceptor.type === IT.InterceptorPromptGuard) {
      cfg.sensitivity = formData.sensitivity ?? 'medium'
    }
    if (this.interceptor.type === IT.InterceptorPromptShield) {
      cfg.policies = splitTrimmedLines(formData.shieldPolicies)
      const shieldId = this.mid(formData.shieldModelId)
      if (shieldId) cfg.shield_model_id = shieldId
    }
    if (this.interceptor.type === IT.InterceptorTeamBudget) {
      const budgets: Record<string, unknown> = {}
      for (const tb of (formData.teamBudgets ?? []).filter((t) => t.teamId)) {
        const b: Record<string, unknown> = {
          max_cost_usd: Number(tb.maxCostUsd) || 0,
          max_requests: Number(tb.maxRequests) || 0,
        }
        const overflowId = this.mid(tb.overflowTargetId)
        if (overflowId) b.overflow_target_id = overflowId
        budgets[this.mid(tb.teamId)] = b
      }
      cfg.budgets = budgets
    }
    return cfg
  }

  public close(): void {
    this.modalRef.close()
  }
}
</script>
