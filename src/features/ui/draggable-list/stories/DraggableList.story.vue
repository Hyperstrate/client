<template lang="pug">
story(title="DraggableList")
  variant(title="Default")
    div(class="flex flex-col gap-3 w-72")
      ui-draggable-list(:items="items" key-by="id" @reorder="items = $event")
        template(#default="{ item }")
          div(class="flex items-center gap-3 px-3 py-2.5 bg-white border border-zinc-200 rounded-lg cursor-grab active:cursor-grabbing")
            ui-icon(icon="drag-handle" :size="16" class="text-zinc-400 shrink-0")
            span(class="text-sm text-zinc-700") {{ item.label }}
      p(class="text-xs text-zinc-400") Drag rows to reorder
  variant(title="With actions")
    div(class="flex flex-col gap-3 w-80")
      ui-draggable-list(:items="items" key-by="id" @reorder="items = $event")
        template(#default="{ item, index }")
          div(class="flex items-center gap-3 px-3 py-2.5 bg-white border border-zinc-200 rounded-lg")
            ui-icon(icon="drag-handle" :size="16" class="text-zinc-400 shrink-0 cursor-grab")
            span(class="flex-1 text-sm text-zinc-700") {{ item.label }}
            ui-badge {{ index + 1 }}
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

interface Item {
  id: string
  label: string
}

@Component
export default class DraggableListStory extends Vue {
  public items: Item[] = [
    { id: '1', label: 'First item' },
    { id: '2', label: 'Second item' },
    { id: '3', label: 'Third item' },
    { id: '4', label: 'Fourth item' },
  ]
}
</script>
