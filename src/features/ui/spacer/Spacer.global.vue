<template lang="pug">
div(:class="classes" :style="styles")
</template>

<script lang="ts">
import { EnumProp } from '@/util/prop-decorators'
import { Component, Vue } from 'vue-facing-decorator'
import { SpacerDirection, SpacerSize } from './model'

const SIZE_PX: Record<SpacerSize, number> = {
  [SpacerSize.XS]: 4,
  [SpacerSize.SM]: 8,
  [SpacerSize.MD]: 16,
  [SpacerSize.LG]: 24,
  [SpacerSize.XL]: 32,
  [SpacerSize.XXL]: 48,
}

@Component
export default class Spacer extends Vue {
  @EnumProp(SpacerSize.MD, ...Object.values(SpacerSize))
  private size!: SpacerSize

  @EnumProp(SpacerDirection.VERTICAL, ...Object.values(SpacerDirection))
  private direction!: SpacerDirection

  public get classes(): string[] {
    return ['block', 'shrink-0']
  }

  public get styles(): JsonObject {
    const dim = `${SIZE_PX[this.size]}px`
    return this.direction === SpacerDirection.VERTICAL ? { height: dim } : { width: dim }
  }
}
</script>
