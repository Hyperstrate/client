<template lang="pug">
ui-layout(use="core-default-layout")
  div(class="h-full flex flex-col")
    //- Header with date/granularity controls
    div(class="max-w-screen-xl w-full mx-auto px-8 pt-8 pb-0 shrink-0")
      div(class="flex items-end justify-between gap-4 pb-4")
        div(class="flex flex-col gap-0.5")
          h1(class="text-xl font-semibold text-gray-900") Analytics
          p(class="text-sm text-gray-400") Inference usage, cost, and performance across all models and routers
        div(class="flex items-center gap-2 shrink-0")
          ui-input-select(:model-value="granularityOption" :options="granularityOptions" @update:model-value="onGranularityChange")
          input(
            v-model="from"
            type="date"
            class="text-sm border border-gray-200 rounded-md px-2.5 py-1.5 bg-white text-gray-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400"
          )
          span(class="text-gray-300 text-sm") –
          input(
            v-model="to"
            type="date"
            class="text-sm border border-gray-200 rounded-md px-2.5 py-1.5 bg-white text-gray-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400"
          )

    //- Tab bar
    div(class="max-w-screen-xl w-full mx-auto px-8 shrink-0")
      ui-tab-bar(:model-value="activeTab" @update:model-value="onTabChange")
        ui-tab-button(value="overview") Overview
        ui-tab-button(value="traffic") Traffic
        ui-tab-button(value="agents") Agents
        ui-tab-button(value="performance") Performance
        ui-tab-button(value="logs") Logs
        ui-tab-button(value="audit") Audit

    //- Tab content
    div(class="flex-1 overflow-y-auto min-h-0")
      div(class="max-w-screen-xl mx-auto px-8 py-6 flex flex-col gap-6")
        //- Overview: stat cards + cache + model charts
        template(v-if="activeTab === 'overview'")
          app-analytics-overview-control(:from="from" :to="to" :granularity="granularity")
          app-analytics-cache-stats-control(:from="from" :to="to")
          app-analytics-model-charts-control(:from="from" :to="to")

        //- Traffic: routers + virtual key usage
        template(v-else-if="activeTab === 'traffic'")
          app-analytics-router-breakdown-control(:from="from" :to="to")
          app-analytics-virtual-key-usage-control(:from="from" :to="to")

        //- Agents: coding-agent session tracking and turn logs
        template(v-else-if="activeTab === 'agents'")
          app-analytics-agent-sessions-control(:from="from" :to="to")

        //- Performance: latency + provider health + errors
        template(v-else-if="activeTab === 'performance'")
          app-analytics-latency-control(:from="from" :to="to")
          app-analytics-provider-health-control
          app-analytics-errors-control

        //- Logs: full-page inference log table
        template(v-else-if="activeTab === 'logs'")
          app-analytics-inference-logs-control(:from="from" :to="to")

        //- Audit: admin action log
        template(v-else-if="activeTab === 'audit'")
          app-analytics-audit-log-control
</template>

<script lang="ts">
import { Component } from 'vue-facing-decorator'
import { Mixins } from '@/util/mixin'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { type Option } from '@/features/ui/inputs/model'
import { GRANULARITY_OPTIONS, type Granularity } from '../../model'

const toISODate = (d: Date): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const queryDate = (value: unknown, fallback: string): string => (typeof value === 'string' && DATE_RE.test(value) ? value : fallback)

const VALID_TABS = ['overview', 'traffic', 'agents', 'performance', 'logs', 'audit'] as const
type Tab = (typeof VALID_TABS)[number]

@Component
export default class AppView extends Mixins(ApiClientsMixin) {
  public from = toISODate(new Date(Date.now() - 30 * 86_400_000))
  public to = toISODate(new Date())
  public granularity: Granularity = 'day'
  public readonly granularityOptions = GRANULARITY_OPTIONS

  public created(): void {
    this.from = queryDate(this.$route.query.from, this.from)
    this.to = queryDate(this.$route.query.to, this.to)
  }

  public get activeTab(): Tab {
    const q = this.$route.query.tab
    return VALID_TABS.includes(q as Tab) ? (q as Tab) : 'overview'
  }

  public onTabChange(tab: string): void {
    void this.$router.replace({ query: { ...this.$route.query, tab } })
  }

  public get granularityOption(): Option<Granularity> | undefined {
    return GRANULARITY_OPTIONS.find((o) => o.value === this.granularity)
  }

  public onGranularityChange(option: Option<Granularity>): void {
    this.granularity = option.value
  }
}
</script>
