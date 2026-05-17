<template lang="pug">
story(title="OptionPicker")
  variant(title="Default")
    div(class="p-4 max-w-sm")
      ui-option-picker(v-model="selected" :options="options")
      p(class="mt-2 text-xs text-zinc-400") Selected: {{ selected }}
  variant(title="With descriptions")
    div(class="p-4 max-w-sm")
      ui-option-picker(v-model="selectedType" :options="interceptorOptions")
  variant(title="No selection")
    div(class="p-4 max-w-sm")
      ui-option-picker(:model-value="null" :options="options")
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class OptionPickerStory extends Vue {
  private selected = 'round_robin'
  private selectedType = 'semantic_classifier'

  private options = [
    { label: 'Round robin', value: 'round_robin' },
    { label: 'Weighted', value: 'weighted' },
    { label: 'Failover', value: 'failover' },
  ]

  private interceptorOptions = [
    { label: 'Semantic Classifier', description: 'Route based on semantic intent', value: 'semantic_classifier' },
    { label: 'Content Filter', description: 'Block requests matching patterns', value: 'content_filter' },
    { label: 'PII Detector', description: 'Detect and optionally redact PII', value: 'pii_detector' },
  ]
}
</script>
