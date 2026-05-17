<template lang="pug">
story(title="InputSelect")
  variant(title="Default")
    div
      ui-input-select(v-model="selected" :options="options" placeholder="Pick a fruit…")
  variant(title="Sizes")
    div(class="flex flex-col gap-3")
      ui-input-select(v-model="selected" :options="options" :size="Size.SM" placeholder="Small")
      ui-input-select(v-model="selected" :options="options" :size="Size.MD" placeholder="Medium")
      ui-input-select(v-model="selected" :options="options" :size="Size.LG" placeholder="Large")
  variant(title="States")
    div(class="flex flex-col gap-3")
      ui-input-select(v-model="selected" :options="options" placeholder="Normal")
      ui-input-select(v-model="selected" :options="options" :error="true" placeholder="Error")
      ui-input-select(v-model="selected" :options="options" readonly placeholder="Readonly")
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { Size } from '../../clickables/model'

@Component
export default class InputSelectStory extends Vue {
  private Size = Size
  selected = undefined

  options = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
    { value: 'date', label: 'Date' },
  ]
}
</script>
