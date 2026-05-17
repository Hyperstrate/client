<template lang="pug">
ui-modal(ref="modalRef" class="max-w-sm")
  template(#trigger="props")
    slot(name="trigger" v-bind="props")

  template(#default)
    div(class="w-full")
      //- ── Confirm state ────────────────────────────────────────────────────
      div(v-if="!rotatedKey")
        div(class="flex flex-col gap-4 px-6 pt-6 pb-5")
          div(class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0")
            ui-icon(icon="refresh" size="16" class="text-amber-600")

          div(class="flex flex-col gap-1")
            h2(class="text-base font-semibold text-gray-900") Rotate API key?
            p(class="text-sm text-gray-500") A new secret will be generated. The existing key will stop working immediately.

        div(class="flex items-center justify-end gap-2 px-6 pb-5")
          p(v-if="error" class="text-sm text-red-600 flex-1") {{ error }}
          ui-button(type="button" :variant="Variant.Gray" @click="close") Cancel
          ui-button(type="button" :busy="busy" @click="doRotate") Rotate

      //- ── Success state ────────────────────────────────────────────────────
      div(v-else)
        div(class="flex flex-col gap-4 px-6 py-5")
          div(class="flex flex-col gap-1.5")
            div(class="flex items-center gap-2")
              div(class="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0")
                ui-icon(icon="check" class="text-green-600" :size="12")
              span(class="text-sm font-medium text-gray-900") Key rotated successfully
            p(class="text-xs text-gray-500") Copy the new key now — it will not be shown again.
          div(class="rounded-lg bg-gray-50 border border-gray-200 p-3 text-xs font-mono break-all text-gray-800 select-all")
            | {{ rotatedKey.key }}

        div(class="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100")
          ui-button(v-clipboard="rotatedKey.key ?? ''" :variant="Variant.Gray") Copy key
          ui-button(@click="close") Done
</template>

<script lang="ts">
import { HyperstrateApi, InternalModulesAuthInterfacesHttpAPIKeyCreatedResponse } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import Modal from '@/features/ui/modal/Modal.global.vue'
import { Variant } from '@/features/ui/clickables/model'
import { StringProp } from '@/util/prop-decorators'
import { Component, Ref } from 'vue-facing-decorator'
import { Mixins } from '@/util/mixin'

@Component
export default class RotateApiKeyModal extends Mixins(ApiClientsMixin) {
  public Variant = Variant

  @Ref()
  public readonly modalRef!: Modal

  @StringProp(true)
  public readonly keyId!: string

  public rotatedKey?: InternalModulesAuthInterfacesHttpAPIKeyCreatedResponse = undefined
  public busy = false
  public error?: string = undefined

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  public async doRotate(): Promise<void> {
    this.busy = true
    this.error = undefined
    try {
      const { data } = await this.api.authApiKeysIdRotatePost({ id: this.keyId })
      this.rotatedKey = data
    } catch {
      this.error = 'Failed to rotate key. Please try again.'
    } finally {
      this.busy = false
    }
  }

  public close(): void {
    this.rotatedKey = undefined
    this.error = undefined
    this.modalRef.close()
  }
}
</script>
