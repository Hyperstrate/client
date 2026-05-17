<!-- eslint-disable vue/multi-word-component-names, vue/one-component-per-file -->
<template lang="pug">
story(title="Stepper")
  variant(title="Two-step flow")
    div(class="p-4 max-w-md border border-zinc-200 rounded-xl")
      ui-stepper(:initial-config="config" @complete="onComplete")
  variant(title="Reset on complete")
    div(class="p-4 max-w-md")
      p(v-if="completed" class="text-sm text-emerald-600 mb-2") Stepper completed!
      ui-stepper(:initial-config="config" @complete="completed = true")
</template>

<script lang="ts">
/* eslint-disable vue/one-component-per-file */
import { defineComponent, h } from 'vue'
import { Component, Vue } from 'vue-facing-decorator'

const StepOne = defineComponent({ render: () => h('div', { class: 'p-4' }, [h('p', { class: 'text-sm' }, 'Step 1: Configure name')]) })
const StepTwo = defineComponent({ render: () => h('div', { class: 'p-4' }, [h('p', { class: 'text-sm' }, 'Step 2: Review and confirm')]) })

@Component
export default class StepperStory extends Vue {
  private completed = false

  private config = {
    steps: [
      { name: 'Configure', component: StepOne },
      { name: 'Confirm', component: StepTwo },
    ],
  }

  private onComplete(): void {
    console.log('Stepper complete')
  }
}
</script>
