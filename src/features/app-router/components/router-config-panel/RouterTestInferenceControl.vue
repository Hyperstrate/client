<template lang="pug">
div(class="p-4 flex flex-col gap-4")
  ui-overline Test Inference
  div(class="flex flex-col gap-1.5")
    span(class="text-xs font-medium text-gray-700") Prompt
    ui-input-textarea(v-model="testPrompt" :rows="5" placeholder="Type a prompt…" class="w-full !min-w-0")

  //- Dry-run toggle
  div(class="flex items-center gap-2")
    ui-input-checkbox(v-model="dryRun" label="Dry run — estimate cost only, don't call the model")

  ui-button(:disabled="!testPrompt.trim() || testBusy" :busy="testBusy" block @click="runTest")
    | {{ dryRun ? 'Estimate Cost' : 'Send via Router' }}

  //- Streaming response
  template(v-if="!dryRun && (testStreamContent || testBusy)")
    div(class="flex flex-col gap-2")
      span(class="text-xs font-medium text-gray-700") Response
      div(class="rounded-lg bg-gray-50 border border-gray-100 p-3 text-xs text-gray-700 whitespace-pre-wrap leading-relaxed min-h-[3rem]")
        | {{ testStreamContent }}
        span(v-if="testBusy" class="inline-block w-1 h-[1em] bg-gray-400 animate-pulse rounded align-middle")
      div(v-if="selectedModelDisplayName" class="text-xs text-gray-400") Routed to: {{ selectedModelDisplayName }}

  //- Dry-run result
  template(v-if="dryRun && dryRunResult")
    div(class="flex flex-col gap-2")
      div(class="flex items-center justify-between")
        span(class="text-xs font-medium text-gray-700") Cost Estimate
        span(class="text-xs text-gray-400")
          | ~
          span(class="font-numeric tabular-nums") {{ dryRunResult.estimatedInputTokens }}
          |
          | input tokens
      div(v-for="t in dryRunResult.targets" :key="t.modelId" class="rounded-lg bg-gray-50 border border-gray-100 p-3 flex flex-col gap-1")
        div(class="flex items-center justify-between")
          span(class="text-xs font-semibold text-gray-800") {{ t.displayName }}
          span(class="text-xs font-numeric tabular-nums text-gray-700") {{ formatCost(t.estimatedInputCostUsd) }}
        div(class="text-xs font-numeric tabular-nums text-gray-400")
          | ${{ t.inputPricePer1MTokens }}/M in · ${{ t.outputPricePer1MTokens }}/M out
      p(class="text-xs text-gray-400") Estimates input cost only; output cost depends on model response length.

  div(v-if="testError" class="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg p-3") {{ testError }}
</template>

<script lang="ts">
import { HyperstrateApi } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { HYPERSTRATE_API_URL } from '@/env'
import type { IdToken } from '@/features/core/store/id-token'
import { RootState } from '@/features/core/store'
import { Mixins } from '@/util/mixin'
import { Component } from 'vue-facing-decorator'
import { StringProp } from '@/util/prop-decorators'
import { formatCurrency } from '@/util/format'

interface DryRunTarget {
  modelId: string
  modelDefKey: string
  displayName: string
  provider: string
  inputPricePer1MTokens: number
  outputPricePer1MTokens: number
  estimatedInputCostUsd: number
}

interface DryRunResult {
  estimatedInputTokens: number
  targets: DryRunTarget[]
}

@Component
export default class RouterTestInferenceControl extends Mixins(ApiClientsMixin) {
  @RootState
  private readonly idToken!: IdToken

  @StringProp(true)
  public readonly routerId!: string

  @StringProp('')
  public readonly initialPromptId!: string

  public testPrompt = ''
  public testBusy = false
  public testStreamContent = ''
  public testSelectedModelId = ''
  public testSelectedModelName = ''
  public testError?: string = undefined
  public dryRun = false
  public dryRunResult?: DryRunResult = undefined

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  private authHeaders(): Record<string, string> {
    return this.idToken.accessToken ? { Authorization: `Bearer ${this.idToken.accessToken}` } : {}
  }

  public get selectedModelDisplayName(): string {
    return this.testSelectedModelName || this.testSelectedModelId
  }

  public formatCost(usd: number): string {
    if (usd === 0) return formatCurrency(0, 6)
    if (usd < 0.000001) return `$${usd.toExponential(2)}`
    return formatCurrency(usd, 6)
  }

  public async runTest(): Promise<void> {
    if (!this.testPrompt.trim() || this.testBusy) return
    this.testBusy = true
    this.testStreamContent = ''
    this.testSelectedModelId = ''
    this.testSelectedModelName = ''
    this.testError = undefined
    this.dryRunResult = undefined

    if (this.dryRun) {
      try {
        this.dryRunResult = await this.fetchDryRun(this.testPrompt.trim())
      } catch (err) {
        this.testError = err instanceof Error ? err.message : 'Dry-run failed'
      } finally {
        this.testBusy = false
      }
      return
    }

    try {
      await this.fetchInferStream(this.testPrompt.trim())
    } catch (err) {
      this.testError = err instanceof Error ? err.message : 'Inference failed'
    } finally {
      this.testBusy = false
    }
  }

  private async fetchDryRun(prompt: string): Promise<DryRunResult> {
    const { data } = await this.api.routerIdInferPost({ id: this.routerId, body: { fields: { prompt } } }, { params: { dryRun: true } })
    return data as unknown as DryRunResult
  }

  private async fetchInferStream(prompt: string): Promise<void> {
    const response = await fetch(`${HYPERSTRATE_API_URL}/router/${this.routerId}/infer/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.authHeaders() },
      body: JSON.stringify({ fields: { prompt } }),
    })
    if (!response.ok || !response.body) {
      const text = await response.text()
      throw new Error(text || `Request failed: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const parsed = JSON.parse(line.slice(6)) as {
            delta?: string
            done?: boolean
            selectedModelId?: string
            error?: string
          }
          if (parsed.error) throw new Error(parsed.error)
          if (parsed.delta) this.testStreamContent += parsed.delta
          if (parsed.done && parsed.selectedModelId) {
            this.testSelectedModelId = parsed.selectedModelId
            void this.resolveSelectedModelName(parsed.selectedModelId)
          }
        } catch (parseErr) {
          if (parseErr instanceof SyntaxError) continue
          throw parseErr
        }
      }
    }
  }

  private async resolveSelectedModelName(id: string): Promise<void> {
    try {
      const { data } = await this.api.aiModelsIdGet({ id })
      this.testSelectedModelName = data.alias || data.displayName || id
    } catch {
      this.testSelectedModelName = id
    }
  }
}
</script>
