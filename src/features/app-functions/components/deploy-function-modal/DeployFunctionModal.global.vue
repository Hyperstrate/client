<template lang="pug">
ui-modal(ref="modalRef" :size="Size.MD")
  template(#trigger="props")
    slot(name="trigger" v-bind="props")

  template(#default)
    div(class="w-full")
      div(class="px-6 pt-6 pb-4 border-b border-gray-100")
        div(class="flex flex-col gap-0.5")
          h2(class="text-base font-semibold text-gray-900") Deploy Function
          p(class="text-sm text-gray-500") Revision, runtime, scale, security, and placement

      ui-form(v-slot="{ validated, submit, busy }" :validation="DeployFunctionFormFields" :initial-data="initialData" :action="doSubmit" no-reset)
        div(class="max-h-[70vh] overflow-y-auto px-6 py-5 flex flex-col gap-5")
          div(class="grid grid-cols-1 md:grid-cols-2 gap-4")
            ui-form-field(input="ui-input-text" path="name" label="Name" placeholder="embed-text" required)
            ui-form-field(input="ui-input-text" path="entrypoint" label="Entrypoint" placeholder="handler.embed" required)

          div(class="flex flex-col gap-3")
            h3(class="text-sm font-semibold text-gray-800") Image
            ui-form-field(input="ui-input-text" path="imageBase" label="Base image" placeholder="python:3.12-slim" required)
            div(class="grid grid-cols-1 md:grid-cols-2 gap-4")
              ui-form-field(input="ui-input-textarea" path="packages" label="Packages" placeholder="numpy\npandas")
              ui-form-field(input="ui-input-textarea" path="commands" label="Commands" placeholder="python -m pip install --upgrade pip")

          div(class="flex flex-col gap-3")
            h3(class="text-sm font-semibold text-gray-800") Runtime
            div(class="grid grid-cols-1 md:grid-cols-5 gap-4")
              ui-form-field(input="ui-input-text" path="pythonVersion" label="Python" placeholder="3.12")
              ui-form-field(input="ui-input-text" path="cpu" label="CPU" placeholder="1")
              ui-form-field(input="ui-input-text" path="memoryMb" label="Memory MB" placeholder="1024")
              ui-form-field(input="ui-input-text" path="gpu" label="GPU" placeholder="none")
              ui-form-field(input="ui-input-text" path="timeoutSecs" label="Timeout" placeholder="300")

          div(class="flex flex-col gap-3")
            h3(class="text-sm font-semibold text-gray-800") Scaling
            div(class="grid grid-cols-1 md:grid-cols-4 gap-4")
              ui-form-field(input="ui-input-text" path="minContainers" label="Min" placeholder="0")
              ui-form-field(input="ui-input-text" path="maxContainers" label="Max" placeholder="1")
              ui-form-field(input="ui-input-text" path="maxConcurrency" label="Concurrency" placeholder="1")
              ui-form-field(input="ui-input-text" path="scaleDownAfterSecs" label="Scale down" placeholder="60")

          div(class="flex flex-col gap-3")
            h3(class="text-sm font-semibold text-gray-800") Security
            div(class="grid grid-cols-1 md:grid-cols-2 gap-4")
              ui-form-field(input="ui-input-select" path="sandbox" label="Sandbox" :input-props="{ options: sandboxOptions }")
              ui-form-field(input="ui-input-select" path="networkPolicy" label="Network" :input-props="{ options: networkPolicyOptions }")
            ui-form-field(input="ui-input-textarea" path="allowOutboundHosts" label="Allowed hosts" placeholder="api.openai.com\ns3.amazonaws.com")

          div(class="flex flex-col gap-3")
            h3(class="text-sm font-semibold text-gray-800") Placement
            ui-form-field(input="ui-input-select" path="providerStrategy" label="Strategy" :input-props="{ options: providerStrategyOptions }")
            div(class="grid grid-cols-1 md:grid-cols-2 gap-4")
              ui-form-field(input="ui-input-textarea" path="allowedProviders" label="Providers" placeholder="aws\nrunpod")
              ui-form-field(input="ui-input-textarea" path="regions" label="Regions" placeholder="us-east-1\nus-west-2")

        div(class="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100")
          ui-button(type="button" :variant="Variant.Gray" @click="close") Cancel
          ui-button(type="button" :disabled="!validated || !appId" :busy="busy" @click="submit") Deploy
</template>

<script lang="ts">
import type { HyperstrateApi } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Size, Variant } from '@/features/ui/clickables/model'
import type { Option } from '@/features/ui/inputs/model'
import Modal from '@/features/ui/modal/Modal.global.vue'
import { Mixins } from '@/util/mixin'
import { StringProp } from '@/util/prop-decorators'
import { IsNotEmpty, IsNumberString, IsOptional } from 'class-validator'
import { Component, Ref } from 'vue-facing-decorator'
import type { FunctionItem, FunctionsControlPlaneApi } from '../../api'
import { buildDeployFunctionInput } from '../../model'

const SANDBOX_OPTIONS: Option<string>[] = [
  { value: 'container', label: 'Container' },
  { value: 'gvisor', label: 'gVisor' },
  { value: 'kata', label: 'Kata' },
  { value: 'firecracker', label: 'Firecracker' },
]

const NETWORK_POLICY_OPTIONS: Option<string>[] = [
  { value: 'deny_all', label: 'Deny all' },
  { value: 'restricted', label: 'Restricted' },
  { value: 'allow_all', label: 'Allow all' },
]

const PROVIDER_STRATEGY_OPTIONS: Option<string>[] = [
  { value: 'portable', label: 'Portable' },
  { value: 'price_performance', label: 'Price/performance' },
  { value: 'lowest_cost', label: 'Lowest cost' },
  { value: 'lowest_latency', label: 'Lowest latency' },
]

export class DeployFunctionFormFields {
  @IsNotEmpty()
  name!: string

  @IsNotEmpty()
  entrypoint!: string

  @IsNotEmpty()
  imageBase!: string

  @IsOptional()
  packages?: string

  @IsOptional()
  commands?: string

  @IsOptional()
  pythonVersion?: string

  @IsOptional()
  cpu?: string

  @IsOptional()
  @IsNumberString()
  memoryMb?: string

  @IsOptional()
  gpu?: string

  @IsOptional()
  @IsNumberString()
  timeoutSecs?: string

  @IsOptional()
  @IsNumberString()
  minContainers?: string

  @IsOptional()
  @IsNumberString()
  maxContainers?: string

  @IsOptional()
  @IsNumberString()
  maxConcurrency?: string

  @IsOptional()
  @IsNumberString()
  scaleDownAfterSecs?: string

  @IsOptional()
  sandbox?: string | Option<string>

  @IsOptional()
  networkPolicy?: string | Option<string>

  @IsOptional()
  allowOutboundHosts?: string

  @IsOptional()
  providerStrategy?: string | Option<string>

  @IsOptional()
  allowedProviders?: string

  @IsOptional()
  regions?: string
}

type Emits = {
  (e: 'deployed', value: FunctionItem): void
  (e: string): void
}

@Component({ emits: ['deployed'] })
export default class DeployFunctionModal extends Mixins(ApiClientsMixin) {
  @StringProp(true)
  public readonly appId!: string

  public readonly DeployFunctionFormFields = DeployFunctionFormFields
  public readonly Size = Size
  public readonly Variant = Variant
  public readonly sandboxOptions = SANDBOX_OPTIONS
  public readonly networkPolicyOptions = NETWORK_POLICY_OPTIONS
  public readonly providerStrategyOptions = PROVIDER_STRATEGY_OPTIONS
  public readonly initialData = {
    imageBase: 'python:3.12-slim',
    pythonVersion: '3.12',
    cpu: '1',
    memoryMb: '1024',
    gpu: 'none',
    timeoutSecs: '300',
    minContainers: '0',
    maxContainers: '1',
    maxConcurrency: '1',
    scaleDownAfterSecs: '60',
    sandbox: SANDBOX_OPTIONS[0],
    networkPolicy: NETWORK_POLICY_OPTIONS[0],
    providerStrategy: PROVIDER_STRATEGY_OPTIONS[0],
  }

  @Ref()
  public readonly modalRef!: Modal

  declare public $emit: Emits

  private get api(): FunctionsControlPlaneApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API) as unknown as FunctionsControlPlaneApi
  }

  public async doSubmit(formData: DeployFunctionFormFields): Promise<void> {
    const body = buildDeployFunctionInput({
      ...formData,
      sandbox: this.optionValue(formData.sandbox),
      networkPolicy: this.optionValue(formData.networkPolicy),
      providerStrategy: this.optionValue(formData.providerStrategy),
    })
    const { data } = await this.api.functionsAppsAppIdFunctionsPost({ appId: this.appId, body })
    this.$emit('deployed', data)
    this.close()
  }

  public close(): void {
    this.modalRef.close()
  }

  private optionValue(value: string | Option<string> | undefined): string {
    if (!value) return ''
    return typeof value === 'string' ? value : value.value
  }
}
</script>
