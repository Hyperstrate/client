<template lang="pug">
div(class="h-full flex flex-col gap-4")
  div(class="flex justify-between items-center shrink-0")
    span(class="text-sm font-semibold text-gray-700") Teams
    app-auth-create-team-modal(@created="onCreated")
      template(#trigger)
        ui-button(:size="Size.SM")
          template(#before)
            ui-icon(icon="plus" :size="16")
          | New Team

  div(class="flex-1 overflow-y-auto min-h-0")
    div(v-if="loading" v-loading="true")
    div(v-else-if="items.length === 0" class="py-12 text-center")
      div(class="flex flex-col gap-1")
        p(class="text-gray-400 font-medium") No teams yet
        p(class="text-gray-400 text-sm") Teams share a budget ceiling across all their members' virtual keys.
    div(v-else class="flex flex-col gap-3")
      ui-clickable(
        v-for="team in items"
        :key="team.id"
        tag="button"
        class="w-full text-left bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-4 hover:border-indigo-200 hover:shadow-xs transition-all"
        @click="$router.push({ name: 'AppAuth/Team', params: { id: team.id } })"
      )
        div(class="min-w-0 flex-1 flex flex-col gap-1.5")
          div(class="flex items-center gap-2")
            span(class="text-sm font-semibold text-gray-900 truncate") {{ team.name }}
            ui-status(:value="team.isEnabled")
          p(v-if="team.description" class="text-xs text-gray-400") {{ team.description }}
          div(class="flex gap-4 text-xs text-gray-500")
            span Max Requests: {{ team.maxRequests || '∞' }}
            span Max Cost: {{ team.maxCostUsd ? '$' + team.maxCostUsd : '∞' }}
        div(class="flex items-center gap-2 shrink-0" @click.stop)
          ui-button(:size="Size.SM" :variant="Variant.Gray" @click="toggleItem(team)") {{ team.isEnabled ? 'Disable' : 'Enable' }}
          domain-ui-confirm-delete-modal(:name="team.name || 'team'" @confirm="deleteItem(team.id)")
            template(#trigger)
              ui-button(:size="Size.SM" :variant="Variant.Red" outlined) Delete
  div(v-if="!loading && items.length > 0" class="shrink-0 pt-3 border-t border-gray-100")
    ui-pagination(v-model="page" :pages="pages" :per-page="perPage" :total="total" @update:per-page="onPerPageChange")
</template>

<script lang="ts">
import {
  HyperstrateApi,
  HyperstrateServerInternalModulesAuthApplicationTeamResponse,
  HyperstrateServerInternalSharedPaginationPaginatedMeta,
} from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import { PaginationMixin } from '@/features/core/components/mixins/pagination.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Size, Variant } from '@/features/ui/clickables/model'
import { AsyncData } from '@/util/async-data.decorator'
import { Mixins } from '@/util/mixin'
import { Component, Watch } from 'vue-facing-decorator'

type TeamResponse = HyperstrateServerInternalModulesAuthApplicationTeamResponse

@Component
export default class AppTeamsTab extends Mixins(ApiClientsMixin, LoadingMixin, PaginationMixin) {
  public Variant = Variant
  public Size = Size

  public items: TeamResponse[] = []
  public meta?: HyperstrateServerInternalSharedPaginationPaginatedMeta
  protected pageSize = 10

  protected get total(): number {
    return this.meta?.total ?? 0
  }

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  @Watch('page')
  protected async onPageChange(): Promise<void> {
    await this.asyncData()
  }

  @AsyncData()
  public async asyncData(): Promise<AsyncData<AppTeamsTab>> {
    this.setLoading(true)
    try {
      const { data } = await this.api.authTeamsGet({ page: this.page, perPage: this.perPage })
      return { items: data.items, meta: data.meta }
    } finally {
      this.setLoading(false)
    }
  }

  public onPerPageChange(value: number): void {
    this.pageSize = value
    this.page = 1
    void this.asyncData()
  }

  public onCreated(team: TeamResponse): void {
    this.items = [team, ...this.items]
  }

  public async toggleItem(team: TeamResponse): Promise<void> {
    if (!team.id) return
    const { data: updated } = await this.api.authTeamsIdPatch({ id: team.id, body: { isEnabled: !team.isEnabled } })
    this.items = this.items.map((t) => (t.id === updated.id ? updated : t))
  }

  public async deleteItem(id: string | undefined): Promise<void> {
    if (!id) return
    await this.api.authTeamsIdDelete({ id })
    await this.asyncData()
  }
}
</script>
