<template lang="pug">
story(title="IconButton")
  variant(title="Sizes")
    div(class="flex items-center gap-4 p-4")
      ui-icon-button(icon="plus" :size="Size.XS")
      ui-icon-button(icon="plus" :size="Size.SM")
      ui-icon-button(icon="plus" :size="Size.MD")
      ui-icon-button(icon="plus" :size="Size.LG")
  variant(title="Variants")
    div(class="flex items-center gap-4 p-4")
      ui-icon-button(icon="edit" :variant="Variant.Dark")
      ui-icon-button(icon="edit" :variant="Variant.Gray")
      ui-icon-button(icon="edit" :variant="Variant.Blue")
      ui-icon-button(icon="edit" :variant="Variant.Red")
  variant(title="Disabled")
    div(class="flex items-center gap-4 p-4")
      ui-icon-button(icon="trash" disabled)
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { Size, Variant } from '../model'

@Component
export default class IconButtonStory extends Vue {
  private Size = Size
  private Variant = Variant
}
</script>
