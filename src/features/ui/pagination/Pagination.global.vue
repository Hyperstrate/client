<template lang="pug">
div(class="flex items-center justify-between")
  div(class="flex items-center gap-3")
    page-size(ref="pageSizeRef" v-model="perPageOption")
    span(v-if="total !== 0" class="text-sm text-zinc-400") {{ total }} total
  div(v-if="pages > 1" class="flex items-center gap-1")
    page-button(v-if="pages > 2" v-bind="$props" :page="prevPage" @click="onPageClick(prevPage)")
      ui-icon(icon="arrow-left" size="16")
    ol(v-if="items.length" class="flex list-none gap-1")
      li(v-for="p in items" :key="p")
        page-button(v-bind="$props" :page="p" @click="onPageClick(p)")
    page-button(v-if="pages > 2" v-bind="$props" :page="nextPage" @click="onPageClick(nextPage)")
      ui-icon(icon="arrow-right" size="16")
</template>

<script lang="ts">
import { IntegerProp } from '@/util/prop-decorators'
import { range } from 'lodash'
import { type ComponentPublicInstance } from 'vue'
import { Component, Model, Ref, Vue } from 'vue-facing-decorator'
import { type Option } from '../inputs/model'
import PageButton from './PageButton.vue'
import PageSize, { DEFAULT_PER_PAGE_OPTIONS } from './PageSize.vue'
import { getPageSizeLabel } from './model'

type PaginationEmits = {
  (e: 'update:perPage', value: number): void
  (e: string): void
}

@Component({ components: { PageButton, PageSize } })
export default class Pagination extends Vue {
  declare public $emit: PaginationEmits

  @Model()
  public model!: number

  @IntegerProp(DEFAULT_PER_PAGE_OPTIONS[0].value)
  public perPage!: number

  @IntegerProp(true, 0)
  public pages!: number

  @IntegerProp(5, 0)
  public displayPages!: number

  @IntegerProp(0, 0)
  public total!: number

  @Ref
  private pageSizeRef?: ComponentPublicInstance<PageSize>

  private page = 1

  private get perPageOption(): Option<number> {
    const perPage = this.perPage
    return this.pageSizeRef?.options.find(({ value }) => value === perPage) ?? { label: getPageSizeLabel(perPage), value: perPage }
  }

  private set perPageOption({ value }) {
    this.$emit('update:perPage', value)
  }

  private get items(): number[] {
    const { displayPages, pages, model } = this

    if (displayPages < 1 || pages < 1) return []

    const neighbors = Math.floor(displayPages / 2)

    let from = model - neighbors
    let to = model + neighbors

    if (from < 1) {
      to += 1 - from
      from = 1
    }

    if (to > pages) {
      from -= to - pages
      to = pages
    }

    from = Math.max(1, from)
    to = Math.min(pages, to)

    return range(from, to + 1)
  }

  private get prevPage(): number {
    return Math.max(this.model - 1, 1)
  }

  private get nextPage(): number {
    return Math.min(this.model + 1, this.pages)
  }

  private onPageClick(value: number): void {
    this.page = value
    this.model = value
  }

  private mounted(): void {
    this.page = this.model
  }
}
</script>
