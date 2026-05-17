<template lang="pug">
story(title="Kbd")
  variant(title="Single keys")
    div(class="flex items-center gap-2")
      ui-kbd ⌘
      ui-kbd K
      ui-kbd esc
      ui-kbd ↵
      ui-kbd ↑↓
  variant(title="Shortcuts in context")
    div(class="flex flex-col gap-3")
      div(class="flex items-center gap-1 text-sm text-zinc-500")
        ui-kbd ⌘
        span +
        ui-kbd K
        span(class="ml-1") Open command palette
      div(class="flex items-center gap-1 text-sm text-zinc-500")
        ui-kbd Ctrl
        span +
        ui-kbd S
        span(class="ml-1") Save
      div(class="flex items-center gap-1 text-sm text-zinc-500")
        ui-kbd ↑↓
        span(class="ml-1") Navigate
      div(class="flex items-center gap-1 text-sm text-zinc-500")
        ui-kbd ↵
        span(class="ml-1") Confirm
      div(class="flex items-center gap-1 text-sm text-zinc-500")
        ui-kbd esc
        span(class="ml-1") Dismiss
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class KbdStory extends Vue {}
</script>
