<template lang="pug">
ui-modal(ref="modalRef" :size="Size.SM" @open="onOpen" @close="onClose")
  template(#default)
    div(class="palette-panel flex flex-col py-1")
      div(class="flex items-center gap-2.5 px-4 h-12 shrink-0 border-b border-zinc-100")
        ui-icon(icon="search" :size="16" class="text-zinc-400 shrink-0")
        ui-input-bare(
          ref="inputBareRef"
          v-model="query"
          type="text"
          placeholder="Search pages…"
          autocomplete="off"
          spellcheck="false"
          class="flex-1 h-full text-sm text-zinc-900 bg-transparent outline-hidden placeholder:text-zinc-400"
          @keydown="onInputKeydown"
        )
        ui-icon-button(v-if="query" icon="close" :icon-size="12" :size="Size.XS" :variant="Variant.Gray" @click="query = ''")
      div(ref="listRef" class="overflow-y-auto max-h-80 p-1.5 flex flex-col")
        template(v-if="filteredApps.length > 0")
          ui-clickable(
            v-for="(app, i) in filteredApps"
            :key="app.name"
            tag="button"
            type="button"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left outline-hidden cursor-pointer transition-colors"
            :class="i === activeIndex ? 'bg-zinc-100' : 'hover:bg-zinc-50'"
            @mouseenter="activeIndex = i"
            @click="selectApp(app)"
          )
            div(
              class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors"
              :class="i === activeIndex ? 'bg-white shadow-xs ring-1 ring-zinc-200' : 'bg-zinc-100'"
            )
              ui-icon(:icon="app.icon" :size="15" class="text-zinc-500")
            span(class="flex-1 text-sm font-medium transition-colors" :class="i === activeIndex ? 'text-zinc-900' : 'text-zinc-600'") {{ app.label }}
        div(v-else class="py-10 text-center text-sm text-zinc-400")
          | No results for &ldquo;{{ query }}&rdquo;
      div(class="flex items-center justify-between px-4 py-2 border-t border-zinc-100 bg-zinc-50 shrink-0 rounded-b-xl")
        div(class="flex items-center gap-3")
          span(class="flex items-center gap-1 text-xs text-zinc-400")
            ui-kbd ↑↓
            | navigate
          span(class="flex items-center gap-1 text-xs text-zinc-400")
            ui-kbd ↵
            | open
        span(class="flex items-center gap-1 text-xs text-zinc-400")
          ui-kbd esc
          | close
</template>

<script lang="ts">
import { appOrderCompare, type App } from '@/features/core/model'
import { Size, Variant } from '@/features/ui/clickables/model'
import Modal from '@/features/ui/modal/Modal.global.vue'
import { Mixins } from '@/util/mixin'
import { Component, Ref, Watch } from 'vue-facing-decorator'
import AppsMixin from '../mixins/apps.mixin'

export const OPEN_COMMAND_PALLETE_EVENT = 'OPEN_COMMAND_PALLETE_EVENT'

interface InputBareRef {
  $el?: Element
}

@Component
export default class CommandPalette extends Mixins(AppsMixin) {
  @Ref
  public readonly modalRef!: Modal

  @Ref
  public readonly inputBareRef!: InputBareRef | HTMLInputElement

  @Ref
  public readonly listRef!: HTMLElement

  public readonly Size = Size
  public readonly Variant = Variant

  public query = ''
  public activeIndex = 0

  public get filteredApps(): App[] {
    const q = this.query.toLowerCase().trim()

    return Object.values(this.appMap)
      .filter((a) => a.link)
      .sort(appOrderCompare)
      .filter((a) => !q || a.label.toLowerCase().includes(q))
  }

  public mounted(): void {
    window.addEventListener('keydown', this.onGlobalKeydown)
    window.addEventListener(OPEN_COMMAND_PALLETE_EVENT, this.open)
  }

  public beforeUnmount(): void {
    window.removeEventListener('keydown', this.onGlobalKeydown)
    window.removeEventListener(OPEN_COMMAND_PALLETE_EVENT, this.open)
  }

  public onGlobalKeydown(e: KeyboardEvent): void {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      this.modalRef?.toggle()
    }
  }

  public open(): void {
    this.modalRef?.open()
  }

  public onOpen(): void {
    this.focusInputWhenReady()
  }

  private focusInputWhenReady(attempt = 0): void {
    void this.$nextTick(() => {
      requestAnimationFrame(() => {
        const input = this.getInputElement()

        if (input) {
          input.focus()
          input.select()
          return
        }

        if (attempt < 10) {
          window.setTimeout(() => this.focusInputWhenReady(attempt + 1), 16)
        }
      })
    })
  }

  private getInputElement(): HTMLInputElement | undefined {
    const ref = this.inputBareRef as InputBareRef | HTMLInputElement | undefined

    if (!ref) return undefined

    if (ref instanceof HTMLInputElement) {
      return ref
    }

    const el = ref.$el

    if (el instanceof HTMLInputElement) {
      return el
    }

    return el?.querySelector?.('input') ?? undefined
  }

  public onClose(): void {
    this.query = ''
    this.activeIndex = 0
  }

  public onInputKeydown(e: KeyboardEvent): void {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      this.moveUp()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      this.moveDown()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      this.selectActive()
    }
  }

  @Watch('query')
  public onQueryChange(): void {
    this.activeIndex = 0
  }

  public moveUp(): void {
    if (this.activeIndex > 0) {
      this.activeIndex--
      this.scrollActiveIntoView()
    }
  }

  public moveDown(): void {
    if (this.activeIndex < this.filteredApps.length - 1) {
      this.activeIndex++
      this.scrollActiveIntoView()
    }
  }

  private scrollActiveIntoView(): void {
    void this.$nextTick(() => {
      const el = this.listRef?.children[this.activeIndex] as HTMLElement | undefined
      el?.scrollIntoView({ block: 'nearest' })
    })
  }

  public selectActive(): void {
    const app = this.filteredApps[this.activeIndex]
    if (app) this.selectApp(app)
  }

  public selectApp(app: App): void {
    if (app.link?.to) {
      void this.$router.push(app.link.to)
    }

    this.modalRef?.close()
  }
}
</script>

<style scoped>
.palette-panel {
  animation: paletteContentIn 140ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes paletteContentIn {
  from {
    transform: translateY(-4px);
  }

  to {
    transform: none;
  }
}
</style>
