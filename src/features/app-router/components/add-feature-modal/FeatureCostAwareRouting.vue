<template lang="pug">
div(class="flex flex-col gap-4")
  div(class="flex flex-col gap-2")
    div(class="flex items-center justify-between")
      ui-label Thresholds
      ui-link(:size="Size.SM" :variant="Variant.Purple" @click.prevent="addThreshold")
        ui-icon(icon="plus" :size="16")
        | Add threshold
    p(class="text-xs text-gray-400 -mt-1") Route to target when prompt is shorter than max chars. Evaluated in order.
    div(class="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2")
      ui-input-key-value(:model-value="thresholdPairs" key-placeholder="2000" value-placeholder="Target model")
        template(#key-input="{ idx }")
          ui-form-field(
            input="ui-input-text"
            :path="'costThresholds[' + idx + '].maxChars'"
            label="Max chars"
            required
            placeholder="2000"
            :field-props="{ class: 'flex-1 min-w-0 grow' }"
          )
        template(#value-input="{ idx }")
          ui-form-field(
            input="domain-ui-input-combobox-model"
            :path="'costThresholds[' + idx + '].targetId'"
            label="Target model"
            required
            transformer="value"
            :field-props="{ class: 'flex-1 min-w-0 grow' }"
          )
        template(#actions="{ idx }")
          ui-icon-button(icon="close" :icon-size="16" :size="Size.SM" :variant="Variant.Gray" class="shrink-0 !text-red-600" square @click="removeThreshold(idx)")
  ui-form-field(
    input="domain-ui-input-combobox-model"
    path="costDefaultTargetId"
    label="Default target model"
    placeholder="Fallback model when no threshold matches"
    transformer="value"
  )
</template>

<script lang="ts">
import { Size, Variant } from '@/features/ui/clickables/model'
import { type KeyValuePair } from '@/features/ui/input-key-value/InputKeyValue.global.vue'
import { NumberProp } from '@/util/prop-decorators'
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class FeatureCostAwareRouting extends Vue {
  public Variant = Variant
  public Size = Size

  @NumberProp(0)
  public readonly initialCount!: number

  private idCounter = 0
  public thresholdIds: number[] = []

  public get thresholdPairs(): KeyValuePair[] {
    return this.thresholdIds.map((id) => ({ key: String(id), value: '' }))
  }

  private created(): void {
    for (let i = 0; i < this.initialCount; i++) {
      this.thresholdIds.push(++this.idCounter)
    }
  }

  public addThreshold(): void {
    this.thresholdIds.push(++this.idCounter)
  }

  public removeThreshold(idx: number): void {
    this.thresholdIds.splice(idx, 1)
  }
}
</script>
