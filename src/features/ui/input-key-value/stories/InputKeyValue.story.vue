<template lang="pug">
story(title="InputKeyValue")
  variant(title="With remove")
    div(class="flex flex-col gap-2 w-96")
      ui-input-key-value(v-model="pairs" key-placeholder="X-Header-Name" value-placeholder="value")
        template(#actions="{ onRemove }")
          ui-icon-button(icon="close" :icon-size="16" :size="Size.SM" :variant="Variant.Gray" class="shrink-0 !text-red-600" @click.prevent="onRemove()")
      ui-link(:size="Size.SM" :variant="Variant.Blue" @click.prevent="addPair")
        ui-icon(icon="plus" :size="16")
        | Add header
  variant(title="Without remove")
    div(class="w-96")
      ui-input-key-value(v-model="pairs" key-placeholder="Key" value-placeholder="Value")
  variant(title="Empty")
    div(class="w-96")
      ui-input-key-value(v-model="empty" key-placeholder="Key" value-placeholder="Value")
</template>

<script lang="ts">
import { type KeyValuePair } from '@/features/ui/input-key-value/InputKeyValue.global.vue'
import { Size, Variant } from '@/features/ui/clickables/model'
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class InputKeyValueStory extends Vue {
  public readonly Size = Size
  public readonly Variant = Variant

  public empty: KeyValuePair[] = []
  public pairs: KeyValuePair[] = [
    { key: 'Authorization', value: 'Bearer sk-...' },
    { key: 'X-Custom-Header', value: 'my-value' },
  ]

  public addPair(): void {
    this.pairs = [...this.pairs, { key: '', value: '' }]
  }
}
</script>
