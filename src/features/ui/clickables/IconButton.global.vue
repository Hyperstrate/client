<template lang="pug">
ui-button(v-bind="$attrs" :size="size" :class="[classes, 'flex items-center justify-center']")
  ui-icon(:icon="icon" :size="iconSize")
</template>

<script lang="ts">
import { EnumProp, OptionalProp, StringProp } from '@/util/prop-decorators'
import { Component, Vue } from 'vue-facing-decorator'
import { Size } from './model'

@Component({ inheritAttrs: false })
export default class IconButton extends Vue {
  @StringProp(true)
  private readonly icon!: string

  @OptionalProp(24)
  private readonly iconSize!: string | number

  @EnumProp(Size.MD, ...Object.values(Size))
  public readonly size!: Size

  private get classes(): JsonObject {
    return {
      '!min-h-6 !min-w-6': this.size === Size.XS,
      '!min-h-8 !min-w-8': this.size === Size.SM,
      '!min-h-10 !min-w-10': this.size === Size.MD,
      '!min-h-12 !min-w-12': this.size === Size.LG,
    }
  }
}
</script>
