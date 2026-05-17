<template lang="pug">
section(class="bg-white rounded-xl border border-gray-100 shadow-xs p-6 flex flex-col gap-4")
  h2(class="text-sm font-semibold text-gray-700") Cache performance
  div(v-if="loading" v-loading="true" class="h-16")
  div(v-else-if="stats" class="grid grid-cols-2 md:grid-cols-4 gap-4")
    div(class="flex flex-col gap-1")
      span(class="text-xs text-gray-400") Total requests
      span(class="text-xl font-numeric font-bold tabular-nums text-gray-900") {{ formatNumber(stats.totalRequests) }}
    div(class="flex flex-col gap-1")
      span(class="text-xs text-gray-400") Cache hits
      span(class="text-xl font-numeric font-bold tabular-nums text-indigo-600") {{ formatNumber(stats.cacheHits) }}
    div(class="flex flex-col gap-1")
      span(class="text-xs text-gray-400") Hit rate
      span(class="text-xl font-numeric font-bold tabular-nums" :class="stats.hitRatePct > 20 ? 'text-green-600' : 'text-gray-700'")
        | {{ formatPercent(stats.hitRatePct) }}
    div(class="flex flex-col gap-1")
      span(class="text-xs text-gray-400") Exact / semantic
      span(class="text-xl font-numeric font-bold tabular-nums text-gray-700") {{ stats.exactHits }} / {{ stats.semanticHits }}
  p(v-else class="text-sm text-gray-400") No cache data for this period
</template>

<script lang="ts">
import { Component, Watch } from 'vue-facing-decorator'
import { StringProp } from '@/util/prop-decorators'
import { Mixins } from '@/util/mixin'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import { AsyncData } from '@/util/async-data.decorator'
import { formatNumber, formatPercent } from '@/util/format'
import { HyperstrateApi } from '@/__generated__/hyperstrate-api'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'

interface CacheStats {
  totalRequests: number
  cacheHits: number
  exactHits: number
  semanticHits: number
  hitRatePct: number
}

@Component
export default class CacheStatsControl extends Mixins(ApiClientsMixin, LoadingMixin) {
  @StringProp(true)
  public readonly from!: string

  @StringProp(true)
  public readonly to!: string

  public stats?: CacheStats = undefined
  public readonly formatNumber = formatNumber
  public readonly formatPercent = formatPercent

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  @Watch('from')
  @Watch('to')
  public onFiltersChange(): void {
    void this.asyncData()
  }

  @AsyncData()
  public async asyncData(): Promise<AsyncData<CacheStatsControl>> {
    this.setLoading(true)
    try {
      const { data } = await this.api.analyticsCacheGet({ from: this.from, to: this.to })
      return { stats: data as CacheStats }
    } finally {
      this.setLoading(false)
    }
  }
}
</script>
