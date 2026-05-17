<template lang="pug">
story(title="Clickable")
  ui-clickable
    | Bla
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class ClickableStory extends Vue {}
</script>
