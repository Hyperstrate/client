<template lang="pug">
ui-layout(use="core-default-layout")
  div(class="h-full flex flex-col")
    div(class="max-w-screen-lg w-full mx-auto px-4 pt-8 pb-4 shrink-0")
      domain-ui-page-header(title="MCP Servers" subtitle="Managed Model Context Protocol servers reusable across all routers")
        template(#actions)
          app-mcp-create-mcp-server-modal(@created="onCreated")
            template(#trigger)
              ui-button(:size="Size.SM")
                ui-icon(icon="plus" size="16")
                | New Server

    div(class="flex-1 overflow-y-auto min-h-0")
      div(class="max-w-screen-lg mx-auto px-4 pb-6")
        div(v-if="loading" v-loading="loading" class="py-20")

        ui-empty-state(v-else-if="items.length === 0" heading="No MCP servers yet" subheading="Create a server to attach it to router features.")

        div(v-else class="grid gap-3 pt-2")
          div(v-for="server in items" :key="server.id" class="bg-white rounded-xl border border-gray-200 p-5")
            div(class="flex items-start justify-between gap-4")
              div(class="flex flex-col gap-1 min-w-0")
                div(class="flex items-center gap-2")
                  h2(class="text-sm font-semibold text-gray-900 truncate") {{ server.name }}
                  ui-badge(:variant="authTypePillVariant(server.authType)") {{ authTypeLabel(server.authType) }}
                p(class="text-xs text-gray-500 truncate") {{ server.url }}
                p(v-if="server.description" class="text-xs text-gray-400 truncate") {{ server.description }}

              div(class="flex items-center gap-2 shrink-0")
                ui-badge(:variant="Variant.Gray" class="whitespace-nowrap") {{ server.timeoutSecs }}s timeout
                domain-ui-confirm-delete-modal(
                  :name="server.name || 'server'"
                  description="This MCP server will be removed. Any router features referencing it will stop working."
                  @confirm="deleteServer(server.id)"
                )
                  template(#trigger)
                    ui-button(:variant="Variant.Red" :outlined="true" :size="Size.XS") Delete
</template>

<script lang="ts">
import { HyperstrateApi, HyperstrateServerInternalModulesAiApplicationMCPServerResponse } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Size, Variant } from '@/features/ui/clickables/model'
import { AsyncData } from '@/util/async-data.decorator'
import { Mixins } from '@/util/mixin'
import { Component } from 'vue-facing-decorator'

type MCPServer = HyperstrateServerInternalModulesAiApplicationMCPServerResponse

@Component
export default class AppView extends Mixins(ApiClientsMixin, LoadingMixin) {
  public items: MCPServer[] = []
  public Variant = Variant
  public Size = Size

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  @AsyncData()
  public async asyncData(): Promise<AsyncData<AppView>> {
    this.setLoading(true)
    try {
      const { data } = await this.api.aiMcpServersGet()
      return { items: data }
    } finally {
      this.setLoading(false)
    }
  }

  public async onCreated(): Promise<void> {
    await this.asyncData()
  }

  public async deleteServer(id: string | undefined): Promise<void> {
    if (!id) return
    try {
      await this.api.aiMcpServersServerIdDelete({ serverId: id })
      this.items = this.items.filter((s) => s.id !== id)
    } catch (err) {
      console.error('Failed to delete MCP server', err)
    }
  }

  public authTypeLabel(authType?: string): string {
    return (
      {
        none: 'No auth',
        bearer: 'Bearer',
        api_key: 'API key',
      }[authType ?? 'none'] ??
      authType ??
      'none'
    )
  }

  public authTypePillVariant(authType?: string): Variant {
    if (authType === 'bearer' || authType === 'api_key') return Variant.Green
    return Variant.Gray
  }
}
</script>
