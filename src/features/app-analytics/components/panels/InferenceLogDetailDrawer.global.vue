<template lang="pug">
ui-drawer(:model-value="!!log" title="Inference log detail" @close="$emit('close')")
  div(v-if="log" class="px-6 py-5 flex flex-col gap-5")
    section(class="flex flex-col gap-3")
      ui-overline(compact) Summary
      div(class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm")
        div
          span(class="text-xs text-gray-400 block") Status
          ui-badge(:variant="log.status === 'error' ? Variant.Red : Variant.Green") {{ log.status }}
        div
          span(class="text-xs text-gray-400 block") Source
          span(class="font-medium text-gray-700") {{ log.source }}
        div
          span(class="text-xs text-gray-400 block") Model
          span(class="font-medium text-gray-700 font-mono text-xs") {{ log.modelDefKey || log.modelId }}
        div
          span(class="text-xs text-gray-400 block") Provider
          span(class="font-medium text-gray-700") {{ log.provider }}
        div
          span(class="text-xs text-gray-400 block") Latency
          span(class="font-numeric font-medium tabular-nums text-gray-700") {{ log.latencyMs }}ms
        div
          span(class="text-xs text-gray-400 block") Cost
          span(class="font-numeric font-medium tabular-nums text-gray-700") {{ formatCurrency(log.costUsd ?? 0) }}
        div
          span(class="text-xs text-gray-400 block") Tokens (in / out)
          span(class="font-numeric font-medium tabular-nums text-gray-700") {{ log.inputTokens }} / {{ log.outputTokens }}
        div
          span(class="text-xs text-gray-400 block") Created
          span(class="font-medium text-gray-700") {{ formatDate(log.createdAt) }}
        div(v-if="log.abVariant")
          span(class="text-xs text-gray-400 block") A/B Variant
          ui-badge(variant="indigo") {{ log.abVariant }}
        div(v-if="log.cacheHit")
          span(class="text-xs text-gray-400 block") Cache
          ui-badge(variant="blue") {{ log.cacheHitType }} hit
        div(v-if="log.virtualKeyId")
          span(class="text-xs text-gray-400 block") Virtual key
          span(class="font-mono text-xs text-gray-600") {{ log.virtualKeyId }}

    div(v-if="log.errorMessage" class="rounded-lg bg-red-50 border border-red-100 px-4 py-3")
      span(class="text-xs font-semibold text-red-600 block") Error
      p(class="text-xs text-red-700 leading-relaxed font-mono") {{ log.errorMessage }}

    section(v-if="hasPipelineSteps" class="flex flex-col gap-2")
      domain-ui-pipeline-trace(:item="log")

    section(class="flex flex-col gap-2")
      ui-overline(compact) Payload
      div(v-if="payloadLoading" class="text-xs text-gray-400") Loading payload…
      div(v-else-if="payloadError" class="rounded bg-gray-50 border border-gray-100 px-3 py-2 text-xs text-gray-400") {{ payloadError }}
      div(v-else-if="payload" class="flex flex-col gap-3")
        div(v-if="requestFields" class="flex flex-col gap-1")
          span(class="text-xs font-medium text-gray-500") Request fields
          pre(class="text-xs bg-gray-50 border border-gray-100 rounded p-3 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed") {{ requestFields }}
        div(v-if="payload.responseContent" class="flex flex-col gap-1")
          span(class="text-xs font-medium text-gray-500") Response
          pre(class="text-xs bg-gray-50 border border-gray-100 rounded p-3 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed") {{ payload.responseContent }}
        div(v-if="replayBusy" class="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 flex items-center gap-2 text-xs text-indigo-700")
          div(class="w-3.5 h-3.5 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin shrink-0")
          span(class="font-medium") Replaying request with cache bypassed…
        div(v-if="replayResult" class="flex flex-col gap-1")
          div(class="flex items-center gap-2")
            span(class="text-xs font-medium text-gray-500") Replay response
            span(class="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded px-1.5 py-0.5 leading-none") cache bypassed
          div(class="flex items-center gap-3 text-xs text-gray-400")
            span(class="font-numeric tabular-nums") {{ replayResult.latencyMs }}ms
            span(class="font-numeric tabular-nums") {{ replayResult.inputTokens }}&nbsp;in / {{ replayResult.outputTokens }}&nbsp;out
            span(v-if="replayResult.costUsd > 0" class="font-numeric tabular-nums text-green-600") {{ formatCurrency(replayResult.costUsd) }}
          pre(class="text-xs bg-indigo-50 border border-indigo-100 rounded p-3 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed text-indigo-900") {{ replayResult.content }}
        div(v-if="replayError" class="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-700") {{ replayError }}
      div(v-else class="text-xs text-gray-400") Payload not stored (enable store_payloads on the router)

  template(v-if="log" #footer)
    div(class="px-6 py-4 flex items-center justify-between gap-2")
      div(class="flex flex-col gap-1")
        ui-tooltip
          template(#trigger)
            ui-button(
              v-if="payload && log.routerId"
              :disabled="replayDisabled"
              :busy="replayBusy"
              :variant="replayBusy ? Variant.Blue : Variant.Gray"
              class="min-w-[118px]"
              @click="replayRequest"
            )
              template(#before)
                ui-icon(icon="refresh" :size="14")
              | {{ replayButtonLabel }}
          template(#content)
            | Re-run this request against the model, bypassing the cache
        span(v-if="replayBusy" class="text-xs text-indigo-500") Waiting for a fresh model response
        span(v-else-if="replayError" class="text-xs text-red-500") Replay failed
      div(class="flex items-center gap-2")
        ui-tooltip(:content="log.feedback === 1 ? 'Remove positive rating' : 'Mark as good'")
          ui-button(
            :variant="log.feedback === 1 ? Variant.Green : Variant.Gray"
            :outlined="log.feedback !== 1"
            square
            @click="$emit('feedback', log, log.feedback === 1 ? 0 : 1)"
          ) 👍
        ui-tooltip(:content="log.feedback === -1 ? 'Remove negative rating' : 'Mark as bad'")
          ui-button(
            :variant="log.feedback === -1 ? Variant.Red : Variant.Gray"
            :outlined="log.feedback !== -1"
            square
            @click="$emit('feedback', log, log.feedback === -1 ? 0 : -1)"
          ) 👎
</template>

<script lang="ts">
import type { InternalModulesObservabilityInterfacesHttpInferenceLogResponse } from '@/__generated__/hyperstrate-api'
import { HyperstrateApi, HyperstrateServerInternalModulesObservabilityDomainInferencePayload } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Variant } from '@/features/ui/clickables/model'
import { formatCurrency as formatUsd, formatDate as formatShortDate } from '@/util/format'
import { Mixins } from '@/util/mixin'
import { OptionalProp } from '@/util/prop-decorators'
import { Component, Watch } from 'vue-facing-decorator'

interface ReplayResult {
  content: string
  inputTokens: number
  outputTokens: number
  costUsd: number
  latencyMs: number
}

type InferenceLogDetailDrawerEmits = {
  (e: 'close'): void
  (e: 'feedback', log: InternalModulesObservabilityInterfacesHttpInferenceLogResponse, value: number): void
  (e: string): void
}

@Component({ emits: ['close', 'feedback'] })
export default class InferenceLogDetailDrawer extends Mixins(ApiClientsMixin, LoadingMixin) {
  @OptionalProp()
  public readonly log?: InternalModulesObservabilityInterfacesHttpInferenceLogResponse

  declare public $emit: InferenceLogDetailDrawerEmits

  public readonly Variant = Variant
  public readonly formatDate = (iso: string | undefined): string =>
    formatShortDate(iso, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  public readonly formatCurrency = (value: number | undefined): string => formatUsd(value, 6)
  public payload?: HyperstrateServerInternalModulesObservabilityDomainInferencePayload
  public payloadLoading = false
  public payloadError?: string = undefined
  public replayResult?: ReplayResult = undefined
  public replayError?: string = undefined
  public replayBusy = false

  private get hyperstrateApi(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  @Watch('log')
  public async onLogChange(): Promise<void> {
    this.payload = undefined
    this.payloadError = undefined
    this.replayResult = undefined
    this.replayError = undefined
    if (!this.log || !this.log.id) return
    this.payloadLoading = true
    try {
      const { data } = await this.hyperstrateApi.analyticsInferenceLogsIdPayloadGet({ id: this.log.id })
      this.payload = data
    } catch {
      this.payloadError = 'Payload not available'
    } finally {
      this.payloadLoading = false
    }
  }

  public get hasPipelineSteps(): boolean {
    return Array.isArray(this.log?.pipelineSteps) && this.log.pipelineSteps.length > 0
  }

  public get requestFields(): string {
    if (!this.payload?.requestFields) return ''
    try {
      return JSON.stringify(JSON.parse(this.payload.requestFields), null, 2)
    } catch {
      return this.payload.requestFields
    }
  }

  public get replayDisabled(): boolean {
    return this.replayBusy || this.payloadLoading || !this.payload || !this.log?.routerId
  }

  public get replayButtonLabel(): string {
    if (this.replayBusy) return 'Replaying'
    if (this.replayResult) return 'Replay again'
    return 'Replay'
  }

  public async replayRequest(): Promise<void> {
    if (!this.log?.id || this.replayBusy) return
    this.replayBusy = true
    this.replayResult = undefined
    this.replayError = undefined
    try {
      const { data } = await this.hyperstrateApi.analyticsInferenceLogsIdReplayPost({ id: this.log.id })
      this.replayResult = data as ReplayResult
    } catch {
      this.replayError = 'Replay failed. Check the router target, model credentials, or request payload.'
    } finally {
      this.replayBusy = false
    }
  }
}
</script>
