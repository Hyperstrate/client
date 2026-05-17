<template lang="pug">
div(class="flex flex-col gap-2")
  div(class="flex items-center justify-between")
    ui-label Team budgets
    ui-link(:size="Size.SM" :variant="Variant.Purple" @click.prevent="addBudget")
      ui-icon(icon="plus" :size="16")
      | Add team
  p(class="text-xs text-gray-400 -mt-1") Set cost and request caps per team. The request must include a team_id field to be evaluated.
  interceptor-team-budget-item(
    v-for="(id, idx) in budgetIds"
    :key="id"
    :path="'teamBudgets[' + idx + ']'"
    :index="idx"
    :default-team-id="initialBudgets?.[idx]?.teamId"
    :default-max-cost-usd="initialBudgets?.[idx]?.maxCostUsd"
    :default-max-requests="initialBudgets?.[idx]?.maxRequests"
    :default-overflow-target-id="initialBudgets?.[idx]?.overflowTargetId"
    @remove="removeBudget(idx)"
  )
</template>

<script lang="ts">
import { Size, Variant } from '@/features/ui/clickables/model'
import { Component, Vue } from 'vue-facing-decorator'
import { ArrayProp } from '@/util/prop-decorators'
import InterceptorTeamBudgetItem from './InterceptorTeamBudgetItem.vue'

type InitialBudget = { teamId: string; maxCostUsd: string; maxRequests: string; overflowTargetId?: string }

@Component({ components: { InterceptorTeamBudgetItem } })
export default class InterceptorTeamBudget extends Vue {
  public Variant = Variant
  public Size = Size

  @ArrayProp()
  public readonly initialBudgets?: InitialBudget[]

  private idCounter = 0
  public budgetIds: number[] = []

  public created(): void {
    if (this.initialBudgets && this.initialBudgets.length > 0) {
      this.budgetIds = this.initialBudgets.map((_, i) => i)
      this.idCounter = this.initialBudgets.length - 1
    }
  }

  public addBudget(): void {
    this.budgetIds.push(++this.idCounter)
  }

  public removeBudget(idx: number): void {
    this.budgetIds.splice(idx, 1)
  }
}
</script>
