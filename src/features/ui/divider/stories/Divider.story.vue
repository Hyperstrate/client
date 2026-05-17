<template lang="pug">
story(title="Divider")
  variant(title="Horizontal")
    div(class="flex flex-col gap-4 w-64")
      p(class="text-sm text-zinc-600") Above the divider
      ui-divider(:direction="DividerDirection.HORIZONTAL")
      p(class="text-sm text-zinc-600") Below the divider
  variant(title="Vertical")
    div(class="flex items-center gap-4 h-12")
      p(class="text-sm text-zinc-600") Left
      ui-divider(:direction="DividerDirection.VERTICAL")
      p(class="text-sm text-zinc-600") Right
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { DividerDirection } from '../model'

@Component
export default class DividerStory extends Vue {
  private DividerDirection = DividerDirection
}
</script>
