<template lang="pug">
div(class="flex flex-col")
  div(class="flex items-center gap-2 px-3 py-2.5 cursor-grab active:cursor-grabbing")
    slot(name="drag-handle")
    div(class="w-1.5 h-1.5 rounded-full shrink-0" :class="feature.isEnabled ? 'bg-purple-500' : 'bg-gray-300'")
    div(class="flex-1 min-w-0")
      p(class="text-xs font-medium text-gray-800 truncate") {{ label }}
      p(v-if="serverCount > 0" class="text-xs text-gray-400 truncate")
        span(class="font-numeric tabular-nums") {{ serverCount }}
        |
        | server{{ serverCount !== 1 ? 's' : '' }} configured
      p(v-if="governanceSummary" class="text-xs text-gray-400 truncate") {{ governanceSummary }}
    ui-clickable(
      tag="button"
      class="text-xs text-indigo-600 hover:text-indigo-800 px-1.5 py-0.5 rounded hover:bg-indigo-50 transition-colors shrink-0"
      @click.stop="toggleTools"
    ) {{ toolsOpen ? 'Hide tools' : 'View tools' }}
    slot(name="actions")

  div(v-if="toolsOpen" class="border-t border-gray-100 px-3 py-2.5 bg-gray-50")
    div(v-if="loading" class="text-xs text-gray-400 py-1") Fetching tools…
    div(v-else-if="errorMsg" class="text-xs text-red-500 py-1") {{ errorMsg }}
    div(v-else-if="!groups.length" class="text-xs text-gray-400 py-1") No tools returned
    div(v-else class="flex flex-col gap-2")
      div(v-for="group in groups" :key="group.serverId" class="flex flex-col gap-1")
        p(class="text-xs font-medium text-gray-600") {{ group.serverName || group.serverUrl }}
        div(class="flex flex-wrap gap-1")
          ui-tooltip(v-for="tool in group.tools ?? []" :key="tool.name" :content="tool.description || tool.name")
            ui-badge(:variant="Variant.Gray" class="cursor-default") {{ tool.name }}
        p(v-if="!(group.tools ?? []).length" class="text-xs text-gray-400 italic") No tools on this server
</template>

<script lang="ts">
import {
  HyperstrateApi,
  HyperstrateServerInternalModulesRouterApplicationMCPServerTools,
  HyperstrateServerInternalModulesRouterApplicationRouterFeatureResponse,
  HyperstrateServerInternalModulesRouterDomainRouterFeatureType as FT,
} from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { routerFeatureConfig } from '@/features/app-router/feature-config'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Variant } from '@/features/ui/clickables/model'
import { Mixins } from '@/util/mixin'
import { Component } from 'vue-facing-decorator'
import { RequiredProp, StringProp } from '@/util/prop-decorators'

type RouterFeature = HyperstrateServerInternalModulesRouterApplicationRouterFeatureResponse
type MCPServerTools = HyperstrateServerInternalModulesRouterApplicationMCPServerTools

@Component
export default class FeatureChipMCPTools extends Mixins(ApiClientsMixin) {
  public readonly Variant = Variant

  @StringProp(true)
  public readonly label!: string

  @RequiredProp()
  public readonly feature!: RouterFeature

  @StringProp(true)
  public readonly routerId!: string

  public toolsOpen = false
  public loading = false
  public errorMsg?: string = undefined
  public groups: MCPServerTools[] = []

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  public get serverCount(): number {
    const ids = routerFeatureConfig<FT.FeatureMCPTools>(this.feature).server_ids
    return ids?.length ?? 0
  }

  public get governanceSummary(): string {
    const cfg = routerFeatureConfig<FT.FeatureMCPTools>(this.feature)
    const parts: string[] = []
    if (cfg.require_approval) parts.push('approval')
    const allowed = cfg.allowed_tools?.length ?? 0
    const blocked = cfg.blocked_tools?.length ?? 0
    const teams = cfg.allowed_team_ids?.length ?? 0
    if (allowed) parts.push(`${allowed} allowed`)
    if (blocked) parts.push(`${blocked} blocked`)
    if (teams) parts.push(`${teams} teams`)
    return parts.join(' · ')
  }

  public async toggleTools(): Promise<void> {
    if (this.toolsOpen) {
      this.toolsOpen = false
      return
    }

    this.toolsOpen = true
    this.loading = true
    this.errorMsg = undefined
    this.groups = []

    try {
      const { data } = await this.api.routerIdFeaturesFeatureIdMcpToolsGet({
        id: this.routerId,
        featureId: this.feature.id,
      })
      this.groups = data
    } catch (err: unknown) {
      this.errorMsg = err instanceof Error ? err.message : 'Failed to fetch tools'
    } finally {
      this.loading = false
    }
  }
}
</script>
