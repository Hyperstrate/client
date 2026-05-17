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
import { HyperstrateApi, HyperstrateServerInternalModulesRouterApplicationRouterResponse } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { InputComboboxSearch, SearchFnArgs, SearchFnReturnType } from '@/features/ui/inputs/InputComboboxSearch'
import { Mixins } from '@/util/mixin'
import { Component } from 'vue-facing-decorator'

@Component
export default class InputComboboxRouter extends Mixins(ApiClientsMixin, InputComboboxSearch<HyperstrateServerInternalModulesRouterApplicationRouterResponse>) {
  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  protected async searchFn(args: SearchFnArgs): Promise<SearchFnReturnType<HyperstrateServerInternalModulesRouterApplicationRouterResponse>> {
    const { data } = await this.api.routerGet({ page: args.page, perPage: args.perPage, query: args.search })
    return { items: data.items, meta: data.meta }
  }

  protected getOptionLabel(item: HyperstrateServerInternalModulesRouterApplicationRouterResponse): string {
    return item.name ?? item.id
  }

  protected getOptionId(item: HyperstrateServerInternalModulesRouterApplicationRouterResponse): string {
    return item.id
  }

  protected async getInitialValue(id: string): Promise<HyperstrateServerInternalModulesRouterApplicationRouterResponse | undefined> {
    const { data } = await this.api.routerIdGet({ id })
    return data
  }
}
</script>
