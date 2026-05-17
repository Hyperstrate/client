<template lang="pug">
div(class="flex flex-col gap-1.5")
  ui-form-field(input="ui-input-text" path="maxChars" label="Max characters" placeholder="4000")
  p(class="text-xs text-gray-400") Prompt text beyond this character count will be truncated
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class FeatureTokenOptimization extends Vue {}
</script>
