<template lang="pug">
story(title="Label")
  variant(title="Default")
    ui-label Field Name
  variant(title="Required")
    ui-label(:required="true") Required Field
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class LabelStory extends Vue {}
</script>
