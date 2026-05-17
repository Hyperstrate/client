<template lang="pug">
div(class="flex items-start justify-between gap-4")
  div(class="flex flex-col gap-0.5")
    h1(class="type-page-title") {{ title }}
    p(v-if="subtitle" class="type-body-muted") {{ subtitle }}
  div(v-if="$slots['actions']" class="flex items-center gap-2 shrink-0")
    slot(name="actions")
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { StringProp } from '@/util/prop-decorators'

@Component
export default class PageHeader extends Vue {
  @StringProp(true)
  public readonly title!: string

  @StringProp()
  public readonly subtitle?: string
}
</script>
