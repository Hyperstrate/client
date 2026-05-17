<template lang="pug">
div(class="flex flex-col gap-4")
  div(class="grid grid-cols-2 gap-3")
    ui-form-field(input="ui-input-text" path="maxRetries" label="Max retries" placeholder="3")
    ui-form-field(input="ui-input-text" path="initialDelayMs" label="Initial delay (ms)" placeholder="100")
  ui-form-field(input="ui-input-text" path="backoffMultiplier" label="Backoff multiplier" placeholder="2.0")
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class FeatureRetry extends Vue {}
</script>
