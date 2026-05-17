<template lang="pug">
ui-layout(use="core-default-layout")
  div(class="h-full flex flex-col")
    //- Header
    div(class="max-w-screen-lg w-full mx-auto px-4 pt-8 pb-4 shrink-0")
      div(class="flex items-center gap-3 mb-6")
        ui-clickable(
          tag="button"
          class="flex items-center justify-center w-7 h-7 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
          @click="$router.push({ name: 'AppAuth', query: { tab: 'virtual-keys' } })"
        )
          ui-icon(icon="arrow-left" :size="20")
        div(class="flex flex-col gap-0.5")
          div(v-if="key" class="flex items-center gap-2")
            h1(class="text-xl font-semibold text-gray-900") {{ key.name }}
            ui-status(:value="key?.isEnabled ?? false")
          div(v-else class="h-7 w-48 bg-gray-100 rounded animate-pulse")

    //- Body
    div(class="flex-1 overflow-y-auto min-h-0")
      div(class="max-w-screen-lg mx-auto px-4 pb-8 flex flex-col gap-6")
        div(v-if="loading" v-loading="true" class="py-20")

        template(v-else-if="key")
          //- Stats row
          div(class="grid grid-cols-2 md:grid-cols-4 gap-4")
            div(class="bg-white rounded-xl border border-gray-100 shadow-xs p-4 flex flex-col gap-1")
              ui-overline Requests
              p(class="text-2xl font-numeric font-bold text-gray-900 tabular-nums") {{ formatNumber(usage.requests || 0) }}
              p(v-if="key.maxRequests" class="text-xs text-gray-400")
                | of
                span(class="font-numeric tabular-nums") {{ formatNumber(key.maxRequests) }}
                |
                | limit
            div(class="bg-white rounded-xl border border-gray-100 shadow-xs p-4 flex flex-col gap-1")
              ui-overline Cost
              p(class="text-2xl font-numeric font-bold text-emerald-600 tabular-nums") ${{ formatCost(usage.costUsd) }}
              p(v-if="key.maxCostUsd" class="text-xs text-gray-400")
                | of
                span(class="font-numeric tabular-nums") ${{ key.maxCostUsd }}
                |
                | limit
            div(class="bg-white rounded-xl border border-gray-100 shadow-xs p-4 flex flex-col gap-1")
              ui-overline Tokens
              p(class="text-2xl font-numeric font-bold text-gray-900 tabular-nums") {{ formatNum(usage.totalTokens || 0) }}
            div(class="bg-white rounded-xl border border-gray-100 shadow-xs p-4 flex flex-col gap-1")
              ui-overline Period
              p(class="text-lg font-semibold text-gray-900 tabular-nums capitalize") {{ key.resetPeriod || 'No reset' }}
              p(class="text-xs text-gray-400") {{ periodLabel }}

          //- Recent logs
          section(class="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden")
            div(class="px-6 py-4 border-b border-gray-100")
              h2(class="text-sm font-semibold text-gray-700") Recent requests
            ui-table(:rows="logs" :columns="logColumns" :loading="logsLoading" empty-message="No requests in this period")
              template(#created-at="{ value }")
                span(class="text-xs text-gray-400 whitespace-nowrap") {{ formatDate(String(value)) }}
              template(#model-def-key="{ value }")
                span(class="font-mono text-xs text-gray-700") {{ value }}
              template(#status="{ value }")
                ui-badge(:variant="value === 'success' ? Variant.Green : Variant.Red" :size="Size.SM") {{ value }}
              template(#cost-usd="{ value }")
                span(class="font-numeric tabular-nums text-xs") {{ formatCurrency(value) }}
              template(#latency-ms="{ value }")
                span(class="font-numeric tabular-nums text-xs") {{ value }}ms
</template>

<script lang="ts">
import {
  HyperstrateApi,
  HyperstrateServerInternalModulesAuthDomainResetPeriod,
  HyperstrateServerInternalModulesObservabilityDomainInferenceLog,
  HyperstrateServerInternalModulesObservabilityDomainVirtualKeyUsage,
  InternalModulesAuthInterfacesHttpVirtualKeyResponse,
} from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Size, Variant } from '@/features/ui/clickables/model'
import { type Column } from '@/features/ui/table/model'
import { AsyncData } from '@/util/async-data.decorator'
import { formatAdaptiveCurrency, formatCompactNumber, formatCurrency, formatDate, formatNumber } from '@/util/format'
import { Mixins } from '@/util/mixin'
import { Component } from 'vue-facing-decorator'

type VKResponse = InternalModulesAuthInterfacesHttpVirtualKeyResponse
type VKUsage = HyperstrateServerInternalModulesObservabilityDomainVirtualKeyUsage
type InferenceLog = HyperstrateServerInternalModulesObservabilityDomainInferenceLog
const ResetPeriod = HyperstrateServerInternalModulesAuthDomainResetPeriod

const toISODate = (d: Date): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

@Component
export default class VirtualKeyView extends Mixins(ApiClientsMixin, LoadingMixin) {
  public Variant = Variant
  public Size = Size
  public readonly formatDate = formatDate
  public readonly formatCurrency = formatCurrency
  public readonly formatNumber = formatNumber

  public key?: VKResponse = undefined
  public usage: VKUsage = {}
  public logs: InferenceLog[] = []
  public logsLoading = false

  public readonly logColumns: Column[] = [
    { name: 'createdAt', label: 'Time', accessor: (r) => (r as InferenceLog).createdAt },
    { name: 'modelDefKey', label: 'Model', accessor: (r) => (r as InferenceLog).modelDefKey },
    { name: 'status', label: 'Status', accessor: (r) => (r as InferenceLog).status },
    { name: 'costUsd', label: 'Cost', accessor: (r) => (r as InferenceLog).costUsd, align: 'right' },
    { name: 'latencyMs', label: 'Latency', accessor: (r) => (r as InferenceLog).latencyMs, align: 'right' },
  ]

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  private get keyId(): string {
    return this.$route.params.id as string
  }

  private periodFrom(): string {
    const now = new Date()
    if (this.key?.resetPeriod === ResetPeriod.ResetPeriodDaily) return toISODate(now)
    return toISODate(new Date(now.getFullYear(), now.getMonth(), 1))
  }

  public get periodLabel(): string {
    if (this.key?.resetPeriod === ResetPeriod.ResetPeriodDaily) return 'Since midnight UTC'
    if (this.key?.resetPeriod === ResetPeriod.ResetPeriodMonthly) return 'Since start of month'
    return 'Since start of month'
  }

  public formatCost(v: number | undefined): string {
    return formatAdaptiveCurrency(v).slice(1)
  }

  public formatNum(v: number): string {
    return formatCompactNumber(v)
  }

  @AsyncData()
  public async asyncData(): Promise<AsyncData<VirtualKeyView>> {
    this.setLoading(true)
    try {
      const { data: key } = await this.api.authVirtualKeysIdGet({ id: this.keyId })
      const from = this.periodFrom()
      const to = toISODate(new Date())

      const [analyticsRes, logsRes] = await Promise.allSettled([
        this.api.analyticsVirtualKeysGet({ from, to }),
        this.api.analyticsInferenceLogsGet({ virtualKeyId: this.keyId, from, to, perPage: 50 }),
      ])

      const usageList = analyticsRes.status === 'fulfilled' ? (analyticsRes.value.data.data ?? []) : []
      const usage = usageList.find((u) => u.virtualKeyId === this.keyId) ?? {}
      const logs = logsRes.status === 'fulfilled' ? (logsRes.value.data.items ?? []) : []

      return { key, usage, logs }
    } finally {
      this.setLoading(false)
    }
  }
}
</script>
