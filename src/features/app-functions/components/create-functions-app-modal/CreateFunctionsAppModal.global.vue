<template lang="pug">
ui-modal(ref="modalRef")
  template(#trigger="props")
    slot(name="trigger" v-bind="props")

  template(#default)
    div(class="w-full")
      div(class="px-6 pt-6 pb-4 border-b border-gray-100")
        div(class="flex flex-col gap-0.5")
          h2(class="text-base font-semibold text-gray-900") New Functions App
          p(class="text-sm text-gray-500") Namespace for deployed Python functions

      ui-form(v-slot="{ dirty, validated, submit, busy }" :validation="CreateFunctionsAppFormData" :action="doSubmit" no-reset)
        div(class="flex flex-col gap-4 px-6 py-5")
          ui-form-field(input="ui-input-text" path="name" label="Name" placeholder="embeddings" required)
          ui-form-field(input="ui-input-textarea" path="description" label="Description" placeholder="Optional description")

        div(class="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100")
          ui-button(type="button" :variant="Variant.Gray" @click="close") Cancel
          ui-button(type="button" :disabled="!dirty || !validated" :busy="busy" @click="submit") Create App
</template>

<script lang="ts">
import type { HyperstrateApi } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Variant } from '@/features/ui/clickables/model'
import Modal from '@/features/ui/modal/Modal.global.vue'
import { Mixins } from '@/util/mixin'
import { IsNotEmpty, IsOptional } from 'class-validator'
import { Component, Ref } from 'vue-facing-decorator'
import type { FunctionsApp, FunctionsControlPlaneApi } from '../../api'

export class CreateFunctionsAppFormData {
  @IsNotEmpty()
  name!: string

  @IsOptional()
  description?: string
}

type Emits = {
  (e: 'created', value: FunctionsApp): void
  (e: string): void
}

@Component({ emits: ['created'] })
export default class CreateFunctionsAppModal extends Mixins(ApiClientsMixin) {
  public readonly CreateFunctionsAppFormData = CreateFunctionsAppFormData
  public readonly Variant = Variant

  @Ref()
  public readonly modalRef!: Modal

  declare public $emit: Emits

  private get api(): FunctionsControlPlaneApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API) as unknown as FunctionsControlPlaneApi
  }

  public async doSubmit(formData: CreateFunctionsAppFormData): Promise<void> {
    const { data } = await this.api.functionsAppsPost({
      body: {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
      },
    })
    this.$emit('created', data)
    this.close()
  }

  public close(): void {
    this.modalRef.close()
  }
}
</script>
