<template lang="pug">
div(class="flex flex-col gap-2")
  div(v-for="(row, idx) in rows" :key="row.id" class="flex items-center gap-2")
    component(:is="arrayInput" :model-value="row.value" v-bind="$attrs" class="flex-1 min-w-0" @update:model-value="onRowChange(row, $event)")
      template(v-for="(slot, name) in $slots" #[name]="props")
        slot(:name="name" v-bind="props")
    ui-icon-button(type="button" icon="close" :icon-size="16" :size="Size.SM" :variant="Variant.Gray" class="shrink-0 !text-red-600" square @click="removeRow(idx)")
  div
    ui-button(type="button" :size="Size.SM" :variant="Variant.Gray" @click="addRow")
      ui-icon(icon="plus" :size="14")
      | Add
</template>

<script lang="ts">
import { Size, Variant } from '@/features/ui/clickables/model'
import { isDef, isNull } from '@/util/lang'
import { RequiredProp, StringProp } from '@/util/prop-decorators'
import { get, isArray, isEqual } from 'lodash'
import { Component, Model, Vue, Watch } from 'vue-facing-decorator'
import { type Input } from '../model'

type InputArrayItemEmits = {
  (e: 'update:modelValue', value: unknown): void
  (e: string): void
}

type Row<T> = {
  id: number
  value?: T
}

@Component({
  inheritAttrs: false,
})
export default class InputArrayItem<T = unknown> extends Vue implements Input {
  declare public $emit: InputArrayItemEmits

  public readonly Size = Size
  public readonly Variant = Variant

  @Model
  private readonly value!: T[] | T | undefined

  @RequiredProp()
  public readonly arrayInput!: unknown

  @StringProp()
  public readonly itemValuePath?: string

  public rows: Row<T>[] = []
  public pristine = true
  private nextId = 0

  public get normalizedValue(): unknown[] | undefined {
    const values = this.rows.map((row) => this.normalizeItem(row.value)).filter(isDef)
    return values.length > 0 ? values : undefined
  }

  public get empty(): boolean {
    return this.normalizedValue === undefined
  }

  public addRow(): void {
    this.rows = [...this.rows, this.createRow()]
    this.pristine = false
  }

  public removeRow(idx: number): void {
    const rows = this.rows.filter((_, i) => i !== idx)
    this.rows = rows.length > 0 ? rows : [this.createRow()]
    this.pristine = false
    this.emitRows()
  }

  public onRowChange(row: Row<T>, value: T | undefined): void {
    row.value = value
    this.pristine = false
    this.emitRows()
  }

  @Watch('value', { immediate: true, deep: true })
  private onValueChange(): void {
    const values = this.toArray(this.value)
    const current = this.rows.map((row) => row.value).filter((item): item is T => isDef(item) && !isNull(item))
    if (isEqual(values, current)) return
    this.rows = values.length > 0 ? values.map((value) => this.createRow(value)) : [this.createRow()]
  }

  private emitRows(): void {
    const values = this.rows.map((row) => row.value).filter((item): item is T => isDef(item) && !isNull(item))
    this.$emit('update:modelValue', values.length > 0 ? values : undefined)
  }

  private createRow(value?: T): Row<T> {
    this.nextId += 1
    return { id: this.nextId, value }
  }

  private toArray(value: T[] | T | undefined): T[] {
    if (isArray(value)) return value.filter((item) => isDef(item) && !isNull(item))
    return isDef(value) && !isNull(value) ? [value] : []
  }

  private normalizeItem(value: T | undefined): unknown {
    if (!isDef(value) || isNull(value)) return undefined
    return this.itemValuePath ? get(value, this.itemValuePath) : value
  }
}
</script>
