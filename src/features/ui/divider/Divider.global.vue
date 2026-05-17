<template lang="pug">
div(:class="classes")
</template>

<script lang="ts">
import { EnumProp } from '@/util/prop-decorators'
import { Component, Vue } from 'vue-facing-decorator'
import { DividerDirection } from './model'

@Component
export default class Divider extends Vue {
  @EnumProp(DividerDirection.HORIZONTAL, ...Object.values(DividerDirection))
  private direction!: DividerDirection

  public get classes(): JsonArray {
    const directionClasses = this.direction === DividerDirection.HORIZONTAL ? ['h-[1px] w-full'] : ['w-[1px] h-full']

    return [...directionClasses, 'bg-zinc-200']
  }
}
</script>
