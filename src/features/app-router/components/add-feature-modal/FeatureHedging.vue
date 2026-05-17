<template lang="pug">
div(class="flex flex-col gap-4")
  div(class="flex flex-col gap-1.5")
    ui-form-field(
      input="ui-input-array-item"
      path="hedgeTargets"
      label="Hedge targets"
      :input-props="{ arrayInput: 'ui-input-combobox', itemValuePath: 'value', options: targetOptions, placeholder: 'Select a target…' }"
    )
    p(class="text-xs text-gray-400") Race against this target. Leave empty to use the first two enabled targets.
  div(class="grid grid-cols-2 gap-3")
    ui-form-field(input="ui-input-select" path="hedgeQualityCheck" label="Quality check" transformer="value" :input-props="{ options: qualityOptions }")
    ui-form-field(input="ui-input-text" path="hedgeMinLength" label="Min length (chars)" placeholder="0")
  div(class="flex flex-col gap-1.5")
    ui-form-field(input="ui-input-text" path="hedgeTimeoutMs" label="Timeout (ms)" placeholder="5000")
    p(class="text-xs text-gray-400") Max wait before returning whatever winner is available.
</template>

<script lang="ts">
import { InternalModulesRouterInterfacesHttpRouterTargetResponse } from '@/__generated__/hyperstrate-api'
import { Component, Vue } from 'vue-facing-decorator'
import { RequiredProp } from '@/util/prop-decorators'
import type { Option } from '@/features/ui/inputs/model'

type RouterTarget = InternalModulesRouterInterfacesHttpRouterTargetResponse

@Component
export default class FeatureHedging extends Vue {
  @RequiredProp()
  public readonly targetOptions!: Option<RouterTarget>[]

  @RequiredProp()
  public readonly qualityOptions!: Option<string>[]
}
</script>
