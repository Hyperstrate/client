<template lang="pug">
story(title="Pagination")
  variant(title="Multiple pages")
    div(class="p-4")
      ui-pagination(v-model="page" :pages="10" :total="300" :per-page="30")
      p(class="mt-2 text-xs text-zinc-400") Current page: {{ page }}
  variant(title="Few pages (no arrows)")
    div(class="p-4")
      ui-pagination(v-model="page2" :pages="2" :total="40" :per-page="20")
  variant(title="Single page (hidden)")
    div(class="p-4")
      ui-pagination(v-model="page3" :pages="1" :total="5" :per-page="30")
      p(class="text-xs text-zinc-400") (page nav hidden when pages = 1)
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class PaginationStory extends Vue {
  private page = 1
  private page2 = 1
  private page3 = 1
}
</script>
