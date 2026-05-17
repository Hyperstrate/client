<template lang="pug">
story(title="Status")
  variant(title="Active / Inactive")
    div(class="flex gap-4")
      ui-status(:value="true")
      ui-status(:value="false")
  variant(title="Custom labels")
    div(class="flex gap-4")
      ui-status(:value="true" active-label="Enabled" inactive-label="Disabled")
      ui-status(:value="false" active-label="Enabled" inactive-label="Disabled")
  variant(title="Custom variants")
    div(class="flex gap-4")
      ui-status(:value="true" active-label="Online" :active-variant="Variant.Blue")
      ui-status(:value="false" inactive-label="Offline" :inactive-variant="Variant.Red")
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { Variant } from '../../clickables/model'

@Component
export default class StatusStory extends Vue {
  private Variant = Variant
}
</script>
