<template lang="pug">
story(title="Card")
  variant(title="Default")
    ui-card
      p(class="text-sm text-zinc-700") This is a card with some content inside.
  variant(title="With header content")
    ui-card
      div(class="flex flex-col gap-2")
        h3(class="text-base font-semibold text-zinc-900") Card Title
        p(class="text-sm text-zinc-500") Supporting text that describes the card content.
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class CardStory extends Vue {}
</script>
