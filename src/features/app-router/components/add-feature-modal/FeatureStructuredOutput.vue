<template lang="pug">
div(class="flex flex-col gap-4")
  div(class="flex flex-col gap-1.5")
    ui-form-field(
      input="ui-input-textarea"
      path="schemaJson"
      label="JSON Schema"
      required
      :placeholder="schemaPlaceholder"
      :input-props="{ class: 'font-mono', rows: 8 }"
    )
    p(class="text-xs text-gray-400") Paste a valid JSON Schema — the model response will be validated against it
  div(class="grid grid-cols-2 gap-3")
    ui-form-field(input="ui-input-text" path="schemaName" label="Schema name" placeholder="response")
    div(class="flex items-end pb-1")
      ui-form-field(input="ui-input-checkbox" path="schemaStrict" label="Strict mode (OpenAI)")
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class FeatureStructuredOutput extends Vue {
  public readonly schemaPlaceholder = '{ "type": "object", "properties": { "answer": { "type": "string" } }, "required": ["answer"] }'
}
</script>
