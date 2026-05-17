<template lang="pug">
div(class="flex flex-col gap-2")
  div(v-for="(pair, idx) in safeValue" :key="idx" class="flex items-end gap-2")
    slot(name="key-input" :pair="pair" :idx="idx" :on-update-key="(v: string) => updateKey(idx, v)")
      ui-input-text(:model-value="pair.key" :placeholder="keyPlaceholder" class="flex-1 min-w-0" @update:model-value="updateKey(idx, $event)")
    slot(name="value-input" :pair="pair" :idx="idx" :on-update-value="(v: string) => updateValue(idx, v)")
      ui-input-text(:model-value="pair.value" :placeholder="valuePlaceholder" class="flex-1 min-w-0" @update:model-value="updateValue(idx, $event)")
    slot(name="actions" :idx="idx" :on-remove="() => removePair(idx)")
</template>

<script lang="ts">
import { BooleanProp, StringProp } from '@/util/prop-decorators'
import { Component, Model, Vue } from 'vue-facing-decorator'
import { type Input } from '../inputs/model'

export interface KeyValuePair {
  key: string
  value: string
}

type InputKeyValueEmits = {
  (e: 'update:modelValue', value: KeyValuePair[]): void
  (e: string): void
}

@Component({ inheritAttrs: false, emits: ['update:modelValue'] })
export default class InputKeyValue extends Vue implements Input {
  declare public $emit: InputKeyValueEmits

  @Model
  protected readonly value!: KeyValuePair[]

  @BooleanProp()
  public readonly error!: boolean

  @StringProp('Key')
  public readonly keyPlaceholder!: string

  @StringProp('Value')
  public readonly valuePlaceholder!: string

  public pristine = true

  protected get safeValue(): KeyValuePair[] {
    return this.value ?? []
  }

  public get normalizedValue(): KeyValuePair[] {
    return this.safeValue
  }

  public get empty(): boolean {
    return this.safeValue.length === 0
  }

  public addPair(): void {
    this.pristine = false
    this.$emit('update:modelValue', [...this.safeValue, { key: '', value: '' }])
  }

  public removePair(idx: number): void {
    this.pristine = false
    this.$emit(
      'update:modelValue',
      this.safeValue.filter((_, i) => i !== idx),
    )
  }

  public updateKey(idx: number, key: string): void {
    this.pristine = false
    this.$emit(
      'update:modelValue',
      this.safeValue.map((p, i) => (i === idx ? { ...p, key } : p)),
    )
  }

  public updateValue(idx: number, value: string): void {
    this.pristine = false
    this.$emit(
      'update:modelValue',
      this.safeValue.map((p, i) => (i === idx ? { ...p, value } : p)),
    )
  }
}
</script>
