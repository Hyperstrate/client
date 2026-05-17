<template lang="pug">
component(:is="component" v-bind="$attrs" :style="sizeStyle" class="outline-hidden")
</template>

<script lang="ts">
import { cssLength } from '@/util/css-length'
import { OptionalProp } from '@/util/prop-decorators'
import { type Component as VueComponent, ComponentPublicInstance, markRaw } from 'vue'
import { Component, Vue, Watch } from 'vue-facing-decorator'

@Component
export default class Icon extends Vue {
  @OptionalProp()
  private readonly icon?: string | VueComponent

  @OptionalProp(24)
  private readonly size!: string | number

  private component?: ComponentPublicInstance

  private async loadIcon(): Promise<void> {
    if (!this.icon) {
      this.component = undefined
      return
    }

    if (typeof this.icon !== 'string') {
      this.component = markRaw(this.icon) as ComponentPublicInstance
      return
    }

    try {
      const componentModule = await import(`./icons/${this.icon}.svg?component`)
      this.component = markRaw(componentModule.default)
    } catch (error) {
      console.error(`Failed to load icon: ${this.icon}`, error)
      this.component = undefined
    }
  }

  private get sizeStyle(): JsonObject {
    return { width: cssLength(this.size), height: cssLength(this.size) }
  }

  mounted(): void {
    void this.loadIcon()
  }

  @Watch('icon')
  private onIconChange(): void {
    void this.loadIcon()
  }
}
</script>
