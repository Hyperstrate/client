<!-- eslint-disable vue/no-v-html -->
<template lang="pug">
div(class="flex flex-col gap-6")
  //- Mode toggle
  div(class="flex items-center gap-2")
    ui-tab-bar(v-model="mode" class="w-fit")
      ui-tab-button(:value="PlaygroundMode.MODELS") Models
      ui-tab-button(:value="PlaygroundMode.ROUTER") Router

  //- Input area
  div(class="bg-white rounded-xl border border-gray-100 shadow-xs p-6 flex flex-col gap-4")
    div(class="flex flex-col gap-1.5")
      label(class="text-sm font-medium text-gray-700") System prompt (optional)
      ui-input-textarea(v-model="systemPrompt" :rows="2" placeholder="You are a helpful assistant…" class="w-full !min-w-0")

    div(class="flex flex-col gap-1.5")
      label(class="text-sm font-medium text-gray-700") Prompt
      ui-input-textarea(v-model="prompt" :rows="5" placeholder="Enter your prompt here…" class="w-full !min-w-0")

    //- Model mode: pick models
    template(v-if="mode === PlaygroundMode.MODELS")
      div(class="flex flex-col gap-1.5")
        label(class="text-sm font-medium text-gray-700") Models to compare (up to 4)
        div(v-if="loading" class="text-sm text-gray-400") Loading models…
        div(v-else class="flex flex-wrap gap-2")
          ui-button(
            v-for="m in models"
            :key="m.id"
            :size="Size.SM"
            :variant="selectedIds.includes(m.id) ? Variant.Indigo : Variant.Gray"
            :outlined="!selectedIds.includes(m.id)"
            @click="toggleModel(m.id)"
          ) {{ m.alias || m.displayName }}
          span(v-if="!models.length" class="text-sm text-gray-400") No models configured. Register a model first.
      div(class="flex items-center justify-between")
        span(class="text-xs text-gray-400") {{ selectedIds.length }} model{{ selectedIds.length !== 1 ? 's' : '' }} selected
        ui-button(:disabled="!prompt.trim() || selectedIds.length === 0 || busy" :busy="busy" @click="runComparison") Run comparison

    //- Router mode: pick router
    template(v-else)
      div(class="flex flex-col gap-1.5")
        label(class="text-sm font-medium text-gray-700") Router
        domain-ui-input-combobox-router(v-model="selectedRouter" placeholder="Select a router…")
      div(class="flex items-center justify-between")
        span(class="text-xs text-gray-400") {{ routerTraceHint }}
        ui-button(:disabled="!prompt.trim() || !selectedRouter || busy" :busy="busy" @click="runRouterInference") Route &amp; inspect

  //- Model comparison results
  div(v-if="mode === PlaygroundMode.MODELS && results.length" :class="['grid gap-4', gridCols]")
    div(v-for="r in results" :key="r.modelId" class="bg-white rounded-xl border border-gray-100 shadow-xs flex flex-col")
      div(class="px-5 py-3 border-b border-gray-100 flex items-center justify-between")
        div(class="flex flex-col")
          span(class="text-sm font-semibold text-gray-900") {{ r.displayName }}
          span(class="text-xs text-gray-400") {{ r.modelDefKey }}
        div(v-if="!r.loading && !r.error" class="flex items-center gap-3")
          span(class="text-xs font-numeric tabular-nums text-gray-500") {{ r.latencyMs }} ms
          span(v-if="r.costUsd !== undefined" :class="['text-xs font-numeric tabular-nums', r.costUsd > 0 ? 'text-green-600' : 'text-gray-400']")
            | {{ r.costUsd > 0 ? formatCost(r.costUsd) : 'free' }}
      div(v-if="r.loading" v-loading="true" class="h-20")
      div(v-else-if="r.error" class="flex-1 p-5")
        div(class="bg-red-50 border border-red-100 rounded-lg p-4")
          span(class="text-sm text-red-600") {{ r.error }}
      div(
        v-else-if="r.content"
        class="flex-1 p-5 prose prose-sm max-w-none prose-pre:bg-gray-800 prose-pre:text-gray-100 overflow-auto"
        v-html="renderMarkdown(r.content)"
      )
      div(v-if="!r.loading && (r.inputTokens || r.outputTokens)" class="px-5 py-2 border-t border-gray-50 flex gap-4")
        span(class="text-xs text-gray-400")
          span(class="font-numeric font-medium tabular-nums text-gray-600") {{ r.inputTokens }}
          |
          | in
        span(class="text-xs text-gray-400")
          span(class="font-numeric font-medium tabular-nums text-gray-600") {{ r.outputTokens }}
          |
          | out

  //- Router inference result
  div(v-if="mode === PlaygroundMode.ROUTER && routerResult" class="flex flex-col gap-4")
    div(class="bg-white rounded-xl border border-gray-100 shadow-xs flex flex-col")
      div(class="px-5 py-3 border-b border-gray-100 flex items-center justify-between")
        div(class="flex flex-col")
          span(class="text-sm font-semibold text-gray-900") Router response
          span(class="text-xs text-gray-400") via {{ routerResult.modelDefKey || routerResult.selectedModelId }}
        div(class="flex items-center gap-4")
          span(v-if="routerResult.abVariant" class="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-medium") A/B: {{ routerResult.abVariant }}
          span(class="text-xs font-numeric tabular-nums text-gray-500") {{ routerLatencyMs }} ms
          span(v-if="(routerResult.costUsd ?? 0) > 0" class="text-xs font-numeric tabular-nums text-green-600") {{ formatCost(routerResult.costUsd) }}
      div(class="flex-1 p-5 prose prose-sm max-w-none prose-pre:bg-gray-800 prose-pre:text-gray-100 overflow-auto" v-html="renderMarkdown(routerResult.content ?? '')")
      div(class="px-5 py-2 border-t border-gray-50 flex gap-4 text-xs text-gray-400")
        span
          span(class="font-numeric font-medium tabular-nums text-gray-600") {{ routerResult.inputTokens }}
          |
          | in
        span
          span(class="font-numeric font-medium tabular-nums text-gray-600") {{ routerResult.outputTokens }}
          |
          | out

    div(v-if="routerSteps.length" class="bg-white rounded-xl border border-gray-100 shadow-xs p-5 flex flex-col gap-3")
      domain-ui-pipeline-trace(:item="routerTraceItem")

  div(v-else-if="mode === PlaygroundMode.ROUTER && !busy" class="text-center py-16 text-gray-400 text-sm") Select a router and run inference to see the full pipeline trace.

  div(v-if="mode === PlaygroundMode.MODELS && !results.length" class="text-center py-16 text-gray-400 text-sm") Select models and run a comparison to see results side by side.
</template>

<script lang="ts">
import {
  HyperstrateApi,
  HyperstrateServerInternalModulesAiApplicationModelResponse,
  HyperstrateServerInternalModulesRouterApplicationRouterResponse,
  HyperstrateServerInternalModulesRouterApplicationPipelineStep,
} from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import { AsyncData } from '@/util/async-data.decorator'
import { Mixins } from '@/util/mixin'
import { Component } from 'vue-facing-decorator'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import { Option } from '@/features/ui/inputs/model'
import { Size, Variant } from '@/features/ui/clickables/model'
import { formatCurrency } from '@/util/format'

type ModelResponse = HyperstrateServerInternalModulesAiApplicationModelResponse
type PipelineStep = HyperstrateServerInternalModulesRouterApplicationPipelineStep

marked.use({
  renderer: {
    code({ text, lang }: { text: string; lang?: string }) {
      const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
      return `<pre><code class="hljs language-${language}">${hljs.highlight(text, { language }).value}</code></pre>`
    },
  },
})

enum PlaygroundMode {
  MODELS = 'MODELS',
  ROUTER = 'ROUTER',
}

interface CompareResult {
  modelId: string
  displayName: string
  modelDefKey: string
  loading: boolean
  content?: string
  error?: string
  latencyMs?: number
  inputTokens?: number
  outputTokens?: number
  costUsd?: number
}

interface RouterInferResult {
  content?: string
  selectedModelId?: string
  modelDefKey?: string
  provider?: string
  inputTokens?: number
  outputTokens?: number
  costUsd?: number
  abVariant?: string
}

interface PipelineTraceItem {
  pipelineSteps: PipelineStep[]
  latencyMs: number
}

@Component
export default class Playground extends Mixins(ApiClientsMixin, LoadingMixin) {
  public readonly Size = Size
  public readonly Variant = Variant
  public readonly formatCost = (value: number | undefined): string => formatCurrency(value, 5)

  public mode: PlaygroundMode = PlaygroundMode.MODELS
  public PlaygroundMode = PlaygroundMode

  // Model mode
  public models: ModelResponse[] = []
  public selectedIds: string[] = []
  public results: CompareResult[] = []

  // Router mode
  public selectedRouter?: Option<HyperstrateServerInternalModulesRouterApplicationRouterResponse>
  public routerResult?: RouterInferResult = undefined
  public routerSteps: PipelineStep[] = []
  public routerLatencyMs = 0

  // Shared
  public prompt = ''
  public systemPrompt = ''
  public busy = false

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  public get gridCols(): string {
    const n = this.results.length
    if (n === 1) return 'grid-cols-1'
    if (n === 2) return 'grid-cols-2'
    if (n === 3) return 'grid-cols-3'
    return 'grid-cols-2'
  }

  public get routerTraceItem(): PipelineTraceItem {
    return { pipelineSteps: this.routerSteps, latencyMs: this.routerLatencyMs }
  }

  public get routerTraceHint(): string {
    if (this.routerResult && !this.routerSteps.length) return 'No pipeline steps recorded'
    return 'Pipeline trace will be shown after inference'
  }

  public toggleModel(id: string): void {
    const idx = this.selectedIds.indexOf(id)
    if (idx === -1) {
      if (this.selectedIds.length < 4) this.selectedIds = [...this.selectedIds, id]
    } else {
      this.selectedIds = this.selectedIds.filter((x) => x !== id)
    }
  }

  public renderMarkdown(content: string): string {
    return DOMPurify.sanitize(marked(content) as string)
  }

  @AsyncData()
  public async asyncData(): Promise<AsyncData<Playground>> {
    this.setLoading(true)
    try {
      const { data } = await this.api.aiModelsGet({ perPage: 100 })
      return { models: data.items ?? [] }
    } finally {
      this.setLoading(false)
    }
  }

  private async inferOne(model: ModelResponse): Promise<Partial<CompareResult>> {
    const start = Date.now()
    try {
      const { data } = await this.api.aiInferPost({
        body: {
          modelId: model.id,
          fields: {
            prompt: this.prompt,
            ...(this.systemPrompt ? { systemPrompt: this.systemPrompt } : {}),
          },
        },
      })
      return {
        content: data.content,
        latencyMs: Date.now() - start,
        inputTokens: data.inputTokens ?? 0,
        outputTokens: data.outputTokens ?? 0,
        costUsd: data.costUsd ?? 0,
      }
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : String(e), latencyMs: Date.now() - start }
    }
  }

  public async runComparison(): Promise<void> {
    if (!this.prompt.trim() || this.selectedIds.length === 0 || this.busy) return
    this.busy = true
    this.results = this.selectedIds.map((id) => {
      const m = this.models.find((x) => x.id === id)!
      return { modelId: id, displayName: m.alias || m.displayName || id, modelDefKey: m.modelDefinitionKey ?? '', loading: true }
    })
    await Promise.all(
      this.results.map(async (r, i) => {
        const model = this.models.find((x) => x.id === r.modelId)!
        const out = await this.inferOne(model)
        this.results = this.results.map((item, j) => (j === i ? { ...item, loading: false, ...out } : item))
      }),
    )
    this.busy = false
  }

  public async runRouterInference(): Promise<void> {
    if (!this.prompt.trim() || !this.selectedRouter || this.busy) return
    this.busy = true
    this.routerResult = undefined
    this.routerSteps = []
    const start = Date.now()
    try {
      const { data } = await this.api.routerIdInferPost({
        id: this.selectedRouter.value.id,
        body: {
          fields: {
            prompt: this.prompt,
            ...(this.systemPrompt ? { systemPrompt: this.systemPrompt } : {}),
          },
        },
      })
      this.routerResult = data
      this.routerSteps = data.pipelineSteps ?? []
      this.routerLatencyMs = Date.now() - start
    } catch (e: unknown) {
      this.routerResult = { content: `Error: ${e instanceof Error ? e.message : String(e)}` }
    } finally {
      this.busy = false
    }
  }
}
</script>
