<template lang="pug">
div(class="grid grid-cols-2 gap-3")
  ui-form-field(input="ui-input-text" path="rps" label="Requests per second" placeholder="10")
  ui-form-field(input="ui-input-text" path="burst" label="Burst size" placeholder="10")
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class FeatureRateLimit extends Vue {}
</script>
