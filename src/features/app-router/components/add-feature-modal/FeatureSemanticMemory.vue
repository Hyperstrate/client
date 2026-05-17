<template lang="pug">
div(class="flex flex-col gap-4")
  div(class="flex flex-col gap-1.5")
    ui-form-field(input="domain-ui-input-combobox-embedding-model" path="memoryModelId" label="Embedding model" required transformer="value")
    p(class="text-xs text-gray-400") Used to embed prompts and memories for similarity search.
  div(class="grid grid-cols-2 gap-3")
    ui-form-field(input="ui-input-text" path="memoryMaxExamples" label="Max examples stored" placeholder="500")
    ui-form-field(input="ui-input-text" path="memoryTtlDays" label="TTL (days)" placeholder="7")
  ui-form-field(input="ui-input-text" path="memorySimilarityThreshold" label="Similarity threshold (0–1)" placeholder="0.85")
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class FeatureSemanticMemory extends Vue {}
</script>
