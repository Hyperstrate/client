<template lang="pug">
div(class="flex flex-col")
  //- Payload storage
  div(class="p-4 flex flex-col gap-3")
    ui-overline Payload Storage

    div(class="flex flex-col gap-1.5")
      ui-input-checkbox(v-model="storePayloads" label="Store request & response" @update:model-value="saveStorePayloads")
      p(class="text-xs text-gray-400 leading-relaxed")
        | Store prompt fields and model response for each inference call.

  div(class="border-t border-gray-100")
  router-test-inference-control(:router-id="routerId" :initial-prompt-id="initialPromptId")
</template>

<script lang="ts">
import { HyperstrateApi } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Mixins } from '@/util/mixin'
import { Component } from 'vue-facing-decorator'
import { BooleanProp, StringProp } from '@/util/prop-decorators'
import RouterTestInferenceControl from './RouterTestInferenceControl.vue'

@Component({ components: { RouterTestInferenceControl } })
export default class RouterInferenceControl extends Mixins(ApiClientsMixin) {
  @StringProp(true)
  public readonly routerId!: string

  @StringProp('')
  public readonly initialPromptId!: string

  @BooleanProp()
  public readonly initialStorePayloads!: boolean

  public storePayloads = false
  public storePayloadsBusy = false

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  public created(): void {
    this.storePayloads = this.initialStorePayloads
  }

  public async saveStorePayloads(): Promise<void> {
    if (this.storePayloadsBusy) return
    this.storePayloadsBusy = true
    try {
      await this.api.routerIdPatch({
        id: this.routerId,
        body: { storePayloads: this.storePayloads },
      })
    } finally {
      this.storePayloadsBusy = false
    }
  }
}
</script>
