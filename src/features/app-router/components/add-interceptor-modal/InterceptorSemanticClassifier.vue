<template lang="pug">
div(class="flex flex-col gap-4")
  ui-form-field(
    input="domain-ui-input-combobox-embedding-model"
    path="modelId"
    label="Embedding model"
    required
    transformer="value"
    :default-value="defaultModelId"
  )
  ui-form-field(input="ui-input-text" path="similarityThreshold" label="Similarity Threshold (0–1)" placeholder="0.45" :default-value="defaultThreshold")
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { StringProp } from '@/util/prop-decorators'

@Component
export default class InterceptorSemanticClassifier extends Vue {
  @StringProp()
  public readonly defaultModelId?: string

  @StringProp()
  public readonly defaultThreshold?: string
}
</script>
