<template lang="pug">
div(class="flex flex-col gap-4")
  div(class="grid grid-cols-2 gap-3")
    ui-form-field(input="ui-input-text" path="compressionMaxChars" label="Max history chars" placeholder="8000")
    ui-form-field(input="ui-input-text" path="compressionKeepRecent" label="Keep recent turns" placeholder="2")
  p(class="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2.5 leading-relaxed")
    | Trims conversation history to the character limit while always preserving the most recent turns. Oldest turns are dropped first.
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class FeatureContextCompression extends Vue {}
</script>
