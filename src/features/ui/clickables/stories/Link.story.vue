<template lang="pug">
story(title="Link")
  ui-link
    template(#before)
      | test
    | Bla
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class ClickableStory extends Vue {}
</script>
