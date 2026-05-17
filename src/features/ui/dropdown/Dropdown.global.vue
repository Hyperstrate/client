<template lang="pug">
dropdown-menu-root(v-model:open="isOpen")
  dropdown-menu-trigger(as="div" @click.stop="open")
    slot(name="trigger" :open="open" :close="close" :toggle="toggle")
  dropdown-menu-content(class="min-w-[200px] rounded-md bg-white shadow-lg border border-zinc-200 z-10" :align="align")
    slot(name="content" :open="open" :close="close" :toggle="toggle")
</template>

<script lang="ts">
import { EnumProp } from '@/util/prop-decorators'
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuRoot, DropdownMenuTrigger } from 'reka-ui'
import { Component, Vue } from 'vue-facing-decorator'
import { DropdownContentAlign } from './model'

@Component({
  components: {
    DropdownMenuRoot,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
  },
})
export default class Dropdown extends Vue {
  private isOpen: boolean = false

  public open(): void {
    this.isOpen = true
  }

  public close(): void {
    this.isOpen = false
  }

  public toggle(): void {
    this.isOpen = !this.isOpen
  }

  @EnumProp(DropdownContentAlign.START, ...Object.values(DropdownContentAlign))
  public readonly align!: DropdownContentAlign
}
</script>
