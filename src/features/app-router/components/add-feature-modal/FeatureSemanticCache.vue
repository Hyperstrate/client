<template lang="pug">
div(class="flex flex-col gap-4")
  ui-form-field(input="ui-input-text" path="ttlSeconds" label="Cache TTL (seconds)" placeholder="300")
  ui-form-field(input="ui-input-text" path="similarityThreshold" label="Similarity threshold (0–1)" placeholder="0.92")
  div(class="flex flex-col gap-1.5")
    ui-form-field(input="domain-ui-input-combobox-embedding-model" path="semanticModelId" label="Embedding model" required transformer="value")
    p(class="text-xs text-gray-400") Must be a registered embedding-capable model
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class FeatureSemanticCache extends Vue {}
</script>
