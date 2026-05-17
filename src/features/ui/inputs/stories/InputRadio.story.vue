<template lang="pug">
story(title="InputRadio")
  variant(title="Default")
    div(class="p-4")
      ui-input-radio(v-model="selected" :options="options")
      p(class="mt-2 text-xs text-zinc-400") Selected: {{ selected }}
  variant(title="Disabled")
    div(class="p-4")
      ui-input-radio(v-model="selected" :options="options" :disabled="true")
  variant(title="Many options")
    div(class="p-4")
      ui-input-radio(v-model="strategy" :options="strategies")
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class InputRadioStory extends Vue {
  private selected = 'a'
  private strategy = 'round_robin'

  private options = [
    { label: 'Option A', value: 'a' },
    { label: 'Option B', value: 'b' },
    { label: 'Option C', value: 'c' },
  ]

  private strategies = [
    { label: 'Round Robin', value: 'round_robin' },
    { label: 'Weighted', value: 'weighted' },
    { label: 'Failover', value: 'failover' },
    { label: 'Random', value: 'random' },
    { label: 'Latency Based', value: 'latency_based' },
  ]
}
</script>
