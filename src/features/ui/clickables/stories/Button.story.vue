<template lang="pug">
story(title="Button")
  variant(title="Variants")
    div(class="flex flex-wrap gap-2")
      ui-button(v-for="v in variantValues" :key="v" :variant="v") {{ v }}
  variant(title="Outlined")
    div(class="flex flex-wrap gap-2")
      ui-button(v-for="v in variantValues" :key="v" :variant="v" :outlined="true") {{ v }}
  variant(title="Sizes")
    div(class="flex items-center flex-wrap gap-2")
      ui-button(:size="Size.XS") XSmall
      ui-button(:size="Size.SM") Small
      ui-button(:size="Size.MD") Medium
      ui-button(:size="Size.LG") Large
  variant(title="Disabled")
    div(class="flex flex-wrap gap-2")
      ui-button(:variant="Variant.Dark" disabled) Disabled
      ui-button(:variant="Variant.Blue" disabled) Disabled blue
  variant(title="Square / Rounded")
    div(class="flex gap-2")
      ui-button(:square="true")
        ui-icon(icon="plus" size="16")
      ui-button(:rounded="true")
        ui-icon(icon="plus" size="16")
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { Size, Variant } from '../model'

@Component
export default class ButtonStory extends Vue {
  private Variant = Variant
  private Size = Size
  public variantValues: string[] = Object.values(Variant)
}
</script>
