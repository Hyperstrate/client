<template lang="pug">
ui-modal(ref="modalRef")
  template(#trigger="props")
    slot(name="trigger" v-bind="props")

  template(#default)
    div(class="w-full")
      div(class="px-6 pt-6 pb-4 border-b border-gray-100")
        div(class="flex flex-col gap-0.5")
          h2(class="text-base font-semibold text-gray-900") Add Test Case
          p(class="text-sm text-gray-500") Define an input and expected output to score against

      ui-form(
        v-slot="{ validated, submit, busy, formData }"
        :validation="AddEvaluationCaseFormData"
        :action="doSubmit"
        no-reset
        :initial-data="initialFormData"
      )
        div(class="px-6 py-5 flex flex-col gap-4 max-h-[60vh] overflow-y-auto")
          ui-form-field(ref="fieldsFormField" input="ui-input-key-value" path="fields" :input-props="{ keyPlaceholder: 'Field name' }")
            template(#label)
              div(class="flex items-center justify-between mb-1")
                ui-label Input fields
                ui-button(type="button" :size="Size.SM" :variant="Variant.Gray" @click="addField")
                  ui-icon(icon="plus" :size="11")
                  | Field
            template(#inputActions="slotProps")
              ui-icon-button(icon="close" :variant="Variant.Gray" :size="Size.SM" :icon-size="12" @click="slotProps['on-remove']()")

          ui-form-field(input="ui-input-textarea" path="expected" label="Expected output" placeholder="The response should contain…" required)

          div(class="grid grid-cols-2 gap-3")
            ui-form-field(input="ui-input-select" path="scoreMethod" label="Scoring method" :input-props="{ options: scoreMethodOptions }")
            ui-form-field(input="ui-input-text" path="description" label="Description" placeholder="Optional note")

          div(v-if="isLLMScoringForm(formData)" class="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2")
            p(class="text-xs text-amber-700") LLM judge compares the router response against this expected output. Select a registered judge model before running the evaluation.
          div(v-if="isAgentTaskScoringForm(formData)" class="rounded-lg border border-indigo-100 bg-indigo-50/50 px-3 py-3 flex flex-col gap-3")
            div(class="grid grid-cols-2 gap-3")
              ui-form-field(input="ui-input-textarea" path="agentContains" label="Must contain" placeholder="test passed\nfixed" :input-props="{ rows: 3 }")
              ui-form-field(input="ui-input-textarea" path="agentNotContains" label="Must not contain" placeholder="panic\nfailed" :input-props="{ rows: 3 }")
              ui-form-field(input="ui-input-text" path="agentMinToolCalls" label="Min tool calls" placeholder="0")
              ui-form-field(input="ui-input-text" path="agentMaxCostUsd" label="Max cost USD" placeholder="0")
              ui-form-field(input="ui-input-text" path="agentMaxLatencySteps" label="Max latency steps" placeholder="0")
              div(class="flex items-end pb-1")
                ui-form-field(input="ui-input-checkbox" path="agentRequireNoErrors" label="Require no errors")
            p(class="text-xs text-indigo-700") These fields generate the JSON rubric used by agent-task scoring.

        div(class="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100")
          ui-button(type="button" :variant="Variant.Gray" @click="close") Cancel
          ui-button(type="button" :disabled="!validated" :busy="busy" @click="submit") Add case
</template>

<script lang="ts">
import {
  HyperstrateApi,
  HyperstrateServerInternalModulesRouterApplicationEvaluationCaseResponse,
  HyperstrateServerInternalModulesRouterApplicationEvaluationCaseInputScoreMethodEnum,
} from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { KeyValuePair } from '@/features/ui/input-key-value/InputKeyValue.global.vue'
import Modal from '@/features/ui/modal/Modal.global.vue'
import { Size, Variant } from '@/features/ui/clickables/model'
import { Mixins } from '@/util/mixin'
import { splitTrimmedLines } from '@/util/string'
import { IsNotEmpty, IsOptional } from 'class-validator'
import { Component, Ref } from 'vue-facing-decorator'
import { ArrayProp, RequiredProp } from '@/util/prop-decorators'

const ScoreMethod = HyperstrateServerInternalModulesRouterApplicationEvaluationCaseInputScoreMethodEnum

interface ScoreMethodOption {
  label: string
  value: string
}

interface FieldsFormFieldRef {
  $refs?: { input?: { addPair?: () => void } }
}

const SCORE_METHOD_OPTIONS: ScoreMethodOption[] = [
  { label: 'Contains', value: ScoreMethod.CONTAINS },
  { label: 'Exact match', value: ScoreMethod.EXACT },
  { label: 'LLM judge', value: ScoreMethod.LLM },
  { label: 'Agent task', value: ScoreMethod.AGENT_TASK },
]

export class AddEvaluationCaseFormData {
  fields?: KeyValuePair[]
  scoreMethod?: ScoreMethodOption

  @IsNotEmpty()
  expected!: string

  @IsOptional()
  description?: string

  @IsOptional()
  agentContains?: string

  @IsOptional()
  agentNotContains?: string

  @IsOptional()
  agentMinToolCalls?: string

  @IsOptional()
  agentMaxCostUsd?: string

  @IsOptional()
  agentMaxLatencySteps?: string

  @IsOptional()
  agentRequireNoErrors?: boolean
}

type EvalCase = HyperstrateServerInternalModulesRouterApplicationEvaluationCaseResponse

type AddEvaluationCaseModalEmits = {
  (e: 'added', value: EvalCase): void
  (e: string): void
}

@Component({ emits: ['added'] })
export default class AddEvaluationCaseModal extends Mixins(ApiClientsMixin) {
  public readonly Variant = Variant
  public readonly Size = Size
  public readonly AddEvaluationCaseFormData = AddEvaluationCaseFormData
  public readonly scoreMethodOptions = SCORE_METHOD_OPTIONS

  declare public $emit: AddEvaluationCaseModalEmits

  @RequiredProp()
  public readonly evalId!: string

  @ArrayProp(() => ['prompt'])
  public readonly initialFieldKeys!: string[]

  @Ref()
  public readonly modalRef!: Modal

  @Ref()
  public readonly fieldsFormField?: FieldsFormFieldRef

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  public get initialFormData(): Pick<AddEvaluationCaseFormData, 'fields' | 'scoreMethod'> {
    return {
      fields: this.initialFieldKeys.map((key) => ({ key, value: '' })),
      scoreMethod: SCORE_METHOD_OPTIONS[0],
    }
  }

  public isLLMScoringForm(formData: Record<string, unknown>): boolean {
    return (formData.scoreMethod as ScoreMethodOption | undefined)?.value === ScoreMethod.LLM
  }

  public isAgentTaskScoringForm(formData: Record<string, unknown>): boolean {
    return (formData.scoreMethod as ScoreMethodOption | undefined)?.value === ScoreMethod.AGENT_TASK
  }

  public addField(): void {
    this.fieldsFormField?.$refs?.input?.addPair?.()
  }

  public async doSubmit(formData: AddEvaluationCaseFormData): Promise<void> {
    const fields: Record<string, string> = {}
    for (const { key, value } of formData.fields ?? []) {
      if (key.trim()) fields[key.trim()] = value
    }
    const scoreMethod = (formData.scoreMethod?.value ?? ScoreMethod.CONTAINS) as (typeof ScoreMethod)[keyof typeof ScoreMethod]
    const { data } = await this.api.routerEvaluationsEvalIdCasesPost({
      evalId: this.evalId,
      body: {
        fields,
        expected: scoreMethod === ScoreMethod.AGENT_TASK ? this.agentTaskRubric(formData) : formData.expected.trim(),
        scoreMethod,
        description: formData.description?.trim() || undefined,
      },
    })
    this.$emit('added', data)
    this.close()
  }

  public close(): void {
    this.modalRef.close()
  }

  private n(v: string | undefined): number | undefined {
    const x = Number(v)
    return Number.isFinite(x) && x > 0 ? x : undefined
  }

  private agentTaskRubric(formData: AddEvaluationCaseFormData): string {
    const rubric: Record<string, unknown> = {
      contains: splitTrimmedLines(formData.agentContains || formData.expected),
      notContains: splitTrimmedLines(formData.agentNotContains),
      requireNoErrors: Boolean(formData.agentRequireNoErrors),
    }
    const minToolCalls = this.n(formData.agentMinToolCalls)
    const maxCostUsd = this.n(formData.agentMaxCostUsd)
    const maxLatencySteps = this.n(formData.agentMaxLatencySteps)
    if (minToolCalls != null) rubric.minToolCalls = minToolCalls
    if (maxCostUsd != null) rubric.maxCostUsd = maxCostUsd
    if (maxLatencySteps != null) rubric.maxLatencySteps = maxLatencySteps
    return JSON.stringify(rubric, null, 2)
  }
}
</script>
