<template lang="pug">
div(class="py-10 flex flex-col items-center gap-1")
  p(class="type-section-title !text-gray-400") {{ heading }}
  p(v-if="subheading" class="type-body-muted !text-gray-300") {{ subheading }}
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { StringProp } from '@/util/prop-decorators'

@Component
export default class EmptyState extends Vue {
  @StringProp(true)
  public readonly heading!: string

  @StringProp('')
  public readonly subheading!: string
}
</script>
