<template lang="pug">
ui-modal(ref="modalRef")
  template(#trigger="props")
    slot(name="trigger" v-bind="props")

  template(#default)
    div(class="w-full")
      div(class="px-6 pt-6 pb-4 border-b border-gray-100")
        div(class="flex flex-col gap-0.5")
          h2(class="text-base font-semibold text-gray-900") Runner Pool
          p(class="text-sm text-gray-500") Provider placement and runner capabilities

      ui-form(v-slot="{ validated, submit, busy }" :validation="CreateRunnerPoolFormData" :initial-data="initialData" :action="doSubmit" no-reset)
        div(class="flex flex-col gap-4 px-6 py-5")
          ui-form-field(input="ui-input-text" path="name" label="Name" placeholder="aws-us-east" required)
          div(class="grid grid-cols-1 md:grid-cols-2 gap-4")
            ui-form-field(input="ui-input-select" path="provider" label="Provider" :input-props="{ options: providerOptions }" required)
            ui-form-field(input="ui-input-text" path="region" label="Region" placeholder="us-east-1")
          ui-form-field(input="ui-input-textarea" path="capabilities" label="Capabilities JSON" required)

        div(class="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100")
          ui-button(type="button" :variant="Variant.Gray" @click="close") Cancel
          ui-button(type="button" :disabled="!validated" :busy="busy" @click="submit") Create Pool
</template>

<script lang="ts">
import type { HyperstrateApi } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Variant } from '@/features/ui/clickables/model'
import type { Option } from '@/features/ui/inputs/model'
import Modal from '@/features/ui/modal/Modal.global.vue'
import { Mixins } from '@/util/mixin'
import { IsNotEmpty, IsOptional } from 'class-validator'
import { Component, Ref } from 'vue-facing-decorator'
import type { FunctionsControlPlaneApi, RunnerPool } from '../../api'
import { parseJsonObject } from '../../model'

const PROVIDER_OPTIONS: Option<string>[] = [
  { value: 'aws', label: 'AWS' },
  { value: 'runpod', label: 'Runpod' },
  { value: 'modal', label: 'Modal' },
  { value: 'kubernetes', label: 'Kubernetes' },
  { value: 'local', label: 'Local' },
]

export class CreateRunnerPoolFormData {
  @IsNotEmpty()
  name!: string

  @IsNotEmpty()
  provider!: string | Option<string>

  @IsOptional()
  region?: string

  @IsNotEmpty()
  capabilities!: string
}

type Emits = {
  (e: 'created', value: RunnerPool): void
  (e: string): void
}

@Component({ emits: ['created'] })
export default class CreateRunnerPoolModal extends Mixins(ApiClientsMixin) {
  public readonly CreateRunnerPoolFormData = CreateRunnerPoolFormData
  public readonly Variant = Variant
  public readonly providerOptions = PROVIDER_OPTIONS
  public readonly initialData = {
    provider: PROVIDER_OPTIONS[0],
    region: 'us-east-1',
    capabilities: '{\n  "runtime": "python3.12",\n  "pythonVersion": "3.12",\n  "sandbox": "container"\n}',
  }

  @Ref()
  public readonly modalRef!: Modal

  declare public $emit: Emits

  private get api(): FunctionsControlPlaneApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API) as unknown as FunctionsControlPlaneApi
  }

  public async doSubmit(formData: CreateRunnerPoolFormData): Promise<void> {
    const { data } = await this.api.functionsRunnerPoolsPost({
      body: {
        name: formData.name.trim(),
        provider: this.optionValue(formData.provider),
        region: formData.region?.trim() || undefined,
        capabilities: parseJsonObject(formData.capabilities),
      },
    })
    this.$emit('created', data)
    this.close()
  }

  public close(): void {
    this.modalRef.close()
  }

  private optionValue(value: string | Option<string>): string {
    return typeof value === 'string' ? value : value.value
  }
}
</script>
