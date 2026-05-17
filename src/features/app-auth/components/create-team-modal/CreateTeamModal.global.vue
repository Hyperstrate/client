<template lang="pug">
ui-modal(ref="modalRef")
  template(#trigger="props")
    slot(name="trigger" v-bind="props")

  template(#default)
    div(class="w-full")
      div(class="px-6 pt-6 pb-4 border-b border-gray-100")
        div(class="flex flex-col gap-0.5")
          h2(class="text-base font-semibold text-gray-900") Create Team
          p(class="text-sm text-gray-500") Group users under a shared budget ceiling

      ui-form(v-slot="{ dirty, validated, submit, busy }" :validation="CreateTeamFormData" :action="doSubmit" no-reset)
        div(class="flex flex-col gap-4 px-6 py-5")
          ui-form-field(input="ui-input-text" path="name" label="Name" placeholder="e.g. engineering" required)
          ui-form-field(input="ui-input-text" path="description" label="Description" placeholder="Optional description")
          div(class="grid grid-cols-2 gap-3")
            ui-form-field(input="ui-input-text" path="maxRequests" label="Max Requests" placeholder="0 = unlimited")
            ui-form-field(input="ui-input-text" path="maxCostUsd" label="Max Cost (USD)" placeholder="0 = unlimited")

        div(class="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100")
          ui-button(type="button" :variant="Variant.Gray" @click="close") Cancel
          ui-button(type="button" :disabled="!dirty || !validated" :busy="busy" @click="submit") Create Team
</template>

<script lang="ts">
import { HyperstrateApi, HyperstrateServerInternalModulesAuthApplicationTeamResponse } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import Modal from '@/features/ui/modal/Modal.global.vue'
import { Mixins } from '@/util/mixin'
import { IsNotEmpty, IsNumberString, IsOptional } from 'class-validator'
import { Variant } from '@/features/ui/clickables/model'
import { Component, Ref } from 'vue-facing-decorator'

export class CreateTeamFormData {
  @IsNotEmpty()
  name!: string

  @IsOptional()
  description?: string

  @IsOptional()
  @IsNumberString()
  maxRequests?: string

  @IsOptional()
  @IsNumberString()
  maxCostUsd?: string
}

type CreateTeamModalEmits = {
  (e: 'created', value: HyperstrateServerInternalModulesAuthApplicationTeamResponse): void
  (e: string): void
}

@Component
export default class CreateTeamModal extends Mixins(ApiClientsMixin) {
  public Variant = Variant

  public readonly CreateTeamFormData = CreateTeamFormData

  declare public $emit: CreateTeamModalEmits

  @Ref()
  public readonly modalRef!: Modal

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  public async doSubmit(formData: CreateTeamFormData): Promise<void> {
    const { data: team } = await this.api.authTeamsPost({
      body: {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        maxRequests: formData.maxRequests !== undefined ? Number(formData.maxRequests) : undefined,
        maxCostUsd: formData.maxCostUsd !== undefined ? Number(formData.maxCostUsd) : undefined,
      },
    })
    this.$emit('created', team)
    this.close()
  }

  public close(): void {
    this.modalRef.close()
  }
}
</script>
