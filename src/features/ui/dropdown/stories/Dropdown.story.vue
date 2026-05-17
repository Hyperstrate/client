<template lang="pug">
story(title="Dropdown")
  variant(title="Default")
    div(class="flex justify-center p-10")
      ui-dropdown
        template(#trigger)
          ui-button Options
        template(#content)
          div(class="py-1")
            button(class="w-full px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 text-left") Edit
            button(class="w-full px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 text-left") Duplicate
            button(class="w-full px-4 py-2 text-sm text-red-600 hover:bg-zinc-50 text-left") Delete
  variant(title="With icons")
    div(class="flex justify-center p-10")
      ui-dropdown
        template(#trigger)
          ui-icon-button(icon="more-vertical")
        template(#content)
          div(class="py-1")
            button(class="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50")
              ui-icon(icon="edit" :size="16")
              | Edit
            button(class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-zinc-50")
              ui-icon(icon="trash" :size="16")
              | Delete
  variant(title="Alignment")
    div(class="flex justify-around p-10")
      ui-dropdown(v-for="align in Object.values(DropdownContentAlign)" :key="align" :align="align")
        template(#trigger)
          ui-button {{ align }}
        template(#content)
          div(class="px-4 py-2 text-sm text-zinc-600") {{ align }} aligned
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { DropdownContentAlign } from '../model'

@Component
export default class DropdownStory extends Vue {
  public readonly DropdownContentAlign = DropdownContentAlign
}
</script>
