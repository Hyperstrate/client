<template lang="pug">
div(class="flex flex-col gap-4")
  div(class="flex flex-col gap-1.5")
    ui-form-field(input="ui-input-text" path="abPartitionKey" label="Sticky session field" placeholder="user_id" :default-value="defaultPartitionKey")
    p(class="text-xs text-gray-400") Field name from the request to hash for consistent variant assignment. Leave blank for random split.

  div(class="flex flex-col gap-2")
    div(class="flex items-center justify-between")
      ui-overline Variants
      ui-link(:size="Size.SM" :variant="Variant.Purple" @click.prevent="addVariant")
        ui-icon(icon="plus" :size="16")
        | Add variant

    div(v-if="hasDuplicateNames" class="rounded-md bg-amber-50 border border-amber-200 px-3 py-2")
      span(class="text-xs text-amber-700 font-medium") Variant names must be unique

    interceptor-ab-variant-item(
      v-for="(id, idx) in variantIds"
      :key="id"
      :path="'abVariants[' + idx + ']'"
      :label="letter(idx)"
      :title="'Variant ' + (idx + 1)"
      :pct="pct(idx)"
      :removable="variantIds.length > 2"
      :default-name="initialVariants?.[idx]?.name"
      :target-options="targetOptions"
      :default-weight="initialVariants?.[idx]?.weight !== undefined ? String(initialVariants[idx].weight) : undefined"
      :default-model-id="initialVariants?.[idx]?.model_id"
      @remove="removeVariant(idx)"
    )

    div(v-if="variantIds.length > 1 && totalWeight > 0" class="flex flex-col gap-1.5 pt-1")
      div(class="flex h-2 rounded-full overflow-hidden gap-px")
        div(v-for="(id, i) in variantIds" :key="id" class="h-full transition-all" :class="barBg(i)" :style="{ flex: weight(i) || 0 }")
      div(class="flex gap-3 justify-end")
        span(v-for="(id, i) in variantIds" :key="id" class="text-xs font-numeric tabular-nums text-gray-400")
          | {{ letter(i) }}: {{ pct(i) }}%
</template>

<script lang="ts">
import { Size, Variant } from '@/features/ui/clickables/model'
import { Component, Vue } from 'vue-facing-decorator'
import { ArrayProp, ObjectProp, StringProp } from '@/util/prop-decorators'
import type { Option } from '@/features/ui/inputs/model'
import type { InternalModulesRouterInterfacesHttpRouterTargetResponse as RouterTarget } from '@/__generated__/hyperstrate-api'
import InterceptorAbVariantItem from './InterceptorABVariantItem.vue'

type InitialVariant = { name: string; model_id: string; weight: number }

@Component({ components: { InterceptorAbVariantItem } })
export default class InterceptorABTest extends Vue {
  public Variant = Variant
  public Size = Size

  @ObjectProp(() => ({}))
  public readonly formData!: Record<string, unknown>

  @ArrayProp()
  public readonly initialVariants?: InitialVariant[]

  @ArrayProp(() => [])
  public readonly targetOptions!: Option<RouterTarget>[]

  @StringProp()
  public readonly defaultPartitionKey?: string

  private idCounter = 1
  public variantIds: number[] = [0, 1]

  public created(): void {
    if (this.initialVariants && this.initialVariants.length > 0) {
      this.variantIds = this.initialVariants.map((_, i) => i)
      this.idCounter = this.initialVariants.length - 1
    }
  }

  public get hasDuplicateNames(): boolean {
    const variants = this.formData.abVariants as Array<{ name?: string }> | undefined
    const names = (variants ?? []).map((v) => v.name?.trim()).filter(Boolean) as string[]
    return new Set(names).size !== names.length
  }

  public addVariant(): void {
    this.variantIds.push(++this.idCounter)
  }

  public removeVariant(idx: number): void {
    this.variantIds.splice(idx, 1)
  }

  public letter(i: number): string {
    return String.fromCharCode(65 + i)
  }

  public weight(idx: number): number {
    const variants = this.formData.abVariants as Array<{ weight?: string }> | undefined
    return Number(variants?.[idx]?.weight) || 0
  }

  public get totalWeight(): number {
    const variants = this.formData.abVariants as Array<{ weight?: string }> | undefined
    return (variants ?? []).reduce((s, v) => s + (Number(v.weight) || 0), 0)
  }

  public pct(idx: number): number {
    if (!this.totalWeight) return 0
    return Math.round((this.weight(idx) / this.totalWeight) * 100)
  }

  private readonly COLORS = ['bg-indigo-400', 'bg-violet-400', 'bg-sky-400', 'bg-amber-400']

  public barBg(i: number): string {
    return this.COLORS[i % this.COLORS.length]
  }
}
</script>
