<template lang="pug">
component(:is="tag" :class="{ 'cursor-pointer': !disabled, 'pointer-events-none': disabled }" :role="role" :disabled="isButton ? disabled : undefined" class="flex")
  div(v-if="$slots['before']")
    slot(name="before")
  slot
  div(v-if="$slots['after']")
    slot(name="after")
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { ClickableAttrs } from './model'
import { BooleanProp } from '@/util/prop-decorators'

@Component
export default class Clickable extends Vue {
  @BooleanProp(false)
  private readonly disabled!: boolean

  declare public $attrs: ClickableAttrs

  private get tag(): string {
    if (this.$attrs.to) {
      return 'router-link'
    }

    return this.$attrs.tag || 'a'
  }

  private get isButton(): boolean {
    return this.tag === 'button'
  }

  private get role(): string | undefined {
    if (this.isButton) return undefined
    return (this.$attrs as { role?: string }).role ?? 'link'
  }
}
</script>
