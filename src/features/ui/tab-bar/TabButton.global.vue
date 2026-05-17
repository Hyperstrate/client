<template lang="pug">
ui-clickable(:class="[tabBar.buttonClasses, isActive ? tabBar.selectedButtonClasses : '']" @click="onClick")
  slot
</template>

<script lang="ts">
import { RequiredProp } from '@/util/prop-decorators'
import { Component, Inject, Vue } from 'vue-facing-decorator'
import { TAB_BAR } from './model'
import TabBar from './TabBar.global.vue'

@Component
export default class TabButton extends Vue {
  @RequiredProp()
  public readonly value!: unknown

  @Inject({ from: TAB_BAR })
  private readonly tabBar!: TabBar

  private get isActive(): boolean {
    return this.tabBar.isSelected(this)
  }

  private onClick(): void {
    this.tabBar.select(this)
  }

  private beforeUnmount(): void {
    this.tabBar.remove(this)
  }
}
</script>
