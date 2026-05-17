<template lang="pug">
story(title="Spacer")
  variant(title="Vertical (default)")
    div(class="flex flex-col items-start bg-zinc-50 p-4 rounded w-48")
      div(class="bg-zinc-300 rounded h-6 w-full")
      ui-spacer(:size="SpacerSize.LG")
      div(class="bg-zinc-300 rounded h-6 w-full")
  variant(title="Horizontal")
    div(class="flex items-center bg-zinc-50 p-4 rounded")
      div(class="bg-zinc-300 rounded w-6 h-10")
      ui-spacer(:size="SpacerSize.LG" :direction="SpacerDirection.HORIZONTAL")
      div(class="bg-zinc-300 rounded w-6 h-10")
  variant(title="All sizes (vertical)")
    div(class="flex flex-col items-start bg-zinc-50 p-4 rounded w-64")
      template(v-for="size in sizes" :key="size")
        p(class="text-xs text-zinc-500") {{ size }}
        div(class="bg-zinc-300 rounded h-2 w-full")
        ui-spacer(:size="size")
        div(class="bg-zinc-300 rounded h-2 w-full")
        ui-spacer(:size="SpacerSize.XL")
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { SpacerDirection, SpacerSize } from '../model'

@Component
export default class SpacerStory extends Vue {
  public SpacerSize = SpacerSize
  public SpacerDirection = SpacerDirection
  public sizes = Object.values(SpacerSize)
}
</script>
