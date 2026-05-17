<template lang="pug">
ui-modal(ref="modalRef" @close="close")
  template(#trigger="props")
    slot(name="trigger" v-bind="props")

  template(#default)
    div(class="w-full")
      div(class="px-6 pt-6 pb-4 border-b border-gray-100")
        div(class="flex flex-col gap-0.5")
          h2(class="text-base font-semibold text-gray-900") Register Model
          p(class="text-sm text-gray-500") Add an AI model from the catalog

      ui-form(v-slot="{ dirty, validated, busy, submit }" :validation="CreateModelFormData" :action="createModel" @submitted="onSubmitted")
        div(class="flex flex-col gap-4 px-6 py-5")
          ui-form-field(input="domain-ui-input-combobox-model-definition" path="modelDefinition" label="Model definition" required)
          ui-form-field(input="ui-input-text" path="alias" label="Alias" placeholder="Optional friendly name")

        div(class="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100")
          ui-button(type="button" :variant="Variant.Gray" @click="close") Cancel
          ui-button(:disabled="!dirty || !validated" :busy="busy" @click="submit") Register
</template>

<script lang="ts">
import type { HyperstrateServerInternalModulesAiDomainModelDefinition } from '@/__generated__/hyperstrate-api'
import { HyperstrateApi, HyperstrateServerInternalModulesAiApplicationModelResponse } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import type { Option } from '@/features/ui/inputs/model'
import Modal from '@/features/ui/modal/Modal.global.vue'
import { Mixins } from '@/util/mixin'
import { IsNotEmpty, IsOptional } from 'class-validator'
import { Variant } from '@/features/ui/clickables/model'
import { Component, Ref } from 'vue-facing-decorator'

export class CreateModelFormData {
  @IsNotEmpty()
  modelDefinition!: Option<HyperstrateServerInternalModulesAiDomainModelDefinition>

  @IsOptional()
  alias?: string
}

type CreateModelModalEmits = {
  (e: 'registered', value: HyperstrateServerInternalModulesAiApplicationModelResponse): void
  (e: string): void
}

@Component({ emits: ['registered'] })
export default class CreateModelModal extends Mixins(ApiClientsMixin) {
  public Variant = Variant

  public readonly CreateModelFormData = CreateModelFormData

  declare public $emit: CreateModelModalEmits

  @Ref()
  public readonly modalRef!: Modal

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  public async createModel(formData: CreateModelFormData): Promise<void> {
    const { data } = await this.api.aiModelsPost({ body: { modelDefinitionKey: formData.modelDefinition.value.key, alias: formData.alias } })
    this.$emit('registered', data)
    this.close()
  }

  private async onSubmitted(): Promise<void> {
    this.close()
  }

  private close(): void {
    this.modalRef.close()
  }
}
</script>
