<template lang="pug">
div(class="flex flex-col gap-4")
  div(class="flex flex-col gap-1.5")
    ui-form-field(input="domain-ui-input-combobox-model" path="qualityJudgeModelId" label="Judge model" required transformer="value")
    p(class="text-xs text-gray-400") This model scores the response on a 1–10 scale.
  div(class="grid grid-cols-2 gap-3")
    ui-form-field(input="ui-input-text" path="qualityMinScore" label="Min score (1–10)" placeholder="7")
    ui-form-field(input="ui-input-select" path="qualityAction" label="On failure" transformer="value" :input-props="{ options: actionOptions }")
  div(class="flex flex-col gap-1.5")
    ui-form-field(input="ui-input-textarea" path="qualityRubric" label="Rubric prompt" placeholder="Rate the response on accuracy and completeness.")
    p(class="text-xs text-gray-400") Custom evaluation prompt. If blank, the judge uses a built-in rubric.
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { RequiredProp } from '@/util/prop-decorators'
import type { Option } from '@/features/ui/inputs/model'

@Component
export default class FeatureQualityGate extends Vue {
  @RequiredProp()
  public readonly actionOptions!: Option<string>[]
}
</script>
