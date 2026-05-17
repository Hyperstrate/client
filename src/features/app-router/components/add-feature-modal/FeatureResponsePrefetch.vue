<template lang="pug">
div(class="flex flex-col gap-4")
  div(class="flex flex-col gap-1.5")
    ui-form-field(input="ui-input-textarea" path="prefetchFollowUps" label="Follow-up prompts" required placeholder="What are the next steps?")
    p(class="text-xs text-gray-400") One prompt per line. After each inference these are speculatively pre-computed and cached.
  ui-form-field(input="ui-input-text" path="prefetchTtlSeconds" label="Cache TTL (seconds)" placeholder="300")
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class FeatureResponsePrefetch extends Vue {}
</script>
