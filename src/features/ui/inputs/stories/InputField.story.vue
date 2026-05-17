<template lang="pug">
story(title="InputField")
  variant(title="Default")
    div(class="p-4 max-w-sm flex flex-col gap-4")
      ui-input-field(label="Name")
        ui-input-text(placeholder="Enter name...")
  variant(title="Required")
    div(class="p-4 max-w-sm")
      ui-input-field(label="Email" :required="true")
        ui-input-text(placeholder="you@example.com")
  variant(title="Optional")
    div(class="p-4 max-w-sm")
      ui-input-field(label="Description" :optional="true")
        ui-input-textarea(placeholder="Optional description")
  variant(title="Error with messages")
    div(class="p-4 max-w-sm")
      ui-input-field(label="API Key" :error="true" :error-messages="['This field is required']")
        ui-input-text(placeholder="sk-..." :error="true")
  variant(title="No label")
    div(class="p-4 max-w-sm")
      ui-input-field
        ui-input-text(placeholder="No label above")
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class InputFieldStory extends Vue {}
</script>
