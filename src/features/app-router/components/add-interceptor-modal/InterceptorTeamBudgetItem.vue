<template lang="pug">
div(class="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 flex flex-col gap-2")
  div(class="flex items-center justify-between")
    span(class="text-xs font-semibold text-gray-600") Team {{ index + 1 }}
    ui-link(:variant="Variant.Red" @click="$emit('remove')") Remove
  ui-form-field(input="domain-ui-input-combobox-team" :path="path + '.teamId'" label="Team" required transformer="value" :default-value="defaultTeamId")
  div(class="grid grid-cols-2 gap-2")
    ui-form-field(
      input="ui-input-text"
      :path="path + '.maxCostUsd'"
      label="Max cost USD (0 = unlimited)"
      placeholder="0"
      :default-value="defaultMaxCostUsd || '0'"
    )
    ui-form-field(
      input="ui-input-text"
      :path="path + '.maxRequests'"
      label="Max requests (0 = unlimited)"
      placeholder="0"
      :default-value="defaultMaxRequests || '0'"
    )
  div(class="flex flex-col gap-1")
    ui-form-field(
      input="domain-ui-input-combobox-model"
      :path="path + '.overflowTargetId'"
      label="Overflow target model"
      transformer="value"
      :default-value="defaultOverflowTargetId"
    )
    p(class="text-xs text-gray-400") When budget is exceeded, route to this cheaper model instead of blocking.
</template>

<script lang="ts">
import { Variant } from '@/features/ui/clickables/model'
import { Component, Vue } from 'vue-facing-decorator'
import { NumberProp, StringProp } from '@/util/prop-decorators'

@Component
export default class InterceptorTeamBudgetItem extends Vue {
  public Variant = Variant

  @StringProp(true)
  public readonly path!: string

  @NumberProp(true)
  public readonly index!: number

  @StringProp()
  public readonly defaultTeamId?: string

  @StringProp()
  public readonly defaultMaxCostUsd?: string

  @StringProp()
  public readonly defaultMaxRequests?: string

  @StringProp()
  public readonly defaultOverflowTargetId?: string

  declare public $emit: { (event: 'remove'): void; (e: string): void }
}
</script>
