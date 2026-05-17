<template lang="pug">
story(title="CrossFadeTransition")
  variant(title="Toggle content")
    div(class="p-4 h-24 flex items-center justify-center")
      ui-cross-fade-transition
        div(v-if="showA" key="a" class="px-4 py-2 bg-indigo-50 rounded text-sm text-indigo-700") Content A
        div(v-else key="b" class="px-4 py-2 bg-emerald-50 rounded text-sm text-emerald-700") Content B
      div(class="mt-4")
        ui-button(@click="showA = !showA") Toggle
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class CrossFadeTransitionStory extends Vue {
  private showA = true
}
</script>
