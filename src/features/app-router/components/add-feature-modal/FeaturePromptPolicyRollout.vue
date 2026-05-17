<template lang="pug">
div(class="flex flex-col gap-4")
  div(class="flex flex-col gap-1.5")
    ui-form-field(
      input="ui-input-textarea"
      path="rolloutVariantsJson"
      label="Rollout variants"
      required
      placeholder="[{ \"name\": \"canary\", \"prompt_id\": \"prompt-id\", \"percentage\": 10 }]"
      :input-props="{ class: 'font-mono', rows: 8 }"
    )
    p(class="text-xs text-gray-400") Add one or more prompt/policy variants with traffic percentages
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class FeaturePromptPolicyRollout extends Vue {}
</script>
