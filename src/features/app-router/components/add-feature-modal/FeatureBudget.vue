<template lang="pug">
div(class="flex flex-col gap-4")
  ui-form-field(input="ui-input-select" path="period" label="Reset period" transformer="value" :input-props="{ options: periodOptions }")
  div(class="grid grid-cols-2 gap-3")
    ui-form-field(input="ui-input-text" path="maxRequests" label="Max requests (0 = unlimited)" placeholder="0")
    ui-form-field(input="ui-input-text" path="maxCostUsd" label="Max cost USD (0 = unlimited)" placeholder="0")
  div(class="flex flex-col gap-1.5")
    ui-form-field(input="ui-input-text" path="alertPercent" label="Alert threshold (%)" placeholder="80")
    p(class="text-xs text-gray-400") Fires a webhook when this % of the budget is consumed (default 80)
  div(class="grid grid-cols-2 gap-3")
    ui-form-field(
      input="ui-input-textarea"
      path="budgetAgentJson"
      label="Agent budgets"
      placeholder="{ \"codex\": { \"max_requests\": 100, \"max_cost_usd\": 5 } }"
      :input-props="{ class: 'font-mono', rows: 4 }"
    )
    ui-form-field(
      input="ui-input-textarea"
      path="budgetRoleJson"
      label="Role budgets"
      placeholder="{ \"worker\": { \"max_requests\": 200 } }"
      :input-props="{ class: 'font-mono', rows: 4 }"
    )
    ui-form-field(
      input="ui-input-textarea"
      path="budgetRepoJson"
      label="Repo budgets"
      placeholder="{ \"hyperstrate/server\": { \"max_cost_usd\": 20 } }"
      :input-props="{ class: 'font-mono', rows: 4 }"
    )
    ui-form-field(
      input="ui-input-textarea"
      path="budgetBranchJson"
      label="Branch budgets"
      placeholder="{ \"main\": { \"max_requests\": 500 } }"
      :input-props="{ class: 'font-mono', rows: 4 }"
    )
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { RequiredProp } from '@/util/prop-decorators'
import type { Option } from '@/features/ui/inputs/model'

@Component
export default class FeatureBudget extends Vue {
  @RequiredProp()
  public readonly periodOptions!: Option<string>[]
}
</script>
