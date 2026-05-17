<template lang="pug">
span(:class="classes")
  slot
</template>

<script lang="ts">
import { BooleanProp } from '@/util/prop-decorators'
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class Overline extends Vue {
  @BooleanProp(false)
  public readonly compact!: boolean

  public get classes(): string {
    return 'type-overline'
  }
}
</script>
