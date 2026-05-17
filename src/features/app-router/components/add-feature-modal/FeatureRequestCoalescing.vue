<template lang="pug">
div(class="flex flex-col gap-4")
  div(class="grid grid-cols-2 gap-3")
    ui-form-field(input="ui-input-text" path="coalesceWindowMs" label="Window (ms)" placeholder="200")
    ui-form-field(input="ui-input-text" path="coalesceMaxWaiters" label="Max waiters (0 = unlimited)" placeholder="0")
  p(class="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2.5 leading-relaxed")
    | Identical concurrent requests share one upstream call. The window is how long a waiter blocks for the leader's result before making its own call. Streaming requests are always forwarded directly.
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class FeatureRequestCoalescing extends Vue {}
</script>
