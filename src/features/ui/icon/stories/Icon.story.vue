<template lang="pug">
story(title="Icon")
  variant(title="Common icons")
    div(class="flex flex-wrap gap-4 p-4 items-center")
      div(v-for="name in icons" :key="name" class="flex flex-col items-center gap-1")
        ui-icon(:icon="name" :size="24")
        span(class="text-xs text-zinc-400") {{ name }}
  variant(title="Sizes")
    div(class="flex items-center gap-4 p-4")
      ui-icon(icon="check" :size="12")
      ui-icon(icon="check" :size="16")
      ui-icon(icon="check" :size="20")
      ui-icon(icon="check" :size="24")
      ui-icon(icon="check" :size="32")
      ui-icon(icon="check" :size="48")
  variant(title="String size")
    div(class="flex items-center gap-4 p-4")
      ui-icon(icon="check" size="1rem")
      ui-icon(icon="check" size="2rem")
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class IconStory extends Vue {
  private icons = ['check', 'close', 'plus', 'edit', 'trash', 'search', 'chevron-down', 'arrow-left', 'arrow-right', 'chat', 'cogs', 'key', 'shield', 'info']
}
</script>
