<template lang="pug">
dialog-root(:open="isOpen" @update:open="onUpdateOpen")
  dialog-trigger(v-if="$slots.trigger" as-child @click.stop="open")
    slot(name="trigger" :open="open" :close="close" :toggle="toggle")
  dialog-portal(v-if="isOpen")
    dialog-overlay(class="fixed inset-0 z-30 bg-black/30 backdrop-blur-xs transition-all duration-100" @click="close")
    dialog-content(
      class="fixed left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl border border-zinc-200 shadow-xl w-full focus-visible:outline-hidden"
      :class="{ 'max-w-lg': size === Size.SM, 'max-w-4xl': size === Size.MD }"
      @open-auto-focus="onOpenAutoFocus"
    )
      visually-hidden
        dialog-title
        dialog-description {{ accessibleDescription }}
      slot(:open="open" :close="close" :toggle="toggle")
      dialog-close(as-child)
        slot(name="close" :close="close")
</template>

<script lang="ts">
import { BooleanProp, EnumProp, StringProp } from '@/util/prop-decorators'
import { DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogRoot, DialogTitle, DialogTrigger, VisuallyHidden } from 'reka-ui'
import { Component, Vue } from 'vue-facing-decorator'
import { Size } from '../clickables/model'

type ModalEmits = {
  (e: 'open'): void
  (e: 'close'): void
  (e: 'toggle', value: boolean): void
  (e: string): void
}

@Component({
  components: {
    DialogRoot,
    DialogPortal,
    DialogContent,
    DialogOverlay,
    DialogTrigger,
    DialogTitle,
    DialogDescription,
    DialogClose,
    VisuallyHidden,
  },
  emits: ['open', 'close', 'toggle'],
})
export default class Modal extends Vue {
  declare public $emit: ModalEmits

  @EnumProp(Size.MD, ...Object.values(Size))
  private readonly size!: Size

  @StringProp('Dialog content')
  readonly accessibleDescription!: string

  @BooleanProp(true)
  readonly preventOpenAutofocus!: boolean

  public isOpen: boolean = false
  private Size = Size

  public open(): void {
    this.isOpen = true
    this.$emit('open')
  }

  public close(): void {
    if (!this.isOpen) return
    this.isOpen = false
    this.$emit('close')
  }

  public onUpdateOpen(value: boolean): void {
    if (!value) this.close()
  }

  public onOpenAutoFocus(e: Event): void {
    if (this.preventOpenAutofocus) {
      e.preventDefault()
    }
  }

  public toggle(): void {
    if (this.isOpen) {
      this.close()
    } else {
      this.open()
    }
    this.$emit('toggle', this.isOpen)
  }
}
</script>
