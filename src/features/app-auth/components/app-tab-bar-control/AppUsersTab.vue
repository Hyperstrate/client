<template lang="pug">
div(class="h-full flex flex-col")
  div(class="flex-1 overflow-y-auto min-h-0")
    div(v-if="loading" v-loading="true")
    div(v-else-if="items.length === 0" class="py-12 text-center")
      div(class="flex flex-col gap-1")
        p(class="text-gray-400 font-medium") No users yet
        p(class="text-gray-400 text-sm") Users appear here after their first SSO login.
    div(v-else class="flex flex-col gap-3")
      div(v-for="user in items" :key="user.id" class="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-4")
        div(class="flex items-center gap-3 min-w-0 flex-1")
          img(v-if="user.avatar" :src="user.avatar" class="w-8 h-8 rounded-full object-cover shrink-0")
          div(class="min-w-0")
            div(class="text-sm font-semibold text-gray-900 truncate") {{ user.name || user.email }}
            div(class="text-xs text-gray-400 truncate") {{ user.email }}
        div(class="flex items-center gap-2 shrink-0")
          ui-input-select(:model-value="roleOption(user.role)" :options="roleOptions" :size="Size.SM" @update:model-value="onRoleChange(user, $event)")
  div(v-if="!loading && items.length > 0" class="shrink-0 pt-3 border-t border-gray-100")
    ui-pagination(v-model="page" :pages="pages" :per-page="perPage" :total="total" @update:per-page="onPerPageChange")
</template>

<script lang="ts">
import {
  HyperstrateApi,
  HyperstrateServerInternalModulesAuthApplicationUserResponse,
  HyperstrateServerInternalModulesAuthDomainUserRole,
  HyperstrateServerInternalSharedPaginationPaginatedMeta,
} from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import { PaginationMixin } from '@/features/core/components/mixins/pagination.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { type Option } from '@/features/ui/inputs/model'
import { AsyncData } from '@/util/async-data.decorator'
import { Mixins } from '@/util/mixin'
import { Component, Watch } from 'vue-facing-decorator'
import { USER_ROLE_OPTIONS } from '../../model'
import { Size } from '@/features/ui/clickables/model'

type UserResponse = HyperstrateServerInternalModulesAuthApplicationUserResponse
type UserRole = HyperstrateServerInternalModulesAuthDomainUserRole

@Component
export default class AppUsersTab extends Mixins(ApiClientsMixin, LoadingMixin, PaginationMixin) {
  public roleOptions = USER_ROLE_OPTIONS
  private readonly Size = Size
  public items: UserResponse[] = []
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
  public async asyncData(): Promise<AsyncData<AppUsersTab>> {
    this.setLoading(true)
    try {
      const { data } = await this.api.authUsersGet({ page: this.page, perPage: this.perPage })
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

  public roleOption(role: UserRole): Option<UserRole> | undefined {
    return USER_ROLE_OPTIONS.find((o) => o.value === role)
  }

  public onRoleChange(user: UserResponse, option: Option<UserRole>): void {
    void this.updateRole(user, option.value)
  }

  public async updateRole(user: UserResponse, role: UserRole): Promise<void> {
    if (!user.id) return
    await this.api.authUsersIdPatch({ id: user.id, body: { role } })
    void this.asyncData()
  }
}
</script>
