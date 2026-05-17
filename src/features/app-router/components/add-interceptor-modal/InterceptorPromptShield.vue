<template lang="pug">
div(class="flex flex-col gap-4")
  div(class="flex flex-col gap-1.5")
    ui-form-field(
      input="domain-ui-input-combobox-model"
      path="shieldModelId"
      label="Shield model"
      transformer="value"
      :default-value="defaultShieldModelId"
      required
    )
    p(class="text-xs text-gray-400") The model that evaluates each request against your policies. If blank, uses the router's default target.
  ui-form-field(
    input="ui-input-textarea"
    path="shieldPolicies"
    label="Safety policies"
    required
    placeholder="no harmful content\nno competitor mentions\nrespond only in English"
    :default-value="defaultPolicies"
  )
  p(class="text-xs text-gray-400") One policy per line. Requests that violate any policy are blocked before reaching the model.
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { StringProp } from '@/util/prop-decorators'

@Component
export default class InterceptorPromptShield extends Vue {
  @StringProp()
  public readonly defaultShieldModelId?: string

  @StringProp()
  public readonly defaultPolicies?: string
}
</script>
