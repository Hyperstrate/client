<template lang="pug">
story(title="InputBare")
  variant(title="Default")
    div(class="p-4")
      ui-input-bare(v-model="value" placeholder="Type something...")
  variant(title="Password")
    div(class="p-4")
      ui-input-bare(v-model="pass" placeholder="Enter password" :password="true")
  variant(title="Readonly")
    div(class="p-4")
      ui-input-bare(v-model="readonlyVal" :readonly="true")
  variant(title="Disabled")
    div(class="p-4")
      ui-input-bare(v-model="value" placeholder="Disabled" disabled)
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class InputBareStory extends Vue {
  private value = ''
  private pass = ''
  private readonlyVal = 'read-only content'
}
</script>
