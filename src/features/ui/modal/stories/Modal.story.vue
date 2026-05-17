<template lang="pug">
story(title="Modal")
  variant(title="Default (trigger + content)")
    div(class="p-4")
      ui-modal(ref="modal")
        template(#trigger="{ open }")
          ui-button(@click="open") Open Modal
        template(#default="{ close }")
          div(class="px-6 pt-6 pb-4 border-b border-gray-100")
            h2(class="text-base font-semibold text-gray-900") Modal title
            p(class="text-sm text-gray-500") This is the modal description.
          div(class="px-6 py-4")
            p(class="text-sm text-zinc-700") Modal body content goes here.
          div(class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100")
            ui-button(:variant="Variant.Gray" @click="close") Cancel
            ui-button(@click="close") Confirm
  variant(title="Small size")
    div(class="p-4")
      ui-modal(:size="Size.SM")
        template(#trigger="{ open }")
          ui-button(@click="open") Open Small Modal
        template(#default="{ close }")
          div(class="px-6 py-6")
            p(class="text-sm") Small modal content.
          div(class="flex justify-end px-6 pb-4")
            ui-button(@click="close") Close
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { Size, Variant } from '../../clickables/model'

@Component
export default class ModalStory extends Vue {
  private Variant = Variant
  private Size = Size
}
</script>
