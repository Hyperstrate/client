<template lang="pug">
story(title="InputSearch")
  variant(title="Default")
    div(class="p-4 max-w-sm")
      ui-input-search(v-model="query" placeholder="Search...")
      p(class="mt-2 text-xs text-zinc-400") Value: {{ query }}
  variant(title="Readonly")
    div(class="p-4 max-w-sm")
      ui-input-search(v-model="query" :readonly="true")
  variant(title="Disabled")
    div(class="p-4 max-w-sm")
      ui-input-search(v-model="query" disabled placeholder="Disabled search")
  variant(title="Custom debounce (0ms)")
    div(class="p-4 max-w-sm")
      ui-input-search(v-model="query2" placeholder="Instant search" :debounce-ms="0")
      p(class="mt-2 text-xs text-zinc-400") Value: {{ query2 }}
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class InputSearchStory extends Vue {
  private query = ''
  private query2 = ''
}
</script>
