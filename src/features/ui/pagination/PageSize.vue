<template lang="pug">
ui-input-select(v-model="model" :options="options" class="w-36")
</template>

<script lang="ts">
import { Component, Model, Vue } from 'vue-facing-decorator'
import { type Option } from '../inputs/model'
import { getPageSizeLabel } from './model'

const DEFAULT_PER_PAGE = [10, 20, 30] as const
export const DEFAULT_PER_PAGE_OPTIONS = Object.values(DEFAULT_PER_PAGE).map((value) => ({
  label: getPageSizeLabel(value),
  value,
}))

@Component
export default class PageSize extends Vue {
  @Model
  public model!: Option<number>

  public get options(): Option<number>[] {
    return DEFAULT_PER_PAGE_OPTIONS
  }
}
</script>
