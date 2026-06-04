<template lang="pug">
ui-drawer(v-model="model" title="Invocation")
  div(v-if="invocation" class="flex flex-col gap-5 p-6")
    div(class="flex items-start justify-between gap-3")
      div(class="min-w-0 flex flex-col gap-1")
        div(class="flex items-center gap-2")
          ui-badge(:variant="invocationStatusVariant(invocation.status)" :dot="true") {{ statusLabel(invocation.status) }}
          span(class="text-xs text-gray-400 font-mono") {{ invocation.id }}
        div(class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500")
          span function {{ shortId(invocation.functionId) }}
          span revision {{ shortId(invocation.revisionId) }}
          span attempt {{ invocation.attempt || 0 }} / {{ invocation.maxAttempts || 1 }}
      ui-button(:size="Size.SM" :variant="Variant.Gray" :busy="logsLoading" @click="loadLogs")
        template(#before)
          ui-icon(icon="refresh" :size="15")
        | Logs

    div(class="grid grid-cols-1 md:grid-cols-2 gap-4")
      div(class="flex flex-col gap-2")
        h3(class="text-sm font-semibold text-gray-800") Payload
        pre(class="text-xs bg-gray-50 border border-gray-100 rounded-lg p-3 overflow-auto max-h-72 whitespace-pre-wrap font-mono") {{ formatJson(invocation.payload) || '{}' }}
      div(class="flex flex-col gap-2")
        h3(class="text-sm font-semibold text-gray-800") Result
        pre(class="text-xs bg-gray-50 border border-gray-100 rounded-lg p-3 overflow-auto max-h-72 whitespace-pre-wrap font-mono") {{ formatJson(invocation.result) || invocation.error || '{}' }}

    div(class="flex flex-col gap-2")
      div(class="flex items-center justify-between gap-3")
        h3(class="text-sm font-semibold text-gray-800") Runtime Logs
        span(class="text-xs text-gray-400 font-numeric tabular-nums") {{ logs.length }}
      div(v-if="logsLoading" v-loading="true" class="py-12")
      div(v-else-if="logs.length === 0" class="py-12 text-center border border-dashed border-gray-200 rounded-xl")
        p(class="text-sm font-medium text-gray-400") No logs
      div(v-else class="border border-gray-200 rounded-xl overflow-hidden bg-zinc-950")
        div(v-for="log in logs" :key="log.id" class="grid grid-cols-[70px_minmax(0,1fr)] gap-3 px-4 py-2 border-b border-white/10 last:border-b-0")
          span(class="text-xs font-mono" :class="streamClass(log.stream)") {{ log.stream }}
          pre(class="text-xs text-zinc-100 whitespace-pre-wrap font-mono leading-relaxed") {{ log.message }}
  div(v-else class="p-6")
    p(class="text-sm text-gray-400") No invocation selected
</template>

<script lang="ts">
import type { HyperstrateApi } from '@/__generated__/hyperstrate-api'
import { HyperstrateServerInternalModulesFunctionsDomainLogStream as LogStream } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Size, Variant } from '@/features/ui/clickables/model'
import { Mixins } from '@/util/mixin'
import { ObjectProp } from '@/util/prop-decorators'
import { Component, Model, Watch } from 'vue-facing-decorator'
import type { FunctionInvocation, FunctionLog, FunctionsControlPlaneApi } from '../../api'
import { itemsFromPage } from '../../api'
import { formatJson, invocationStatusVariant, statusLabel } from '../../model'

@Component
export default class InvocationDetailDrawer extends Mixins(ApiClientsMixin) {
  @Model({ type: Boolean, default: false })
  public model!: boolean

  @ObjectProp()
  public readonly invocation?: FunctionInvocation

  public logs: FunctionLog[] = []
  public logsLoading = false
  public readonly Size = Size
  public readonly Variant = Variant
  public readonly invocationStatusVariant = invocationStatusVariant
  public readonly statusLabel = statusLabel
  public readonly formatJson = formatJson

  private get api(): FunctionsControlPlaneApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API) as unknown as FunctionsControlPlaneApi
  }

  @Watch('model')
  public onOpenChange(open: boolean): void {
    if (open) void this.loadLogs()
  }

  @Watch('invocation')
  public onInvocationChange(): void {
    this.logs = []
    if (this.model) void this.loadLogs()
  }

  public async loadLogs(): Promise<void> {
    if (!this.invocation?.id) return
    this.logsLoading = true
    try {
      const { data } = await this.api.functionsInvocationsInvocationIdLogsGet({
        invocationId: this.invocation.id,
        page: 1,
        perPage: 200,
      })
      this.logs = itemsFromPage(data)
    } finally {
      this.logsLoading = false
    }
  }

  public shortId(value: string | undefined): string {
    if (!value) return ''
    const parts = value.split('_')
    const tail = parts[parts.length - 1] || value
    return tail.length > 10 ? tail.slice(0, 10) : tail
  }

  public streamClass(stream: string | undefined): string {
    switch (stream) {
      case LogStream.LogStreamStderr:
        return 'text-red-300'
      case LogStream.LogStreamSystem:
        return 'text-sky-300'
      default:
        return 'text-emerald-300'
    }
  }
}
</script>
