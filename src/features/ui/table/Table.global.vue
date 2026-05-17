<template lang="pug">
table(class="ui-table min-w-full relative" :class="[bgColor]")
  ui-table-thead(
    :headless="headless"
    :columns="shownColumns"
    :sort-keys="sortKeys"
    :hidden-columns="hiddenColumns"
    :enabled-columns="enabledColumns"
    :disabled-columns="disabledColumns"
    @update:sort-keys="$emit('update:sortKeys', $event)"
  )
    template(v-for="name in headSlots" #[name]="props")
      slot(:name="name" v-bind="props")
  tbody(v-if="slicedRows.length > 0" v-loading="loading")
    template(v-for="[index, row] of slicedRows.entries()" :key="index")
      tr(:class="[bodyRowClasses(row, index), rowClasses(row)]" class="group transition-colors duration-150" @click="onRowClick({ row, index })")
        td(
          v-for="(column, idx) of shownColumns"
          :key="column.key?.(row) ?? idx"
          :style="{ 'text-align': column.align, 'vertical-align': column.verticalAlign, width: column.width, 'max-width': column.width }"
          class="px-4 py-2.5 truncate max-w-0 type-body"
          :class="{ '[&>*]:mr-auto': column.align === 'left', '[&>*]:ml-auto': column.align === 'right', '[&>*]:mx-auto': column.align === 'center' }"
        )
          slot(:index="index" :row="row" :column="column" :name="kebabCase(column.name)" :value="column.accessor(row)" :expanded="isRowExpanded(row, index)")
            | {{ column.accessor(row) }}
      tr(v-if="isRowExpanded(row, index)" :class="expandedRowClasses(index)")
        td(:colspan="shownColumns.length + 1" class="empty:hidden p-0")
          div(class="overflow-x-auto w-0 min-w-full")
            slot(name="row.expanded" :row="row" :index="index")
  tbody(v-else-if="!loading")
    tr
      td(:colspan="shownColumns.length" class="py-10 text-center")
        div(class="flex flex-col items-center gap-1")
          p(class="type-section-title !text-zinc-400") {{ emptyMessage }}
          p(class="type-caption") Rows will appear here when available.
</template>

<script lang="ts">
import { cssLength } from '@/util/css-length'
import { isString } from '@/util/lang'
import { ArrayProp, BooleanProp, FunctionProp, IntegerProp, StringProp } from '@/util/prop-decorators'
import { get, kebabCase, startCase } from 'lodash'
import { Component, Vue } from 'vue-facing-decorator'
import { RowClickedEvent, type Accessor, type Column, type IsRowExpanded, type NormalizedColumn, type SortKey } from './model'

export function createAccessor(accessor: string | Accessor): Accessor {
  return isString(accessor) ? (row) => get(row, accessor) : accessor
}

type TableEmits = {
  (e: 'update:sortKeys', value: SortKey[]): void
  (e: 'rowClick', value: RowClickedEvent): void
  (e: string): void
}

@Component
export default class Table extends Vue {
  declare public $emit: TableEmits

  @ArrayProp(() => [])
  private readonly rows!: unknown[]

  @ArrayProp(() => [])
  private readonly columns!: Column[]

  @ArrayProp(() => [])
  private readonly hiddenColumns!: string[]

  @ArrayProp()
  private readonly enabledColumns?: string[]

  @ArrayProp(() => [])
  private readonly disabledColumns!: string[]

  @ArrayProp(() => [])
  private readonly sortKeys!: SortKey[]

  @FunctionProp(() => [])
  private readonly rowClasses!: (row: unknown) => string[]

  @BooleanProp()
  private readonly headless!: boolean

  @StringProp('bg-white')
  private readonly bgColor!: string

  @FunctionProp(() => false)
  private readonly isRowHighlighted!: (row: unknown) => boolean

  @FunctionProp(() => false)
  private readonly isRowDisabled!: (row: unknown) => boolean

  @IntegerProp(Number.MAX_SAFE_INTEGER, 1)
  private readonly renderSlices!: number

  @FunctionProp(() => false)
  private readonly isRowExpanded!: IsRowExpanded

  @StringProp('No data')
  private readonly emptyMessage!: string

  @BooleanProp(false)
  private readonly loading!: boolean

  private readonly kebabCase = kebabCase

  private slice = Number.MAX_SAFE_INTEGER

  private get normalizedColumns(): NormalizedColumn[] {
    return this.columns.map(({ name, accessor, label, align, alignColumn, verticalAlign, sortable, hideable, width, order, key }, index) => ({
      name,
      accessor: createAccessor(accessor ?? name),
      label: label ?? startCase(name),
      sortable: sortable === true ? name : sortable || undefined,
      align: align ?? 'left',
      alignColumn: align ?? alignColumn ?? 'left',
      verticalAlign: verticalAlign ?? 'middle',
      hideable: hideable || true,
      index,
      width: cssLength(width),
      order: order ?? index,
      key,
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

  private get slicedRows(): unknown[] {
    return this.rows.length > this.slice ? this.rows.slice(0, this.slice) : this.rows
  }

  private bodyRowClasses(row: unknown, index: number): string[] {
    const classes = [
      this.isRowHighlighted(row) ? 'bg-zinc-50' : 'hover:bg-zinc-50/80',
      this.isRowDisabled(row) ? 'opacity-50' : '',
      this.isRowExpanded(row, index) || index < this.slicedRows.length - 1 ? 'border-b border-zinc-100' : 'border-b-0',
    ]

    return classes.filter(Boolean)
  }

  private expandedRowClasses(index: number): string[] {
    return [index < this.slicedRows.length - 1 ? 'border-b border-zinc-100' : 'border-b-0']
  }

  private get headSlots(): string[] {
    return Object.keys(this.$slots).filter((slotName) => slotName.endsWith('.label'))
  }

  private created(): void {
    this.slice = this.renderSlices
  }

  private async mounted(): Promise<void> {
    while (this.rows.length > this.slice) {
      await new Promise((resolve) => requestAnimationFrame(resolve))
      this.slice += this.renderSlices
    }

    this.slice = Number.MAX_SAFE_INTEGER
  }

  private onRowClick(args: RowClickedEvent): void {
    this.$emit('rowClick', args)
  }
}
</script>

<style lang="postcss" scoped>
.ui-table {
  border-collapse: separate;
  border-spacing: 0;
}
</style>
