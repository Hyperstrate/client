<template lang="pug">
story(title="InfiniteScroll")
  variant(title="Default")
    div(class="flex flex-col gap-2")
      ui-infinite-scroll(class="h-64 border border-zinc-200 rounded-lg" @scrolled-to-bottom="loadMore")
        div(v-for="n in itemCount" :key="n" class="px-4 py-2.5 border-b border-zinc-100 last:border-0 text-sm text-zinc-700") Item {{ n }}
      p(class="text-xs text-zinc-400") Scroll to the bottom to load more. {{ itemCount }} items loaded.
  variant(title="Disabled")
    div(class="flex flex-col gap-2")
      ui-infinite-scroll(class="h-40 border border-zinc-200 rounded-lg" disabled)
        div(v-for="n in 5" :key="n" class="px-4 py-2.5 border-b border-zinc-100 last:border-0 text-sm text-zinc-700") Item {{ n }}
      p(class="text-xs text-zinc-400") Scroll trigger disabled — no event emitted.
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class InfiniteScrollStory extends Vue {
  public itemCount = 10

  public loadMore(): void {
    if (this.itemCount < 50) this.itemCount += 10
  }
}
</script>
