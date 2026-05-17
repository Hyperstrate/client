<template lang="pug">
thead(v-if="!headless" class="border-b border-zinc-100 bg-zinc-50/70")
  tr
    th(
      v-for="(column, index) of shownColumns"
      :key="index"
      :class="{ sortable: column.sortable }"
      class="px-4 py-2.5 type-table-head"
      :style="{ 'text-align': column.alignColumn, width: column.width }"
      @click="toggleSortKey(column)"
    )
      div(:class="{ [getSortDirection(column)]: column.sortable }" class="sort inline-flex items-center gap-1.5")
        slot(:name="`${column.name}.label`" :column="column")
          | {{ column.label }}
</template>

<script lang="ts">
import { isString } from '@/util/lang'
import { ArrayProp, BooleanProp } from '@/util/prop-decorators'
import { get, startCase } from 'lodash'
import { Component, Vue } from 'vue-facing-decorator'
import { Column, Order, type Accessor, type NormalizedColumn, type SortKey } from './model'
import { cssLength } from '@/util/css-length'

export function createAccessor(accessor: string | Accessor): Accessor {
  return isString(accessor) ? (row) => get(row, accessor) : accessor
}

type TableTheadEmits = {
  (e: 'update:sortKeys', value: SortKey[]): void
  (e: string): void
}

@Component
export default class TableThead extends Vue {
  declare public $emit: TableTheadEmits

  @ArrayProp(() => [])
  private readonly columns!: Column[]

  @BooleanProp()
  private readonly headless!: boolean

  @ArrayProp(() => [])
  private readonly sortKeys!: SortKey[]

  @ArrayProp(() => [])
  private readonly hiddenColumns!: string[]

  @ArrayProp()
  private readonly enabledColumns?: string[]

  @ArrayProp(() => [])
  private readonly disabledColumns!: string[]

  private get normalizedColumns(): NormalizedColumn[] {
    return this.columns.map(({ name, accessor, label, alignColumn, align, verticalAlign, sortable, hideable, width, order }, index) => ({
      name,
      accessor: createAccessor(accessor ?? name),
      label: label ?? startCase(name),
      sortable: sortable === true ? name : sortable || undefined,
      align: align ?? 'left',
      alignColumn: alignColumn ?? 'left',
      verticalAlign: verticalAlign ?? 'middle',
      hideable: hideable || true,
      index,
      width: cssLength(width),
      order: order ?? index,
    }))
  }

  private get filteredColumns(): NormalizedColumn[] {
    const enabledColumnSet = new Set(this.enabledColumns ?? this.columns.map(({ name }) => name))
    const disabledColumnSet = new Set(this.disabledColumns)

    return this.normalizedColumns.filter(({ name }) => enabledColumnSet.has(name)).filter(({ name }) => !disabledColumnSet.has(name))
  }

  private get shownColumns(): NormalizedColumn[] {
    return this.filteredColumns.filter(({ name, hideable }) => !hideable || !this.hiddenColumns.includes(name)).sort((a, b) => a.order - b.order)
  }

  private getSortDirection({ sortable }: NormalizedColumn): Order {
    const { direction } = this.sortKeys.find(({ key }) => key === sortable) || {
      direction: Order.ASC,
    }

    return direction
  }

  private toggleSortKey(column: NormalizedColumn): void {
    if (!column.sortable) {
      return
    }

    const sortKeys = this.sortKeys.filter(({ key }) => key !== column.sortable)

    sortKeys.unshift({
      key: column.sortable,
      direction: this.getSortDirection(column) === Order.ASC ? Order.DESC : Order.ASC,
    })

    this.$emit('update:sortKeys', sortKeys)
  }
}
</script>

<style lang="postcss" scoped>
th.sortable {
  @apply cursor-pointer select-none transition-colors duration-150;

  &:hover {
    @apply text-zinc-700;
  }
}

.sort {
  &.ASC::after {
    content: '↑';
    @apply text-zinc-400 text-xs leading-none;
  }
  &.DESC::after {
    content: '↓';
    @apply text-zinc-400 text-xs leading-none;
  }
}
</style>
