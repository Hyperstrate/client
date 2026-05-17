<template lang="pug">
story(title="Pill")
  variant(title="Variants")
    div(class="flex flex-wrap gap-2")
      ui-pill(:variant="Variant.Dark") Dark
      ui-pill(:variant="Variant.Gray") Gray
      ui-pill(:variant="Variant.Blue") Blue
      ui-pill(:variant="Variant.Green") Green
      ui-pill(:variant="Variant.Red") Red
      ui-pill(:variant="Variant.Orange") Orange
      ui-pill(:variant="Variant.Purple") Purple
      ui-pill(:variant="Variant.Indigo") Indigo
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { Variant } from '../../clickables/model'

@Component
export default class PillStory extends Vue {
  private Variant = Variant
}
</script>
