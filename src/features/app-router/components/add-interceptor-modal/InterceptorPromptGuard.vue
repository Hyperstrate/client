<template lang="pug">
div(class="flex flex-col gap-4")
  ui-form-field(
    input="ui-input-select"
    path="sensitivity"
    label="Sensitivity"
    transformer="value"
    :input-props="{ options: sensitivityOptions }"
    :default-value="defaultSensitivity"
  )
  div(class="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5 flex flex-col gap-2.5")
    div(v-for="opt in sensitivityDescriptions" :key="opt.value" class="flex flex-col gap-0.5")
      div(class="flex items-center gap-1.5")
        div(class="w-1.5 h-1.5 rounded-full shrink-0" :class="opt.dot")
        span(class="text-xs font-semibold text-gray-700") {{ opt.label }}
      span(class="text-xs text-gray-400 pl-3") {{ opt.description }}
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { StringProp } from '@/util/prop-decorators'

@Component
export default class InterceptorPromptGuard extends Vue {
  @StringProp()
  public readonly defaultSensitivity?: string

  public readonly sensitivityOptions = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
  ]
  public readonly sensitivityDescriptions = [
    { value: 'low', label: 'Low', dot: 'bg-green-400', description: 'Catches only obvious injection attempts with minimal false positives.' },
    { value: 'medium', label: 'Medium', dot: 'bg-amber-400', description: 'Balanced protection — blocks most injection and jailbreak patterns.' },
    { value: 'high', label: 'High', dot: 'bg-red-400', description: 'Strict mode — maximum coverage, may reject some edge-case prompts.' },
  ]
}
</script>
