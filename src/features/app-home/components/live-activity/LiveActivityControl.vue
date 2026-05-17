<template lang="pug">
div(class="flex flex-col gap-4")
  div(class="flex items-center justify-between")
    div(class="flex items-center gap-2.5")
      ui-overline Live activity
      div(class="flex items-center gap-1 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5")
        div(class="w-1 h-1 rounded-full bg-emerald-400 animate-pulse")
        span(class="text-xs font-medium text-emerald-600") Live
    ui-clickable(to="/analytics" class="text-xs text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-0.5")
      | View all
      ui-icon(icon="arrow-diagonal-top-right" :size="16")
  div(v-if="logs.length === 0 && !loading")
    ui-empty-state(heading="No activity yet" subheading="Inference requests will appear here as they come in")
  div(v-else class="rounded-xl border border-gray-100 overflow-hidden bg-white")
    div(v-if="loading && logs.length === 0" class="flex flex-col")
      div(v-for="i in 6" :key="i" class="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0")
        div(class="w-1.5 h-1.5 rounded-full bg-gray-100 animate-pulse shrink-0")
        div(class="flex-1 h-2.5 rounded-full bg-gray-100 animate-pulse")
        div(class="w-10 h-2.5 rounded-full bg-gray-100 animate-pulse")
        div(class="w-8 h-2.5 rounded-full bg-gray-100 animate-pulse")
    transition-group(v-else name="log-row" tag="div" class="flex flex-col divide-y divide-gray-50")
      div(v-for="log in logs" :key="log.id" class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors")
        div(class="w-1.5 h-1.5 rounded-full shrink-0" :class="isError(log) ? 'bg-red-400' : 'bg-emerald-400'")
        span(class="flex-1 text-sm text-gray-800 truncate") {{ modelLabel(log) }}
        span(v-if="log.router" class="text-xs text-gray-400 truncate max-w-[100px] shrink-0") via {{ log.router.name }}
        span(class="text-xs font-numeric tabular-nums shrink-0 font-medium" :class="isError(log) ? 'text-red-400' : 'text-gray-500'")
          | {{ log.latencyMs !== undefined ? log.latencyMs + 'ms' : '—' }}
        span(v-if="tokenLabel(log)" class="text-xs font-numeric text-gray-400 tabular-nums shrink-0") {{ tokenLabel(log) }}
        span(class="text-xs font-numeric text-gray-300 tabular-nums shrink-0 w-8 text-right") {{ timeAgo(log.createdAt) }}
</template>

<script lang="ts">
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import { HyperstrateApi, InternalModulesObservabilityInterfacesHttpInferenceLogResponse } from '@/__generated__/hyperstrate-api'
import { formatCompactNumber } from '@/util/format'
import { Mixins } from '@/util/mixin'
import { Component } from 'vue-facing-decorator'

type Log = InternalModulesObservabilityInterfacesHttpInferenceLogResponse

@Component
export default class LiveActivityControl extends Mixins(ApiClientsMixin, LoadingMixin) {
  public logs: Log[] = []
  private pollTimer?: ReturnType<typeof setInterval> = undefined

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  public async mounted(): Promise<void> {
    await this.fetchLogs()
    this.pollTimer = setInterval(() => void this.fetchLogs(), 5_000)
  }

  public beforeUnmount(): void {
    if (this.pollTimer !== null) clearInterval(this.pollTimer)
  }

  private async fetchLogs(): Promise<void> {
    this.setLoading(true)
    try {
      const { data } = await this.api.analyticsInferenceLogsGet({ perPage: 8, page: 1 })
      this.logs = data.items ?? []
    } catch {
      // silently ignore poll errors
    } finally {
      this.setLoading(false)
    }
  }

  public isError(log: Log): boolean {
    return !!log.errorMessage || log.status === 'error'
  }

  public modelLabel(log: Log): string {
    return log.model?.displayName || log.model?.alias || log.modelDefKey || log.provider || log.router?.name || '—'
  }

  public tokenLabel(log: Log): string {
    const total = (log.inputTokens ?? 0) + (log.outputTokens ?? 0)
    if (total === 0) return ''
    return `${formatCompactNumber(total)} tok`
  }

  public timeAgo(ts?: string): string {
    if (!ts) return ''
    const secs = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
    if (secs < 60) return `${secs}s`
    if (secs < 3600) return `${Math.floor(secs / 60)}m`
    return `${Math.floor(secs / 3600)}h`
  }
}
</script>

<style scoped>
.log-row-enter-active {
  transition:
    opacity 250ms ease,
    transform 250ms ease;
}
.log-row-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
