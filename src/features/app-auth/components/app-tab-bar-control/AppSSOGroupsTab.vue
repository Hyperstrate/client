<template lang="pug">
div(class="flex flex-col gap-4")
  div(class="flex flex-col gap-2")
    div(class="flex items-center justify-between gap-3")
      span(class="flex items-center gap-1.5 text-sm font-semibold text-gray-800")
        span OIDC Group
        ui-icon(icon="arrow-right" :size="14" class="text-gray-300")
        span Team Mappings
      ui-button(:size="Size.SM" @click="showCreate = true")
        template(#before)
          ui-icon(icon="plus" :size="16")
        | Add Mapping
    span(class="text-xs text-gray-400 -mt-2") Users are auto-enrolled in the mapped team when their OIDC token contains the matching group claim

  div(v-if="showCreate" class="border border-indigo-200 rounded-xl bg-indigo-50 p-4 flex flex-col gap-3")
    div(class="flex items-center gap-2")
      div(class="flex flex-col gap-1 flex-1 min-w-0")
        ui-label(required) Group name (from JWT)
        ui-input-text(v-model="newGroupName" placeholder="e.g. engineering")
      ui-icon(icon="arrow-right" :size="16" class="text-gray-300 mt-4 shrink-0")
      div(class="flex flex-col gap-1 flex-1 min-w-0")
        ui-label(required) Team
        domain-ui-input-combobox-team(v-model="newTeamOption" placeholder="Select a team…")
      ui-icon-button(icon="close" :icon-size="16" :size="Size.SM" :variant="Variant.Gray" class="mt-4 shrink-0 !text-red-600" @click="cancelCreate")
    div(class="flex items-center justify-end")
      ui-button(:size="Size.SM" :busy="createBusy" :disabled="!newGroupName.trim() || !newTeamOption" @click="createMapping") Add mapping

  div(v-if="loading" class="text-xs text-gray-400 py-4 text-center") Loading…
  ui-empty-state(
    v-else-if="!mappings.length && !showCreate"
    heading="No group mappings"
    subheading="Add a mapping to auto-enroll OIDC users into teams based on their groups claim."
  )
  div(v-else class="flex flex-col gap-2")
    div(v-for="m in mappings" :key="m.id" class="flex items-center justify-between gap-3 px-4 py-3 bg-white rounded-xl border border-gray-100")
      div(class="flex items-center gap-3 text-sm")
        span(class="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-700") {{ m.groupName }}
        ui-icon(icon="arrow-right" :size="16" class="text-gray-300")
        span(class="text-gray-700") {{ m.teamId }}
      domain-ui-confirm-delete-modal(:name="m.groupName" @confirm="deleteMapping(m.id ?? '')")
        template(#trigger)
          ui-icon-button(icon="trash" :size="Size.SM" :icon-size="20" :variant="Variant.Gray")
</template>

<script lang="ts">
import type { HyperstrateServerInternalModulesAuthDomainOIDCGroupMapping } from '@/__generated__/hyperstrate-api'
import { HyperstrateApi } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Size, Variant } from '@/features/ui/clickables/model'
import { AsyncData } from '@/util/async-data.decorator'
import { Mixins } from '@/util/mixin'
import { Component } from 'vue-facing-decorator'
import { type Option } from '@/features/ui/inputs/model'

type Mapping = HyperstrateServerInternalModulesAuthDomainOIDCGroupMapping

@Component
export default class AppSSOGroupsTab extends Mixins(ApiClientsMixin) {
  public readonly Size = Size
  public readonly Variant = Variant

  public mappings: Mapping[] = []
  public loading = false
  public showCreate = false
  public newGroupName = ''
  public newTeamOption?: Option<{ id: string }> = undefined
  public createBusy = false

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  @AsyncData()
  public async asyncData(): Promise<AsyncData<AppSSOGroupsTab>> {
    this.loading = true
    try {
      const { data } = await this.api.authOidcGroupMappingsGet()
      return { mappings: data.data ?? [] }
    } finally {
      this.loading = false
    }
  }

  public cancelCreate(): void {
    this.showCreate = false
    this.newGroupName = ''
    this.newTeamOption = undefined
  }

  public async createMapping(): Promise<void> {
    if (!this.newGroupName.trim() || !this.newTeamOption || this.createBusy) return
    this.createBusy = true
    try {
      await this.api.authOidcGroupMappingsPost({
        body: { groupName: this.newGroupName.trim(), teamId: this.newTeamOption.value.id },
      })
      this.cancelCreate()
      await this.asyncData()
    } finally {
      this.createBusy = false
    }
  }

  public async deleteMapping(id: string): Promise<void> {
    if (!id) return
    await this.api.authOidcGroupMappingsIdDelete({ id })
    await this.asyncData()
  }
}
</script>
