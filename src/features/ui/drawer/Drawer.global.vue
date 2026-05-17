<template lang="pug">
dialog-root(:open="model" @update:open="onUpdateOpen")
  dialog-trigger(v-if="$slots.trigger" as-child)
    slot(name="trigger" :open="openDrawer" :close="close" :is-open="model")
  dialog-portal
    dialog-overlay(class="drawer-overlay fixed inset-0 z-40 bg-black/30")
    dialog-content(
      class="drawer-panel fixed inset-y-0 right-0 z-50 w-[800px] max-w-full bg-white shadow-2xl border-l border-gray-200 flex flex-col focus-visible:outline-hidden"
      @open-auto-focus="$event.preventDefault()"
    )
      visually-hidden
        dialog-title
      div(class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0")
        div(class="flex-1 min-w-0")
          slot(name="title")
            span(class="type-section-title") {{ title }}
        dialog-close(as-child)
          ui-icon-button(icon="close" :icon-size="18" size="SM" variant="gray" square class="shrink-0")
      div(class="flex-1 min-h-0 overflow-y-auto")
        slot
      div(v-if="$slots.footer" class="shrink-0 border-t border-gray-100")
        slot(name="footer")
</template>

<script lang="ts">
import { StringProp } from '@/util/prop-decorators'
import { DialogClose, DialogContent, DialogOverlay, DialogPortal, DialogRoot, DialogTrigger, DialogTitle, VisuallyHidden } from 'reka-ui'
import { Component, Model, Vue } from 'vue-facing-decorator'

type DrawerEmits = {
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
  (e: 'open'): void
  (e: string): void
}

@Component({
  components: {
    DialogRoot,
    DialogPortal,
    DialogContent,
    DialogOverlay,
    DialogTrigger,
    DialogClose,
    DialogTitle,
    VisuallyHidden,
  },
})
export default class Drawer extends Vue {
  declare public $emit: DrawerEmits

  @Model({ type: Boolean, default: false })
  public model!: boolean

  @StringProp('')
  public readonly title!: string

  public openDrawer(): void {
    this.model = true
    this.$emit('open')
  }

  public close(): void {
    this.model = false
    this.$emit('close')
  }

  public onUpdateOpen(value: boolean): void {
    if (!value) this.close()
  }
}
</script>

<style>
.drawer-overlay[data-state='open'] {
  animation: drawer-fade-in 0.2s ease;
}
.drawer-overlay[data-state='closed'] {
  animation: drawer-fade-out 0.2s ease;
}

.drawer-panel[data-state='open'] {
  animation: drawer-slide-in 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}
.drawer-panel[data-state='closed'] {
  animation: drawer-slide-out 0.22s cubic-bezier(0.32, 0.72, 0, 1);
}

@keyframes drawer-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes drawer-fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@keyframes drawer-slide-in {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
@keyframes drawer-slide-out {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100%);
  }
}
</style>
