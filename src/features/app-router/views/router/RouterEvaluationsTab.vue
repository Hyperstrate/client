<template lang="pug">
div(class="flex h-full overflow-hidden")
  //- ── Left: evaluation list ────────────────────────────────────────────────
  div(class="w-72 shrink-0 border-r border-gray-200 flex flex-col overflow-hidden bg-white")
    div(class="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0")
      span(class="text-sm font-semibold text-gray-800") Evaluations

      app-router-create-evaluation-modal(:router-id="routerId" @created="onEvalCreated")
        template(#trigger="{ open }")
          ui-button(:size="Size.SM" @click="open")
            ui-icon(icon="plus" :size="12")
            | New

    //- List
    div(v-if="loading" class="flex items-center justify-center py-8")
      ui-indicator
    ui-empty-state(v-else-if="!evaluations.length" heading="No evaluations" subheading="Create an evaluation to test your router.")
    div(v-else class="flex-1 overflow-y-auto")
      div(
        v-for="e in evaluations"
        :key="e.id"
        class="px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
        :class="selectedEval?.id === e.id ? 'bg-indigo-50' : ''"
        @click="selectEval(e)"
      )
        div(class="flex items-start justify-between gap-2")
          div(class="flex flex-col min-w-0")
            span(class="text-sm font-medium text-gray-800 truncate") {{ e.name }}
            span(class="text-xs text-gray-400")
              span(class="font-numeric tabular-nums") {{ e.caseCount ?? 0 }}
              |
              | case{{ e.caseCount === 1 ? '' : 's' }}
          domain-ui-confirm-delete-modal(:name="e.name" description="All test cases and run history will be deleted." @confirm="deleteEvaluation(e.id)")
            template(#trigger)
              ui-icon-button(icon="trash" :size="Size.SM" :icon-size="16" :variant="Variant.Gray" class="!text-red-500 shrink-0" @click.stop)

  //- ── Right: no selection ──────────────────────────────────────────────────
  div(v-if="!selectedEval" class="flex-1 flex flex-col items-center justify-center gap-2 text-center p-8")
    ui-icon(icon="clipboard-list" :size="32" class="text-gray-400")
    p(class="text-sm font-medium text-gray-400") Select an evaluation
    p(class="text-xs text-gray-300") Or create a new one to get started

  //- ── Right: detail panel ──────────────────────────────────────────────────
  div(v-else class="flex-1 flex flex-col overflow-hidden")
    //- Header
    div(class="flex items-center justify-between px-5 py-3 border-b border-gray-200 shrink-0")
      div(class="flex flex-col gap-0.5 min-w-0")
        span(class="text-sm font-semibold text-gray-900 truncate") {{ selectedEval.name }}
        span(class="text-xs text-gray-400")
          span(class="font-numeric tabular-nums") {{ cases.length }}
          |
          | test case{{ cases.length === 1 ? '' : 's' }}
      div(class="flex items-end gap-2 shrink-0")
        div(v-if="requiresLLMJudge" class="w-64 flex flex-col gap-1")
          ui-label Judge model
          domain-ui-input-combobox-model(v-model="judgeModel")

        app-router-add-evaluation-case-modal(:eval-id="selectedEval.id" :initial-field-keys="existingFieldKeys" @added="onCaseAdded")
          template(#trigger="{ open }")
            ui-button(:variant="Variant.Gray" :size="Size.SM" @click="open")
              ui-icon(icon="plus" :size="12")
              | Add case

        ui-button(:size="Size.SM" :busy="running" :disabled="!canRunEvaluation" @click="runEvaluation")
          ui-icon(icon="play-circle" :size="20")
          | Run

    //- Last run summary banner
    div(
      v-if="lastRun"
      class="flex items-center gap-3 px-5 py-2.5 border-b shrink-0"
      :class="lastRun.passedCases === lastRun.totalCases ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'"
    )
      div(class="w-5 h-5 rounded-full flex items-center justify-center shrink-0" :class="lastRun.passedCases === lastRun.totalCases ? 'bg-green-200' : 'bg-amber-200'")
        ui-icon(
          :icon="lastRun.passedCases === lastRun.totalCases ? 'check' : 'exclamation'"
          :size="11"
          :class="lastRun.passedCases === lastRun.totalCases ? 'text-green-700' : 'text-amber-700'"
        )
      span(class="text-xs font-semibold" :class="lastRun.passedCases === lastRun.totalCases ? 'text-green-700' : 'text-amber-700'")
        span(class="font-numeric tabular-nums") {{ lastRun.passedCases }}/{{ lastRun.totalCases }}
        |
        | passed
      span(class="text-xs text-gray-500")
        | · avg
        span(class="font-numeric tabular-nums") {{ formatScore(lastRun.avgScore || 0) }}
      span(class="text-xs text-gray-400 ml-auto") {{ formatDate(lastRun.createdAt || '') }}

    //- Running banner
    div(v-if="running" class="flex items-center gap-3 px-5 py-2.5 border-b border-indigo-100 bg-indigo-50 shrink-0")
      ui-indicator
      span(class="text-xs font-medium text-indigo-700") Running evaluation…
      span(class="text-xs text-indigo-400") This may take a moment

    //- Cases
    div(class="flex-1 overflow-y-auto")
      ui-empty-state(v-if="!cases.length" heading="No test cases" subheading="Add a test case to start testing.")
      div(v-else class="flex flex-col divide-y divide-gray-100")
        div(v-for="c in cases" :key="c.id" class="px-5 py-3.5 flex flex-col gap-2 transition-colors" :class="caseRowClass(c.id)")
          //- Case header
          div(class="flex items-start gap-3")
            //- Result indicator
            div(v-if="caseResult(c.id)" class="mt-0.5 shrink-0")
              div(class="w-4 h-4 rounded-full flex items-center justify-center" :class="caseResult(c.id)?.passed ? 'bg-green-100' : 'bg-red-100'")
                ui-icon(:icon="caseResult(c.id)?.passed ? 'check' : 'close'" :size="9" :class="caseResult(c.id)?.passed ? 'text-green-600' : 'text-red-600'")
            div(v-else class="w-4 h-4 mt-0.5 rounded-full border-2 border-gray-200 shrink-0")
            //- Fields + expected
            div(class="flex flex-col gap-1 flex-1 min-w-0")
              div(class="flex flex-wrap gap-1")
                span(v-for="(val, key) in c.fields" :key="key" class="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 max-w-[200px] truncate") {{ key }}={{ val }}
              div(class="flex items-center gap-2 flex-wrap")
                span(class="text-xs text-gray-600")
                  span(class="font-medium") Expected:
                  |
                  | {{ c.expected }}
                ui-badge(:variant="scoreBadgeVariant(c.scoreMethod)") {{ scoringLabel(c.scoreMethod) }}
              span(v-if="c.description" class="text-xs text-gray-400 italic") {{ c.description }}
            //- Actions
            domain-ui-confirm-delete-modal(:name="'test case'" description="This test case will be permanently deleted." @confirm="deleteCase(c.id)")
              template(#trigger)
                ui-icon-button(icon="trash" :size="Size.SM" :icon-size="13" :variant="Variant.Gray" class="!text-red-500 shrink-0")
          //- Run result
          div(v-if="caseResult(c.id)" class="pl-7 flex items-start gap-2")
            span(class="text-xs text-gray-600 flex-1 min-w-0 break-words") {{ caseResult(c.id)?.actual || caseResult(c.id)?.errorMsg }}
            span(class="text-xs font-numeric tabular-nums text-gray-400 shrink-0") {{ formatScore(caseResult(c.id)?.score || 0, 0) }}
</template>

<script lang="ts">
import {
  HyperstrateApi,
  HyperstrateServerInternalModulesRouterApplicationEvaluationResponse,
  HyperstrateServerInternalModulesRouterApplicationEvaluationCaseResponse,
  HyperstrateServerInternalModulesRouterApplicationEvaluationCaseInputScoreMethodEnum,
  HyperstrateServerInternalModulesRouterApplicationEvalCaseResult,
  HyperstrateServerInternalModulesRouterApplicationEvaluationRunResponse,
  HyperstrateServerInternalModulesAiApplicationModelResponse,
} from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import { AsyncData } from '@/util/async-data.decorator'
import { Size, Variant } from '@/features/ui/clickables/model'
import { Mixins } from '@/util/mixin'
import { Component } from 'vue-facing-decorator'
import { RequiredProp } from '@/util/prop-decorators'
import { formatDate, formatPercent } from '@/util/format'
import type { Option } from '@/features/ui/inputs/model'

type Evaluation = HyperstrateServerInternalModulesRouterApplicationEvaluationResponse
type EvalCase = HyperstrateServerInternalModulesRouterApplicationEvaluationCaseResponse
type CaseResult = HyperstrateServerInternalModulesRouterApplicationEvalCaseResult
type RunResponse = HyperstrateServerInternalModulesRouterApplicationEvaluationRunResponse
type ModelResponse = HyperstrateServerInternalModulesAiApplicationModelResponse
const ScoreMethod = HyperstrateServerInternalModulesRouterApplicationEvaluationCaseInputScoreMethodEnum

@Component
export default class RouterEvaluationsTab extends Mixins(ApiClientsMixin, LoadingMixin) {
  @RequiredProp()
  public readonly routerId!: string

  public readonly Variant = Variant
  public readonly Size = Size
  public readonly formatScore = (score: number, digits = 1): string => formatPercent(score * 100, digits)
  public readonly formatDate = formatDate

  public evaluations: Evaluation[] = []
  public selectedEval: Evaluation | undefined = undefined
  public cases: EvalCase[] = []
  public lastRun: RunResponse | undefined = undefined
  public runResults: CaseResult[] = []
  public running = false
  public judgeModel: Option<ModelResponse> | undefined = undefined

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  public get existingFieldKeys(): string[] {
    if (this.cases.length === 0) return ['prompt']
    return Object.keys(this.cases[0].fields ?? { prompt: '' })
  }

  public get requiresLLMJudge(): boolean {
    return this.cases.some((c) => c.scoreMethod === ScoreMethod.LLM)
  }

  public get canRunEvaluation(): boolean {
    return Boolean(this.selectedEval?.id) && (!this.requiresLLMJudge || Boolean(this.judgeModelId))
  }

  private get judgeModelId(): string | undefined {
    return this.judgeModel?.value.id
  }

  @AsyncData()
  public async asyncData(): Promise<AsyncData<RouterEvaluationsTab>> {
    this.setLoading(true)
    try {
      const { data } = await this.api.routerEvaluationsGet({ routerId: this.routerId, perPage: 100 })
      return { evaluations: data.items ?? [] }
    } finally {
      this.setLoading(false)
    }
  }

  public async selectEval(e: Evaluation): Promise<void> {
    this.selectedEval = e
    this.runResults = []
    this.lastRun = undefined
    this.judgeModel = undefined
    const [{ data: cases }, { data: runs }] = await Promise.all([
      this.api.routerEvaluationsEvalIdCasesGet({ evalId: e.id! }),
      this.api.routerEvaluationsEvalIdRunsGet({ evalId: e.id!, perPage: 1 }),
    ])
    this.cases = cases
    const latestRun = runs.items?.[0]
    if (latestRun) {
      this.lastRun = latestRun
      this.runResults = latestRun.results ?? []
    }
  }

  public onEvalCreated(evaluation: Evaluation): void {
    this.evaluations = [evaluation, ...this.evaluations]
    void this.selectEval(evaluation)
  }

  public onCaseAdded(evalCase: EvalCase): void {
    this.cases = [...this.cases, evalCase]
    const updated = this.evaluations.map((e) => (e.id === this.selectedEval?.id ? { ...e, caseCount: (e.caseCount ?? 0) + 1 } : e))
    this.evaluations = updated
    this.selectedEval = updated.find((e) => e.id === this.selectedEval?.id)
  }

  public async deleteEvaluation(id: string | undefined): Promise<void> {
    if (!id) return
    await this.api.routerEvaluationsEvalIdDelete({ evalId: id })
    this.evaluations = this.evaluations.filter((e) => e.id !== id)
    if (this.selectedEval?.id === id) {
      this.selectedEval = undefined
      this.cases = []
      this.lastRun = undefined
      this.runResults = []
    }
  }

  public async deleteCase(caseId: string | undefined): Promise<void> {
    if (!this.selectedEval?.id || !caseId) return
    await this.api.routerEvaluationsEvalIdCasesCaseIdDelete({ evalId: this.selectedEval.id, caseId })
    this.cases = this.cases.filter((c) => c.id !== caseId)
    const updated = this.evaluations.map((e) => (e.id === this.selectedEval?.id ? { ...e, caseCount: Math.max(0, (e.caseCount ?? 1) - 1) } : e))
    this.evaluations = updated
    this.selectedEval = updated.find((e) => e.id === this.selectedEval?.id)
  }

  public async runEvaluation(): Promise<void> {
    if (!this.selectedEval?.id || !this.canRunEvaluation) return
    this.running = true
    try {
      const { data } = await this.api.routerEvaluationsEvalIdRunPost({
        evalId: this.selectedEval.id,
        ...(this.judgeModelId ? { judgeModelId: this.judgeModelId } : {}),
      })
      this.lastRun = data
      this.runResults = data.results ?? []
    } finally {
      this.running = false
    }
  }

  public caseResult(caseId: string | undefined): CaseResult | undefined {
    if (!caseId) return undefined
    return this.runResults.find((r) => r.caseId === caseId)
  }

  public caseRowClass(caseId: string | undefined): string {
    if (this.running) return 'opacity-50'
    const r = this.caseResult(caseId)
    if (!r) return ''
    return r.passed ? 'bg-green-50' : 'bg-red-50'
  }

  public scoringLabel(method: string | undefined): string {
    if (method === 'exact') return 'Exact'
    if (method === 'llm') return 'LLM judge'
    return 'Contains'
  }

  public scoreBadgeVariant(method: string | undefined): Variant {
    if (method === 'llm') return Variant.Purple
    if (method === 'exact') return Variant.Blue
    return Variant.Gray
  }
}
</script>
