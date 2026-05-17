<template lang="pug">
div(ref="scrollContainerRef" class="relative overflow-y-auto")
  slot
  div(ref="sentinelRef" class="h-[1px] w-full pointer-events-none invisible" aria-hidden="true")
</template>

<script lang="ts">
import { BooleanProp } from '@/util/prop-decorators'
import { Component, Ref, Vue } from 'vue-facing-decorator'

type InfiniteScrollEmits = {
  (e: 'scrolledToBottom'): void
  (e: string): void
}

@Component
export default class InfiniteScroll extends Vue {
  declare public $emit: InfiniteScrollEmits

  @BooleanProp(false)
  public disabled!: boolean

  @Ref
  private sentinelRef?: HTMLElement

  @Ref
  private scrollContainerRef?: HTMLElement

  private observer?: IntersectionObserver

  private mounted(): void {
    this.setupObserver()
  }

  private beforeUnmount(): void {
    this.destroyObserver()
  }

  private setupObserver(): void {
    if (!this.sentinelRef) return

    const options: IntersectionObserverInit = {
      root: this.scrollContainerRef,
      threshold: 0,
    }

    this.observer = new IntersectionObserver(this.onIntersect, options)
    this.observer.observe(this.sentinelRef)
  }

  private destroyObserver(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = undefined
    }
  }

  private scrolledToBottom(): void {
    this.$emit('scrolledToBottom')
  }

  private onIntersect = (entries: IntersectionObserverEntry[]): void => {
    const [entry] = entries

    if (entry.isIntersecting && !this.disabled) {
      this.scrolledToBottom()
    }
  }

  public reset(): void {
    this.destroyObserver()
    void this.$nextTick(() => {
      this.setupObserver()
    })
  }
}
</script>
