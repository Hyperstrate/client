<template lang="pug">
ui-modal(ref="modalRef")
  template(#trigger="props")
    slot(name="trigger" v-bind="props")

  template(#default)
    div(class="w-full")
      div(class="px-6 pt-6 pb-4 border-b border-gray-100")
        div(class="flex flex-col gap-0.5")
          h2(class="text-base font-semibold text-gray-900") Create Router
          p(class="text-sm text-gray-500") Configure name and routing strategy

      ui-form(v-slot="{ dirty, validated, submit, busy, formData }" :validation="CreateRouterFormData" :action="doSubmit" no-reset)
        div(class="flex flex-col gap-4 px-6 py-5")
          ui-form-field(input="ui-input-text" path="name" label="Name" placeholder="e.g. production-llm-router" required)
          ui-form-field(input="ui-input-textarea" path="description" label="Description" placeholder="Optional description" class="w-full")
          ui-form-field(input="ui-input-select" path="strategy" label="Routing Strategy" required :input-props="{ options: strategyOptions }")
          div(v-if="strategyDescriptionFor(formData)" class="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2.5 leading-relaxed")
            | {{ strategyDescriptionFor(formData) }}

        div(class="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100")
          ui-button(type="button" :variant="Variant.Gray" @click="close") Cancel
          ui-button(type="button" :disabled="!dirty || !validated" :busy="busy" @click="submit") Create Router
</template>

<script lang="ts">
import {
  HyperstrateApi,
  HyperstrateServerInternalModulesRouterApplicationRouterResponse,
  HyperstrateServerInternalModulesRouterDomainRoutingStrategy,
} from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import Modal from '@/features/ui/modal/Modal.global.vue'
import { Mixins } from '@/util/mixin'
import { IsNotEmpty, IsOptional } from 'class-validator'
import { Variant } from '@/features/ui/clickables/model'
import { Component, Ref } from 'vue-facing-decorator'
import { ROUTING_STRATEGY_OPTIONS, STRATEGY_DESCRIPTIONS } from '../../model'

type StrategyOption = { label: string; value: HyperstrateServerInternalModulesRouterDomainRoutingStrategy }

export class CreateRouterFormData {
  @IsNotEmpty()
  name!: string

  @IsOptional()
  description?: string

  @IsNotEmpty()
  strategy!: StrategyOption
}

type CreateRouterModalEmits = {
  (e: 'created', value: HyperstrateServerInternalModulesRouterApplicationRouterResponse): void
  (e: string): void
}

@Component
export default class CreateRouterModal extends Mixins(ApiClientsMixin) {
  public Variant = Variant

  public readonly CreateRouterFormData = CreateRouterFormData

  @Ref()
  public readonly modalRef!: Modal

  public readonly strategyOptions = ROUTING_STRATEGY_OPTIONS

  declare public $emit: CreateRouterModalEmits

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  public strategyDescriptionFor(formData: Record<string, unknown>): string {
    const strategy = (formData.strategy as StrategyOption | undefined)?.value
    return strategy ? (STRATEGY_DESCRIPTIONS[strategy] ?? '') : ''
  }

  public async doSubmit(formData: CreateRouterFormData): Promise<void> {
    const { data: router } = await this.api.routerPost({
      body: {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        strategy: formData.strategy.value,
      },
    })
    this.$emit('created', router)
    this.close()
  }

  public close(): void {
    this.modalRef.close()
  }
}
</script>
