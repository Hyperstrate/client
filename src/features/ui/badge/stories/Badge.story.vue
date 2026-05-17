<template lang="pug">
story(title="Badge")
  variant(title="Variants")
    div(class="flex flex-wrap gap-2")
      ui-badge(:variant="Variant.Dark") Dark
      ui-badge(:variant="Variant.Gray") Gray
      ui-badge(:variant="Variant.Blue") Blue
      ui-badge(:variant="Variant.Green") Green
      ui-badge(:variant="Variant.Red") Red
      ui-badge(:variant="Variant.Orange") Orange
      ui-badge(:variant="Variant.Purple") Purple
      ui-badge(:variant="Variant.Indigo") Indigo
  variant(title="Sizes")
    div(class="flex flex-wrap items-center gap-2")
      ui-badge(:size="Size.XS") XS
      ui-badge(:size="Size.SM") SM
      ui-badge(:size="Size.MD") MD
      ui-badge(:size="Size.LG") LG
  variant(title="With dot")
    div(class="flex flex-wrap gap-2")
      ui-badge(:variant="Variant.Blue" dot) Blue
      ui-badge(:variant="Variant.Green" dot) Green
      ui-badge(:variant="Variant.Red" dot) Red
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { Size, Variant } from '../../clickables/model'

@Component
export default class BadgeStory extends Vue {
  private Variant = Variant
  private Size = Size
}
</script>
