<template lang="pug">
ui-modal(ref="modalRef")
  template(#trigger="props")
    slot(name="trigger" v-bind="props")

  template(#default)
    div(class="w-full")
      div(class="px-6 pt-6 pb-4 border-b border-gray-100")
        div(class="flex flex-col gap-0.5")
          h2(class="text-base font-semibold text-gray-900") New Evaluation
          p(class="text-sm text-gray-500") Create a named set of test cases for this router

      ui-form(v-slot="{ dirty, validated, submit, busy }" :validation="CreateEvaluationFormData" :action="doSubmit" no-reset)
        div(class="px-6 py-5")
          ui-form-field(input="ui-input-text" path="name" label="Name" placeholder="e.g. Regression suite v1" required)

        div(class="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100")
          ui-button(type="button" :variant="Variant.Gray" @click="close") Cancel
          ui-button(type="button" :disabled="!dirty || !validated" :busy="busy" @click="submit") Create
</template>

<script lang="ts">
import { HyperstrateApi, HyperstrateServerInternalModulesRouterApplicationEvaluationResponse } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import Modal from '@/features/ui/modal/Modal.global.vue'
import { Variant } from '@/features/ui/clickables/model'
import { Mixins } from '@/util/mixin'
import { IsNotEmpty } from 'class-validator'
import { Component, Ref } from 'vue-facing-decorator'
import { RequiredProp } from '@/util/prop-decorators'

export class CreateEvaluationFormData {
  @IsNotEmpty()
  name!: string
}

type Evaluation = HyperstrateServerInternalModulesRouterApplicationEvaluationResponse

type CreateEvaluationModalEmits = {
  (e: 'created', value: Evaluation): void
  (e: string): void
}

@Component({ emits: ['created'] })
export default class CreateEvaluationModal extends Mixins(ApiClientsMixin) {
  public readonly Variant = Variant
  public readonly CreateEvaluationFormData = CreateEvaluationFormData

  declare public $emit: CreateEvaluationModalEmits

  @RequiredProp()
  public readonly routerId!: string

  @Ref()
  public readonly modalRef!: Modal

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  public async doSubmit(formData: CreateEvaluationFormData): Promise<void> {
    const { data } = await this.api.routerEvaluationsPost({
      body: { routerId: this.routerId, name: formData.name.trim() },
    })
    this.$emit('created', data)
    this.close()
  }

  public close(): void {
    this.modalRef.close()
  }
}
</script>
