<template lang="pug">
div(@dragover.prevent)
  div(
    v-for="(item, index) in items"
    :key="keyOf(item)"
    draggable="true"
    class="relative select-none"
    :class="{ 'opacity-40': dragIndex === index }"
    @dragstart="onDragStart(index)"
    @dragenter.prevent="onDragEnter(index)"
    @dragover.prevent
    @drop.prevent="onDrop"
    @dragend="onDragEnd"
  )
    div(
      v-if="overIndex === index && dragIndex !== undefined && overIndex !== dragIndex"
      class="absolute inset-x-2 z-10 pointer-events-none h-0.5 bg-blue-400 rounded-full"
      :class="(overIndex ?? 0) > (dragIndex ?? 0) ? 'bottom-0' : 'top-0'"
    )
    slot(:item="item" :index="index" :is-dragging="dragIndex === index")
</template>

<script lang="ts">
import { ArrayProp, StringProp } from '@/util/prop-decorators'
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class DraggableList extends Vue {
  @ArrayProp(() => [])
  public readonly items!: unknown[]

  @StringProp('id')
  public readonly keyBy!: string

  private dragIndex?: number
  private overIndex?: number
  private dropped: boolean = false

  private keyOf(item: unknown): string {
    const key = (item as Record<string, unknown>)[this.keyBy]
    if (typeof key === 'string' || typeof key === 'number' || typeof key === 'boolean') return String(key)
    return ''
  }

  private onDragStart(index: number): void {
    this.dragIndex = index
    this.dropped = false
  }

  private onDragEnter(index: number): void {
    this.overIndex = index
  }

  private onDrop(): void {
    if (this.dragIndex === undefined || this.overIndex === undefined || this.dragIndex === this.overIndex) {
      this.dragIndex = undefined
      this.overIndex = undefined
      return
    }
    const newItems = [...this.items]
    const [dragged] = newItems.splice(this.dragIndex, 1)
    newItems.splice(this.overIndex, 0, dragged)
    this.$emit('reorder', newItems)
    this.dropped = true
    this.dragIndex = undefined
    this.overIndex = undefined
  }

  private onDragEnd(): void {
    this.dragIndex = undefined
    this.overIndex = undefined
    this.dropped = false
  }
}
</script>
