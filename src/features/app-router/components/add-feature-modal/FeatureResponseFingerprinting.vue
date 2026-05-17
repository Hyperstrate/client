<template lang="pug">
div(class="flex flex-col gap-4")
  div(class="grid grid-cols-2 gap-3")
    ui-form-field(input="ui-input-text" path="fingerprintWindowSize" label="Window size (responses)" placeholder="100")
    ui-form-field(input="ui-input-text" path="fingerprintAlertThreshold" label="Alert threshold (σ)" placeholder="3.0")
  p(class="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2.5 leading-relaxed")
    | Flags responses whose length deviates more than N standard deviations from the rolling mean. Anomalies appear in the pipeline trace.
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class FeatureResponseFingerprinting extends Vue {}
</script>
