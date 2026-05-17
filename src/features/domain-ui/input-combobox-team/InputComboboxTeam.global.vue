<template lang="pug">
ui-input-combobox(
  v-model="model"
  :options="options"
  :loading="loading"
  :multiple="multiple"
  :filter-function="filterFn"
  @search="onSearch"
  @scrolled-to-bottom="onLoadMore"
)
</template>

<script lang="ts">
import { HyperstrateApi, HyperstrateServerInternalModulesAuthApplicationTeamResponse } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { InputComboboxSearch, SearchFnArgs, SearchFnReturnType } from '@/features/ui/inputs/InputComboboxSearch'
import { Mixins } from '@/util/mixin'
import { Component } from 'vue-facing-decorator'

type TeamResponse = HyperstrateServerInternalModulesAuthApplicationTeamResponse

@Component
export default class InputComboboxTeam extends Mixins(ApiClientsMixin, InputComboboxSearch<TeamResponse>) {
  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  protected async searchFn(args: SearchFnArgs): Promise<SearchFnReturnType<TeamResponse>> {
    const { data } = await this.api.authTeamsGet({ page: args.page, perPage: args.perPage, query: args.search })
    return { items: data.items, meta: data.meta }
  }

  protected getOptionLabel(item: TeamResponse): string {
    return item.name
  }

  protected getOptionId(item: TeamResponse): string {
    return item.id
  }

  protected async getInitialValue(id: string): Promise<TeamResponse | undefined> {
    const { data } = await this.api.authTeamsIdGet({ id })
    return data
  }
}
</script>
