<template lang="pug">
story(title="ConfirmDeleteModal")
  variant(title="Default")
    domain-ui-confirm-delete-modal(name="my-router" @confirm="onConfirm")
      template(#trigger)
        ui-button(:variant="Variant.Red") Delete router
  variant(title="With description")
    domain-ui-confirm-delete-modal(
      name="API key"
      description="Deleting this key will immediately revoke access for any services using it."
      @confirm="onConfirm"
    )
      template(#trigger)
        ui-button(:variant="Variant.Red") Delete API key
  variant(title="Busy state")
    domain-ui-confirm-delete-modal(name="model" :busy="true" @confirm="onConfirm")
      template(#trigger)
        ui-button(:variant="Variant.Red") Delete (busy)
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { Variant } from '@/features/ui/clickables/model'

@Component
export default class ConfirmDeleteModalStory extends Vue {
  private Variant = Variant

  onConfirm(): void {
    console.log('confirmed')
  }
}
</script>
