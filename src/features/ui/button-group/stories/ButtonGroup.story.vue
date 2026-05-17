<template lang="pug">
story(title="ButtonGroup")
  variant(title="Default (sm)")
    div(class="p-4")
      ui-button-group(v-model="selected" :options="options")
  variant(title="Medium size")
    div(class="p-4")
      ui-button-group(v-model="selected" :options="options" size="md")
  variant(title="Many options")
    div(class="p-4")
      ui-button-group(v-model="selectedPeriod" :options="periodOptions")
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class ButtonGroupStory extends Vue {
  private selected = { label: 'Day', value: 'day' }
  private selectedPeriod = { label: '1h', value: '1h' }

  private options = [
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
  ]

  private periodOptions = [
    { label: '1h', value: '1h' },
    { label: '6h', value: '6h' },
    { label: '12h', value: '12h' },
    { label: '24h', value: '24h' },
    { label: '7d', value: '7d' },
  ]
}
</script>
