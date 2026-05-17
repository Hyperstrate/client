<template lang="pug">
ui-modal(ref="modalRef" class="max-w-sm")
  template(#trigger="props")
    slot(name="trigger" v-bind="props")

  template(#default)
    div(class="w-full")
      div(class="flex flex-col gap-4 px-6 pt-6 pb-5")
        div(class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0")
          ui-icon(icon="trash" size="16" class="text-red-600")

        div(class="flex flex-col gap-1")
          h2(class="text-base font-semibold text-gray-900") Delete {{ name }}?
          p(class="text-sm text-gray-500") {{ description || 'This action cannot be undone.' }}

      div(class="flex items-center justify-end gap-2 px-6 pb-5")
        ui-button(type="button" :variant="Variant.Gray" @click="close") Cancel
        ui-button(type="button" :variant="Variant.Red" :disabled="busy" :busy="busy" @click="onConfirm") {{ busy ? 'Deleting…' : 'Delete' }}
</template>

<script lang="ts">
import { Variant } from '@/features/ui/clickables/model'
import Modal from '@/features/ui/modal/Modal.global.vue'
import { BooleanProp, StringProp } from '@/util/prop-decorators'
import { Component, Ref, Vue } from 'vue-facing-decorator'

type ConfirmDeleteModalEmits = {
  (e: 'confirm'): void
  (e: string): void
}

@Component
export default class ConfirmDeleteModal extends Vue {
  public Variant = Variant

  declare public $emit: ConfirmDeleteModalEmits

  @Ref()
  public readonly modalRef!: Modal

  @StringProp()
  public readonly name!: string

  @StringProp()
  public readonly description!: string | undefined

  @BooleanProp(false)
  public readonly busy!: boolean

  public onConfirm(): void {
    this.$emit('confirm')
    this.close()
  }

  public close(): void {
    this.modalRef.close()
  }
}
</script>
