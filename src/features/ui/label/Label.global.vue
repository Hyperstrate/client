<template lang="pug">
label(class="type-label")
  div(class="flex items-center gap-1")
    span(v-if="required" class="text-red-500")
      | *
    slot
</template>

<script lang="ts">
import { BooleanProp } from '@/util/prop-decorators'
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class Label extends Vue {
  @BooleanProp(false)
  private readonly required!: boolean
}
</script>
