<template lang="pug">
div(class="flex flex-col gap-4")
  div(class="flex flex-col gap-1.5")
    div(class="flex items-center justify-between")
      ui-label MCP Servers
      router-link(to="/mcp/servers" class="text-xs text-indigo-600 hover:underline" target="_blank") Manage ↗
    div(v-if="loading" class="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2.5") Loading…
    div(v-else-if="servers.length === 0" class="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2.5")
      | No MCP servers configured.
      router-link(to="/mcp/servers" class="text-indigo-600 hover:underline ml-1") Create one first.
    div(v-else class="flex flex-col gap-1")
      div(
        v-for="server in servers"
        :key="server.id"
        class="rounded-lg border border-gray-200 px-3 py-2.5 has-[input:checked]:border-indigo-300 has-[input:checked]:bg-indigo-50 hover:bg-gray-50 transition-colors"
      )
        ui-form-field(input="ui-input-checkbox" :path="'mcpEnabled.' + server.id" :field-props="{ class: 'contents' }")
          template(#inputLabel)
            div(class="flex items-center gap-2 flex-1 min-w-0")
              div(class="flex-1 min-w-0")
                span(class="block text-xs font-medium text-gray-800 truncate") {{ server.name }}
                span(class="block text-xs text-gray-400 truncate") {{ server.url }}
              ui-badge(v-if="server.authType && server.authType !== 'none'" :variant="Variant.Green" class="shrink-0") {{ server.authType }}
  div(class="flex flex-col gap-1.5")
    ui-form-field(input="ui-input-text" path="mcpMaxTurns" label="Max turns (default 10)" placeholder="10")
    p(class="text-xs text-gray-400") Maximum tool-call / re-infer iterations before returning
  div(class="rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-3 flex flex-col gap-3")
    ui-form-field(input="ui-input-checkbox" path="mcpRequireApproval" label="Require per-request approval")
    div(class="grid grid-cols-2 gap-3")
      ui-form-field(input="ui-input-textarea" path="mcpAllowedTools" label="Allowed tools" placeholder="shell.run\nrepo.search" :input-props="{ rows: 3 }")
      ui-form-field(input="ui-input-textarea" path="mcpBlockedTools" label="Blocked tools" placeholder="shell.rm\nsecrets.read" :input-props="{ rows: 3 }")
    ui-form-field(input="domain-ui-input-combobox-team" path="mcpAllowedTeams" label="Allowed teams" multiple placeholder="Select a team…")
</template>

<script lang="ts">
import { HyperstrateApi, HyperstrateServerInternalModulesAiApplicationMCPServerResponse } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Variant } from '@/features/ui/clickables/model'
import { Mixins } from '@/util/mixin'
import { Component } from 'vue-facing-decorator'

type MCPServer = HyperstrateServerInternalModulesAiApplicationMCPServerResponse

@Component
export default class FeatureMCPTools extends Mixins(ApiClientsMixin) {
  public Variant = Variant
  public servers: MCPServer[] = []
  public loading = false

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  public async created(): Promise<void> {
    this.loading = true
    try {
      const { data } = await this.api.aiMcpServersGet()
      this.servers = data
    } finally {
      this.loading = false
    }
  }
}
</script>
