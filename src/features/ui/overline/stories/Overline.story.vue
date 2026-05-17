<template lang="pug">
story(title="Overline")
  variant(title="Default")
    div(class="p-4")
      ui-overline Section label
  variant(title="Compact")
    div(class="p-4")
      ui-overline(:compact="true") Compact label
  variant(title="Above content")
    div(class="flex flex-col gap-2 p-4")
      ui-overline Router settings
      p(class="text-sm text-zinc-700") Content below an overline label.
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class OverlineStory extends Vue {}
</script>
