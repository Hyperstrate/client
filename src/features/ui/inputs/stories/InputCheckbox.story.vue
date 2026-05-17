<template lang="pug">
story(title="InputCheckbox")
  variant(title="Default")
    div(class="flex flex-col gap-3")
      ui-input-checkbox(v-model="checked" label="Accept terms and conditions")
      ui-input-checkbox(v-model="checked2" label="Send me notifications")
  variant(title="States")
    div(class="flex flex-col gap-3")
      ui-input-checkbox(v-model="on" label="Checked" :true-value="true" :false-value="false")
      ui-input-checkbox(v-model="off" label="Unchecked" :true-value="true" :false-value="false")
      ui-input-checkbox(v-model="on" label="Disabled checked" :disabled="true")
      ui-input-checkbox(v-model="off" label="Disabled unchecked" :disabled="true")
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class InputCheckboxStory extends Vue {
  checked = false
  checked2 = true
  on = true
  off = false
}
</script>
