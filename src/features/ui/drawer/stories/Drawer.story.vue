<template lang="pug">
story(title="Drawer")
  variant(title="With trigger")
    div(class="p-4")
      ui-drawer(v-model="open" title="Details panel")
        template(#trigger="{ open: openDrawer }")
          ui-button(@click="openDrawer") Open Drawer
        div(class="p-6")
          p(class="text-sm text-zinc-700") Drawer content goes here. This panel slides in from the right.
          p(class="mt-4 text-sm text-zinc-500") You can put any content in here — forms, logs, configuration panels.
  variant(title="With footer")
    div(class="p-4")
      ui-drawer(v-model="openFooter" title="Edit configuration")
        template(#trigger="{ open: openDrawer }")
          ui-button(@click="openDrawer") Open With Footer
        div(class="p-6")
          p(class="text-sm text-zinc-700") Edit form content.
        template(#footer)
          div(class="flex justify-end gap-2 px-6 py-4")
            ui-button(:variant="Variant.Gray" @click="openFooter = false") Cancel
            ui-button(@click="openFooter = false") Save
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { Variant } from '../../clickables/model'

@Component
export default class DrawerStory extends Vue {
  private Variant = Variant
  private open = false
  private openFooter = false
}
</script>
