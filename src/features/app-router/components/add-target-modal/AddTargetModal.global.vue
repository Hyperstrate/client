<template lang="pug">
ui-modal(ref="modalRef")
  template(#trigger="props")
    slot(name="trigger" v-bind="props")

  template(#default)
    div(class="w-full")
      div(class="px-6 pt-6 pb-4 border-b border-gray-100")
        div(class="flex flex-col gap-0.5")
          h2(class="text-base font-semibold text-gray-900") Add Target
          p(class="text-sm text-gray-500") Assign a model with routing parameters

      ui-form(v-slot="{ dirty, validated, submit, busy }" :validation="AddTargetFormData" :action="doSubmit" no-reset)
        div(class="flex flex-col gap-4 px-6 py-5")
          ui-form-field(input="domain-ui-input-combobox-model" path="model" label="Model" required)

          template(v-if="strategy === RoutingStrategy.RoutingStrategyWeighted")
            div(class="flex flex-col gap-1")
              ui-form-field(input="ui-input-text" path="weight" label="Weight" placeholder="1")
              p(class="text-xs text-gray-400") Relative weight — higher values get proportionally more traffic.

          template(v-if="strategy === RoutingStrategy.RoutingStrategyPercentage")
            ui-form-field(input="ui-input-text" path="percentage" label="Percentage (0–100)" placeholder="50")

          template(v-if="strategy === RoutingStrategy.RoutingStrategyFailover")
            div(class="flex flex-col gap-1")
              ui-form-field(input="ui-input-text" path="priority" label="Priority" placeholder="0")
              p(class="text-xs text-gray-400") Lower = tried first. Use 0 for the primary model.

        div(class="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100")
          ui-button(type="button" :variant="Variant.Gray" @click="close") Cancel
          ui-button(type="button" :disabled="!dirty || !validated || busy" :busy="busy" @click="submit") Add Target
</template>

<script lang="ts">
import {
  HyperstrateApi,
  HyperstrateServerInternalModulesAiApplicationModelResponse,
  HyperstrateServerInternalModulesRouterDomainRoutingStrategy,
  InternalModulesRouterInterfacesHttpRouterTargetResponse,
} from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Variant } from '@/features/ui/clickables/model'
import { Option } from '@/features/ui/inputs/model'
import Modal from '@/features/ui/modal/Modal.global.vue'
import { Mixins } from '@/util/mixin'
import { OptionalProp, StringProp } from '@/util/prop-decorators'
import { IsNotEmpty, IsNumberString, IsOptional } from 'class-validator'
import { Component, Ref } from 'vue-facing-decorator'

type ModelOption = Option<HyperstrateServerInternalModulesAiApplicationModelResponse>

export class AddTargetFormData {
  @IsNotEmpty()
  model!: ModelOption

  @IsOptional()
  @IsNumberString()
  weight?: string

  @IsOptional()
  @IsNumberString()
  percentage?: string

  @IsOptional()
  @IsNumberString()
  priority?: string
}

type AddTargetModalEmits = {
  (e: 'added', value: InternalModulesRouterInterfacesHttpRouterTargetResponse): void
  (e: string): void
}

@Component({ emits: ['added'] })
export default class AddTargetModal extends Mixins(ApiClientsMixin) {
  public Variant = Variant

  public readonly AddTargetFormData = AddTargetFormData

  @StringProp(true)
  public readonly routerId!: string

  @OptionalProp(HyperstrateServerInternalModulesRouterDomainRoutingStrategy.RoutingStrategyRoundRobin)
  public readonly strategy!: HyperstrateServerInternalModulesRouterDomainRoutingStrategy

  @Ref()
  public readonly modalRef!: Modal

  declare public $emit: AddTargetModalEmits

  public readonly RoutingStrategy = HyperstrateServerInternalModulesRouterDomainRoutingStrategy

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  public async doSubmit(formData: AddTargetFormData): Promise<void> {
    const { data: target } = await this.api.routerIdTargetsPost({
      id: this.routerId,
      body: {
        modelId: formData.model.value.id,
        weight: formData.weight !== undefined ? Number(formData.weight) : undefined,
        percentage: formData.percentage !== undefined ? Number(formData.percentage) : undefined,
        priority: formData.priority !== undefined ? Number(formData.priority) : undefined,
      },
    })
    this.$emit('added', target)
    this.close()
  }

  public open(): void {
    this.modalRef.open()
  }

  public close(): void {
    this.modalRef.close()
  }
}
</script>
