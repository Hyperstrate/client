<template lang="pug">
ui-modal(ref="modalRef")
  template(#trigger="props")
    slot(name="trigger" v-bind="props")

  template(#default)
    div(class="w-full")
      div(class="px-6 pt-6 pb-4 border-b border-gray-100")
        div(class="flex flex-col gap-0.5")
          h2(class="text-base font-semibold text-gray-900") Create Virtual Key
          p(class="text-sm text-gray-500") Issue a budget-scoped key for a router

      //- ── Form state ───────────────────────────────────────────────────────
      div(v-if="!createdVK")
        ui-form(v-slot="{ dirty, validated, submit, busy, apiError }" :validation="CreateVirtualKeyFormData" :action="doSubmit" no-reset)
          div(class="flex flex-col gap-4 px-6 py-5")
            ui-form-field(input="ui-input-text" path="name" label="Name" placeholder="e.g. team-budget-key" required)
            ui-form-field(input="domain-ui-input-combobox-router" path="router" label="Router" required)
            ui-form-field(input="ui-input-text" path="description" label="Description" placeholder="Optional description")
            ui-form-field(input="domain-ui-input-combobox-team" path="team" label="Team" placeholder="No team")
            div(class="grid grid-cols-2 gap-3")
              ui-form-field(input="ui-input-text" path="maxRequests" label="Max Requests" placeholder="0 = unlimited")
              ui-form-field(input="ui-input-text" path="maxCostUsd" label="Max Cost (USD)" placeholder="0 = unlimited")
            div(class="grid grid-cols-2 gap-3")
              ui-form-field(input="ui-input-text" path="rateLimitRps" label="Rate Limit (req/s)" placeholder="0 = unlimited")
              ui-form-field(input="ui-input-select" path="resetPeriod" label="Reset Period" :input-props="{ options: resetPeriodOptions }")

          div(class="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100")
            p(v-if="apiError" class="text-sm text-red-600 flex-1") {{ apiError }}
            ui-button(type="button" :variant="Variant.Gray" @click="close") Cancel
            ui-button(type="button" :disabled="!dirty || !validated" :busy="busy" @click="submit") Create Virtual Key

      //- ── Success state ────────────────────────────────────────────────────
      div(v-else)
        div(class="flex flex-col gap-4 px-6 py-5")
          div(class="flex flex-col gap-1.5")
            div(class="flex items-center gap-2")
              div(class="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0")
                ui-icon(icon="check" class="text-green-600" :size="12")
              span(class="text-sm font-medium text-gray-900") Virtual key created successfully
            p(class="text-xs text-gray-500") Copy the plaintext key now — it will not be shown again.
          div(class="rounded-lg bg-gray-50 border border-gray-200 p-3 text-xs font-mono break-all text-gray-800 select-all")
            | {{ createdVK.key }}

        div(class="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100")
          ui-button(v-clipboard="createdVK?.key ?? ''" :variant="Variant.Gray") Copy key
          ui-button(@click="close") Done
</template>

<script lang="ts">
import {
  HyperstrateApi,
  HyperstrateServerInternalModulesAuthApplicationTeamResponse,
  InternalModulesAuthInterfacesHttpVirtualKeyCreatedResponse,
  HyperstrateServerInternalModulesAuthDomainResetPeriod,
  HyperstrateServerInternalModulesRouterApplicationRouterResponse,
} from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import type { Option } from '@/features/ui/inputs/model'
import Modal from '@/features/ui/modal/Modal.global.vue'
import { Mixins } from '@/util/mixin'
import { IsNotEmpty, IsNumberString, IsOptional } from 'class-validator'
import { Variant } from '@/features/ui/clickables/model'
import { Component, Ref } from 'vue-facing-decorator'

export class CreateVirtualKeyFormData {
  @IsNotEmpty()
  name!: string

  @IsNotEmpty()
  router!: Option<HyperstrateServerInternalModulesRouterApplicationRouterResponse>

  @IsOptional()
  description?: string

  @IsOptional()
  team?: Option<HyperstrateServerInternalModulesAuthApplicationTeamResponse>

  @IsOptional()
  @IsNumberString()
  maxRequests?: string

  @IsOptional()
  @IsNumberString()
  maxCostUsd?: string

  @IsOptional()
  @IsNumberString()
  rateLimitRps?: string

  @IsOptional()
  resetPeriod?: Option<string>
}

type CreateVirtualKeyModalEmits = {
  (e: 'created', value: InternalModulesAuthInterfacesHttpVirtualKeyCreatedResponse): void
  (e: string): void
}

@Component
export default class CreateVirtualKeyModal extends Mixins(ApiClientsMixin) {
  public Variant = Variant

  public readonly CreateVirtualKeyFormData = CreateVirtualKeyFormData

  declare public $emit: CreateVirtualKeyModalEmits

  @Ref()
  public readonly modalRef!: Modal

  public createdVK?: InternalModulesAuthInterfacesHttpVirtualKeyCreatedResponse = undefined

  public readonly resetPeriodOptions: Option<string>[] = [
    { label: 'None', value: '' },
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
  ]

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  public async doSubmit(formData: CreateVirtualKeyFormData): Promise<void> {
    const { data: vk } = await this.api.authVirtualKeysPost({
      body: {
        name: formData.name.trim(),
        routerId: formData.router.value.id,
        teamId: formData.team?.value.id || undefined,
        description: formData.description?.trim() || undefined,
        maxRequests: formData.maxRequests !== undefined ? Number(formData.maxRequests) : undefined,
        maxCostUsd: formData.maxCostUsd !== undefined ? Number(formData.maxCostUsd) : undefined,
        rateLimitRps: formData.rateLimitRps ? Number(formData.rateLimitRps) : undefined,
        resetPeriod: (formData.resetPeriod?.value as HyperstrateServerInternalModulesAuthDomainResetPeriod) || undefined,
      },
    })
    this.createdVK = vk
    this.$emit('created', vk)
  }

  public close(): void {
    this.createdVK = undefined
    this.modalRef.close()
  }
}
</script>
