<template lang="pug">
story(title="InputText")
  variant(title="Default")
    ui-input-text(v-model="value" placeholder="Enter text…")
  variant(title="Sizes")
    div(class="flex flex-col gap-3 w-64")
      ui-input-text(v-model="value" :size="Size.SM" placeholder="Small")
      ui-input-text(v-model="value" :size="Size.MD" placeholder="Medium")
      ui-input-text(v-model="value" :size="Size.LG" placeholder="Large")
  variant(title="States")
    div(class="flex flex-col gap-3 w-64")
      ui-input-text(v-model="value" placeholder="Normal")
      ui-input-text(v-model="value" placeholder="Error state" :error="true")
      ui-input-text(v-model="value" placeholder="Read only" readonly)
      ui-input-text(v-model="value" placeholder="Disabled" disabled)
  variant(title="With slots")
    div(class="flex flex-col gap-3 w-64")
      ui-input-text(v-model="value" placeholder="With prefix")
        template(#before)
          span(class="text-xs text-zinc-500") https://
      ui-input-text(v-model="value" placeholder="With suffix")
        template(#after)
          span(class="text-xs text-zinc-500") .com
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { Size } from '../../clickables/model'

@Component
export default class InputTextStory extends Vue {
  private Size = Size
  value = ''
}
</script>
