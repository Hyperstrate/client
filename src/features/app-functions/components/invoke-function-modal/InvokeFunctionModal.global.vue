<template lang="pug">
ui-modal(ref="modalRef")
  template(#trigger="props")
    slot(name="trigger" v-bind="props")

  template(#default)
    div(class="w-full")
      div(class="px-6 pt-6 pb-4 border-b border-gray-100")
        div(class="flex flex-col gap-0.5")
          h2(class="text-base font-semibold text-gray-900") Invoke Function
          p(class="text-sm text-gray-500") Queue an async invocation

      ui-form(v-slot="{ validated, submit, busy }" :validation="InvokeFunctionFormData" :initial-data="initialData" :action="doSubmit" no-reset)
        div(class="flex flex-col gap-4 px-6 py-5")
          ui-form-field(input="ui-input-textarea" path="payload" label="Payload JSON" required)
          div(class="grid grid-cols-1 md:grid-cols-2 gap-4")
            ui-form-field(input="ui-input-text" path="idempotencyKey" label="Idempotency key" placeholder="optional")
            ui-form-field(input="ui-input-text" path="maxAttempts" label="Max attempts" placeholder="1")

        div(class="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100")
          ui-button(type="button" :variant="Variant.Gray" @click="close") Cancel
          ui-button(type="button" :disabled="!validated || !functionId" :busy="busy" @click="submit") Invoke
</template>

<script lang="ts">
import type { HyperstrateApi } from '@/__generated__/hyperstrate-api'
import { HyperstrateServerInternalModulesFunctionsDomainInvocationMode as InvocationMode } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Variant } from '@/features/ui/clickables/model'
import Modal from '@/features/ui/modal/Modal.global.vue'
import { Mixins } from '@/util/mixin'
import { StringProp } from '@/util/prop-decorators'
import { IsNotEmpty, IsNumberString, IsOptional } from 'class-validator'
import { Component, Ref } from 'vue-facing-decorator'
import type { FunctionInvocation, FunctionsControlPlaneApi } from '../../api'
import { parseJsonObject } from '../../model'

export class InvokeFunctionFormData {
  @IsNotEmpty()
  payload!: string

  @IsOptional()
  idempotencyKey?: string

  @IsOptional()
  @IsNumberString()
  maxAttempts?: string
}

type Emits = {
  (e: 'invoked', value: FunctionInvocation): void
  (e: string): void
}

@Component({ emits: ['invoked'] })
export default class InvokeFunctionModal extends Mixins(ApiClientsMixin) {
  @StringProp(true)
  public readonly functionId!: string

  public readonly InvokeFunctionFormData = InvokeFunctionFormData
  public readonly Variant = Variant
  public readonly initialData = { payload: '{\n  \n}', maxAttempts: '1' }

  @Ref()
  public readonly modalRef!: Modal

  declare public $emit: Emits

  private get api(): FunctionsControlPlaneApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API) as unknown as FunctionsControlPlaneApi
  }

  public async doSubmit(formData: InvokeFunctionFormData): Promise<void> {
    const { data } = await this.api.functionsFunctionIdInvocationsPost({
      functionId: this.functionId,
      body: {
        mode: InvocationMode.InvocationModeAsync,
        payload: parseJsonObject(formData.payload),
        idempotencyKey: formData.idempotencyKey?.trim() || undefined,
        maxAttempts: formData.maxAttempts ? Number(formData.maxAttempts) : undefined,
      },
    })
    this.$emit('invoked', data)
    this.close()
  }

  public close(): void {
    this.modalRef.close()
  }
}
</script>
