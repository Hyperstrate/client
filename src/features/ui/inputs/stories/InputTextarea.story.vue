<template lang="pug">
story(title="InputTextarea")
  variant(title="Default")
    div(class="p-4")
      ui-input-textarea(v-model="value" placeholder="Enter text...")
  variant(title="With error")
    div(class="p-4")
      ui-input-textarea(v-model="value" :error="true" placeholder="Required field")
  variant(title="Readonly")
    div(class="p-4")
      ui-input-textarea(v-model="readonlyVal" :readonly="true")
  variant(title="Disabled")
    div(class="p-4")
      ui-input-textarea(v-model="value" disabled placeholder="Disabled textarea")
  variant(title="More rows")
    div(class="p-4")
      ui-input-textarea(v-model="value" :rows="8" placeholder="Tall textarea")
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class InputTextareaStory extends Vue {
  private value = ''
  private readonlyVal = 'This content is read-only and cannot be edited.'
}
</script>
