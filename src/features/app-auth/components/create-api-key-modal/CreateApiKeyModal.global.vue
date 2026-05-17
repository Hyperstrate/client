<template lang="pug">
ui-modal(ref="modalRef")
  template(#trigger="props")
    slot(name="trigger" v-bind="props")

  template(#default)
    div(class="w-full")
      div(class="px-6 pt-6 pb-4 border-b border-gray-100")
        div(class="flex flex-col gap-0.5")
          h2(class="text-base font-semibold text-gray-900") Create API Key
          p(class="text-sm text-gray-500") Scope a bearer key to a router or globally

      //- ── Form state ───────────────────────────────────────────────────────
      div(v-if="!createdKey")
        ui-form(v-slot="{ dirty, validated, submit, busy, apiError }" :validation="CreateApiKeyFormData" :action="doSubmit" no-reset)
          div(class="flex flex-col gap-4 px-6 py-5")
            div(class="flex flex-col gap-1.5")
              span(class="text-sm font-medium text-gray-700") Scope
              div(class="flex gap-2")
                ui-button(
                  type="button"
                  :variant="scope === HyperstrateServerInternalModulesAuthDomainAPIKeyScope.APIKeyScopeGlobal ? Variant.Dark : Variant.Gray"
                  class="flex-1"
                  @click="scope = HyperstrateServerInternalModulesAuthDomainAPIKeyScope.APIKeyScopeGlobal"
                ) Global
                ui-button(
                  type="button"
                  :variant="scope === HyperstrateServerInternalModulesAuthDomainAPIKeyScope.APIKeyScopeRouter ? Variant.Dark : Variant.Gray"
                  class="flex-1"
                  @click="scope = HyperstrateServerInternalModulesAuthDomainAPIKeyScope.APIKeyScopeRouter"
                ) Router
            ui-form-field(input="ui-input-text" path="name" label="Name" placeholder="e.g. production-key" required)
            ui-form-field(input="domain-ui-input-combobox-team" path="team" label="Team" placeholder="Team this key belongs to" required)
            ui-form-field(input="ui-input-text" path="description" label="Description" placeholder="Optional description")
            ui-form-field(
              v-if="scope === HyperstrateServerInternalModulesAuthDomainAPIKeyScope.APIKeyScopeRouter"
              input="domain-ui-input-combobox-router"
              path="router"
              label="Router"
              placeholder="Router to scope this key to"
            )
            ui-form-field(input="ui-input-text" path="expiresAt" label="Expires At" type="datetime-local")

          div(class="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100")
            p(v-if="apiError" class="text-sm text-red-600 flex-1") {{ apiError }}
            ui-button(type="button" :variant="Variant.Gray" @click="close") Cancel
            ui-button(type="button" :disabled="!dirty || !validated" :busy="busy" @click="submit") Create Key

      //- ── Success state ────────────────────────────────────────────────────
      div(v-else)
        div(class="flex flex-col gap-4 px-6 py-5")
          div(class="flex flex-col gap-1.5")
            div(class="flex items-center gap-2")
              div(class="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0")
                ui-icon(icon="check" class="text-green-600" :size="12")
              span(class="text-sm font-medium text-gray-900") Key created successfully
            p(class="text-xs text-gray-500") Copy the plaintext key now — it will not be shown again.
          div(class="rounded-lg bg-gray-50 border border-gray-200 p-3 text-xs font-mono break-all text-gray-800 select-all")
            | {{ createdKey.key }}

        div(class="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100")
          ui-button(v-clipboard="createdKey?.key ?? ''" :variant="Variant.Gray") Copy key
          ui-button(@click="close") Done
</template>

<script lang="ts">
import {
  HyperstrateApi,
  HyperstrateServerInternalModulesAuthApplicationTeamResponse,
  HyperstrateServerInternalModulesAuthDomainAPIKeyScope,
  HyperstrateServerInternalModulesRouterApplicationRouterResponse,
  InternalModulesAuthInterfacesHttpAPIKeyCreatedResponse,
} from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Variant } from '@/features/ui/clickables/model'
import { type Option } from '@/features/ui/inputs/model'
import Modal from '@/features/ui/modal/Modal.global.vue'
import { Mixins } from '@/util/mixin'
import { IsNotEmpty, IsOptional } from 'class-validator'
import { Component, Ref } from 'vue-facing-decorator'

export class CreateApiKeyFormData {
  @IsNotEmpty()
  name!: string

  @IsNotEmpty()
  team!: Option<HyperstrateServerInternalModulesAuthApplicationTeamResponse>

  @IsOptional()
  description?: string

  @IsOptional()
  router?: Option<HyperstrateServerInternalModulesRouterApplicationRouterResponse>

  @IsOptional()
  expiresAt?: string
}

type CreateApiKeyModalEmits = {
  (e: 'created', value: InternalModulesAuthInterfacesHttpAPIKeyCreatedResponse): void
  (e: string): void
}

@Component
export default class CreateApiKeyModal extends Mixins(ApiClientsMixin) {
  public readonly CreateApiKeyFormData = CreateApiKeyFormData

  declare public $emit: CreateApiKeyModalEmits

  @Ref()
  public readonly modalRef!: Modal

  public scope: HyperstrateServerInternalModulesAuthDomainAPIKeyScope = HyperstrateServerInternalModulesAuthDomainAPIKeyScope.APIKeyScopeGlobal
  public createdKey?: InternalModulesAuthInterfacesHttpAPIKeyCreatedResponse

  public Variant = Variant
  public readonly HyperstrateServerInternalModulesAuthDomainAPIKeyScope = HyperstrateServerInternalModulesAuthDomainAPIKeyScope

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  public async doSubmit(formData: CreateApiKeyFormData): Promise<void> {
    const isRouter = this.scope === HyperstrateServerInternalModulesAuthDomainAPIKeyScope.APIKeyScopeRouter
    const { data } = await this.api.authApiKeysPost({
      body: {
        name: formData.name.trim(),
        teamId: formData.team.value.id,
        description: formData.description?.trim(),
        scope: this.scope,
        routerId: isRouter ? formData.router?.value.id : undefined,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
      },
    })
    this.createdKey = data
    this.$emit('created', this.createdKey)
  }

  public close(): void {
    this.scope = HyperstrateServerInternalModulesAuthDomainAPIKeyScope.APIKeyScopeGlobal
    this.createdKey = undefined
    this.modalRef.close()
  }
}
</script>
