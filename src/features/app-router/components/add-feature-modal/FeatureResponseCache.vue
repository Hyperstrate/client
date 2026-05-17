<template lang="pug">
ui-form-field(input="ui-input-text" path="ttlSeconds" label="Cache TTL (seconds)" placeholder="300")
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class FeatureResponseCache extends Vue {}
</script>
