<template lang="pug">
div(class="p-4 flex flex-col gap-3")
  div(class="flex items-center justify-between")
    ui-overline Interceptors
    app-router-add-interceptor-modal(v-if="!hideAdd" :router-id="routerId" :targets="targets" @added="$emit('added', $event)")
      template(#trigger)
        ui-button(:size="Size.SM")
          ui-icon(icon="plus" :size="12")
          | Add
  ui-empty-state(v-if="!interceptors.length" heading="No interceptors yet" subheading="Interceptors run before target selection.")
  ui-draggable-list(:items="interceptors" key-by="id" class="grid gap-2" @reorder="onReorder")
    template(#default="{ item: interceptor }")
      div(class="rounded-lg border border-gray-200 overflow-hidden bg-white")
        div(class="flex items-center gap-2 px-3 py-2.5 cursor-grab active:cursor-grabbing")
          ui-icon(icon="drag-handle" :size="16" class="text-gray-300 shrink-0")
          div(class="w-1.5 h-1.5 rounded-full shrink-0" :class="interceptor.isEnabled ? 'bg-indigo-500' : 'bg-gray-300'")
          div(class="flex-1 min-w-0")
            p(class="text-xs font-medium text-gray-800 truncate") {{ interceptorLabel(interceptor.type) }}
            p(v-if="embeddingModelName(interceptor)" class="text-xs text-gray-400 truncate") via {{ embeddingModelName(interceptor) }}
            p(v-else-if="interceptor.type === InterceptorType.InterceptorABTest && abTestVariants(interceptor).length" class="text-xs text-gray-400")
              span(class="font-numeric tabular-nums") {{ abTestVariants(interceptor).length }}
              |
              | variant{{ abTestVariants(interceptor).length === 1 ? '' : 's' }}
            p(v-else-if="interceptor.type === InterceptorType.InterceptorContentFilter" class="text-xs text-gray-400")
              span(class="font-numeric tabular-nums") {{ contentFilterPatterns(interceptor).length }}
              |
              | pattern{{ contentFilterPatterns(interceptor).length !== 1 ? 's' : '' }}
            p(v-else-if="interceptor.type === InterceptorType.InterceptorPIIDetector" class="text-xs text-gray-400") {{ piiRedact(interceptor) ? 'Redact mode' : 'Block mode' }}
            p(v-else-if="interceptor.type === InterceptorType.InterceptorPromptGuard" class="text-xs text-gray-400") {{ promptGuardSensitivity(interceptor) }} sensitivity
            p(v-else-if="interceptor.type === InterceptorType.InterceptorPromptShield" class="text-xs text-gray-400")
              span(class="font-numeric tabular-nums") {{ shieldPolicies(interceptor).length }}
              |
              | polic{{ shieldPolicies(interceptor).length === 1 ? 'y' : 'ies' }}
            p(v-else-if="interceptor.type === InterceptorType.InterceptorTeamBudget" class="text-xs text-gray-400")
              span(class="font-numeric tabular-nums") {{ teamBudgetCount(interceptor) }}
              |
              | team{{ teamBudgetCount(interceptor) === 1 ? '' : 's' }} configured
          ui-dropdown(align="end")
            template(#trigger)
              ui-icon-button(icon="dots-horizontal" :icon-size="16" :size="Size.SM" :variant="Variant.Gray" :square="true")
            template(#content="{ close }")
              div(class="p-1 flex flex-col")
                app-router-edit-interceptor-modal(:interceptor="interceptor" :router-id="routerId" :targets="targets" @updated="$emit('updated', $event)")
                  template(#trigger)
                    ui-clickable(
                      tag="button"
                      class="flex items-center gap-2 w-full px-3 py-2 text-xs text-left text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    ) Edit
                ui-clickable(
                  tag="button"
                  class="flex items-center gap-2 w-full px-3 py-2 text-xs text-left text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  @click.stop="toggle(interceptor), close()"
                ) {{ interceptor.isEnabled ? 'Disable' : 'Enable' }}
                ui-divider
                domain-ui-confirm-delete-modal(
                  :name="interceptorLabel(interceptor.type)"
                  description="This interceptor will be removed from the pipeline."
                  @confirm="remove(interceptor.id)"
                )
                  template(#trigger)
                    ui-clickable(
                      tag="button"
                      class="flex items-center gap-2 w-full px-3 py-2 text-xs text-left text-red-600 rounded-md hover:bg-red-50 transition-colors"
                    ) Remove

        //- Per-target utterances (semantic_classifier only)
        template(v-if="interceptor.type === InterceptorType.InterceptorSemanticClassifier")
          div(class="border-t border-gray-100 px-3 py-2.5 flex flex-col gap-2")
            ui-overline(compact) Utterances per target
            div(v-if="!targets.length" class="text-xs text-gray-300 italic") No targets added yet
            div(v-for="target in targets" :key="target.id" class="flex flex-col gap-1.5")
              p(class="text-xs font-medium text-gray-700 truncate") {{ targetDisplayName(target) }}
              template(v-if="editingKey !== interceptor.id + ':' + target.id")
                div(v-if="targetUtterances(interceptor, target.id).length" class="flex flex-wrap gap-1")
                  ui-pill(v-for="u in targetUtterances(interceptor, target.id)" :key="u" :variant="Variant.Indigo") {{ u }}
                p(v-else class="text-xs text-gray-300 italic") No utterances
                ui-button(:variant="Variant.Gray" :size="Size.SM" @click="startEdit(interceptor, target.id)") {{ targetUtterances(interceptor, target.id).length ? 'Edit' : '+ Add utterances' }}
              template(v-else)
                ui-input-textarea(v-model="utterancesText" :rows="3" placeholder="One phrase per line" class="w-full !min-w-0")
                div(class="flex gap-1 justify-end")
                  ui-button(:variant="Variant.Gray" :size="Size.SM" @click="editingKey = undefined") Cancel
                  ui-button(:variant="Variant.Blue" :size="Size.SM" :busy="utterancesBusy" @click="saveUtterances(interceptor, target.id)") Save

        //- Variants (ab_test only)
        template(v-if="interceptor.type === InterceptorType.InterceptorABTest")
          div(class="border-t border-gray-100 px-3 py-2.5 flex flex-col gap-2")
            ui-overline(compact) Variants
            div(v-if="!abTestVariants(interceptor).length" class="text-xs text-gray-300 italic") No variants configured
            div(v-for="(v, i) in abTestVariants(interceptor)" :key="i" class="flex items-center gap-2")
              div(class="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0")
                span(class="text-xs font-bold text-indigo-500 leading-none") {{ variantLetter(i) }}
              div(class="flex-1 min-w-0")
                p(class="text-xs font-medium text-gray-800 truncate") {{ v.name }}
                p(class="text-xs text-gray-400 truncate") {{ abTestVariantModelName(v) }}
              span(class="text-xs font-numeric text-gray-400 tabular-nums shrink-0") {{ abTestVariantPercent(interceptor, i) }}%
            div(v-if="abTestPartitionKey(interceptor)" class="flex items-center gap-1.5 pt-1.5 border-t border-gray-50")
              span(class="text-xs text-gray-400") Sticky by
              span(class="text-xs font-mono text-gray-600 bg-gray-50 rounded px-1") {{ abTestPartitionKey(interceptor) }}

        //- Content filter patterns
        template(v-if="interceptor.type === InterceptorType.InterceptorContentFilter")
          div(class="border-t border-gray-100 px-3 py-2.5 flex flex-col gap-2")
            ui-overline(compact) Blocked patterns
            div(v-if="!contentFilterPatterns(interceptor).length" class="text-xs text-gray-300 italic") No patterns configured
            div(v-else class="flex flex-wrap gap-1")
              ui-pill(v-for="p in contentFilterPatterns(interceptor)" :key="p" :variant="Variant.Red") {{ p }}

        //- PII detector mode
        template(v-if="interceptor.type === InterceptorType.InterceptorPIIDetector")
          div(class="border-t border-gray-100 px-3 py-2.5 flex flex-col gap-2")
            div(class="flex items-center gap-2")
              ui-overline(compact) Mode
              ui-badge(:variant="piiRedact(interceptor) ? Variant.Blue : Variant.Orange") {{ piiRedact(interceptor) ? 'Redact' : 'Block' }}
            p(class="text-xs text-gray-400") Detects: names, emails, phones, credit cards, SSNs, IPs

        //- Prompt guard sensitivity
        template(v-if="interceptor.type === InterceptorType.InterceptorPromptGuard")
          div(class="border-t border-gray-100 px-3 py-2.5 flex flex-col gap-2")
            div(class="flex items-center gap-2")
              ui-overline(compact) Sensitivity
              ui-badge(:variant="sensitivityBadgeVariant(interceptor)") {{ promptGuardSensitivity(interceptor) }}
            p(class="text-xs text-gray-400") Guards against prompt injection and jailbreak attempts

        //- Prompt shield policies
        template(v-if="interceptor.type === InterceptorType.InterceptorPromptShield")
          div(class="border-t border-gray-100 px-3 py-2.5 flex flex-col gap-2")
            ui-overline(compact) Safety policies
            div(v-if="!shieldPolicies(interceptor).length" class="text-xs text-gray-300 italic") No policies configured
            div(v-else class="flex flex-wrap gap-1")
              ui-pill(v-for="p in shieldPolicies(interceptor)" :key="p" :variant="Variant.Orange") {{ p }}

        //- Team budget list
        template(v-if="interceptor.type === InterceptorType.InterceptorTeamBudget")
          div(class="border-t border-gray-100 px-3 py-2.5 flex flex-col gap-2")
            ui-overline(compact) Team budgets
            div(v-if="!teamBudgetCount(interceptor)" class="text-xs text-gray-300 italic") No teams configured
            div(v-else class="flex flex-col gap-1.5")
              div(v-for="(entry, teamId) in teamBudgetEntries(interceptor)" :key="teamId" class="flex items-center gap-2")
                span(class="text-xs font-medium text-gray-700 shrink-0") {{ teamName(teamId) }}
                span(v-if="entry.max_cost_usd" class="text-xs font-numeric tabular-nums text-gray-400") ${{ entry.max_cost_usd }} max
                span(v-if="entry.max_requests" class="text-xs font-numeric tabular-nums text-gray-400") {{ entry.max_requests }} req max
                span(v-if="entry.overflow_target_id" class="inline-flex items-center gap-1 text-xs text-indigo-400 truncate")
                  ui-icon(icon="arrow-right" size="12" class="shrink-0")
                  span(class="truncate") {{ overflowTargetName(entry.overflow_target_id) }}
</template>

<script lang="ts">
import {
  HyperstrateApi,
  HyperstrateServerInternalModulesRouterApplicationRouterInterceptorResponse,
  HyperstrateServerInternalModulesRouterDomainRouterInterceptorType,
  InternalModulesRouterInterfacesHttpRouterTargetResponse,
} from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Mixins } from '@/util/mixin'
import { Size, Variant } from '@/features/ui/clickables/model'
import { Component } from 'vue-facing-decorator'
import { ArrayProp, BooleanProp, ObjectProp, StringProp } from '@/util/prop-decorators'
import { splitTrimmedLines } from '@/util/string'
import { INTERCEPTOR_TYPE_OPTIONS } from '../../model'

type RouterInterceptor = HyperstrateServerInternalModulesRouterApplicationRouterInterceptorResponse
type RouterTarget = InternalModulesRouterInterfacesHttpRouterTargetResponse
const InterceptorType = HyperstrateServerInternalModulesRouterDomainRouterInterceptorType

@Component({ emits: ['added', 'toggled', 'reordered', 'removed', 'updated'] })
export default class RouterInterceptorsControl extends Mixins(ApiClientsMixin) {
  public Variant = Variant
  public Size = Size
  public readonly InterceptorType = InterceptorType

  @StringProp(true)
  public readonly routerId!: string

  @ArrayProp(() => [])
  public readonly interceptors!: RouterInterceptor[]

  @ArrayProp(() => [])
  public readonly targets!: RouterTarget[]

  @ObjectProp(() => ({}))
  public readonly modelDisplayNameMap!: Record<string, string>

  @ObjectProp(() => ({}))
  public readonly teamNameMap!: Record<string, string>

  @BooleanProp(false)
  public readonly hideAdd!: boolean

  public editingKey?: string = undefined
  public utterancesText = ''
  public utterancesBusy = false

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  public interceptorLabel(type: RouterInterceptor['type'] | undefined): string {
    if (!type) return '—'
    return INTERCEPTOR_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type
  }

  public embeddingModelName(interceptor: RouterInterceptor): string | undefined {
    const modelId = interceptor.config?.['model_id'] as string | undefined
    return modelId ? this.modelName(modelId) : undefined
  }

  public targetDisplayName(target: RouterTarget): string {
    return target.model?.displayName ?? target.model?.alias ?? target.modelId ?? '—'
  }

  public targetUtterances(interceptor: RouterInterceptor, targetId: string | undefined): string[] {
    if (!targetId) return []
    const map = interceptor.config?.['targets'] as Record<string, string[]> | undefined
    return map?.[targetId] ?? []
  }

  public abTestVariants(interceptor: RouterInterceptor): Array<{ name: string; model_id: string; weight: number }> {
    const raw = interceptor.config?.['variants']
    if (!Array.isArray(raw)) return []
    return raw as Array<{ name: string; model_id: string; weight: number }>
  }

  public abTestVariantModelName(v: { name: string; model_id: string; weight: number }): string {
    const target = this.targets.find((t) => t.modelId === v.model_id)
    return target?.model?.alias || target?.model?.displayName || this.modelName(v.model_id) || '—'
  }

  public abTestVariantPercent(interceptor: RouterInterceptor, idx: number): number {
    const variants = this.abTestVariants(interceptor)
    const total = variants.reduce((s, v) => s + (v.weight || 0), 0)
    if (!total) return 0
    return Math.round((variants[idx].weight / total) * 100)
  }

  public abTestPartitionKey(interceptor: RouterInterceptor): string | undefined {
    return (interceptor.config?.['partition_key'] as string | undefined) || undefined
  }

  public variantLetter(i: number): string {
    return String.fromCharCode(65 + i)
  }

  public contentFilterPatterns(interceptor: RouterInterceptor): string[] {
    const raw = interceptor.config?.['blocked_patterns']
    if (!Array.isArray(raw)) return []
    return raw as string[]
  }

  public piiRedact(interceptor: RouterInterceptor): boolean {
    return !!(interceptor.config?.['redact'] as boolean | undefined)
  }

  public promptGuardSensitivity(interceptor: RouterInterceptor): string {
    return (interceptor.config?.['sensitivity'] as string | undefined) || 'medium'
  }

  public sensitivityBadgeVariant(interceptor: RouterInterceptor): Variant {
    const s = this.promptGuardSensitivity(interceptor)
    if (s === 'low') return Variant.Green
    if (s === 'high') return Variant.Red
    return Variant.Orange
  }

  public shieldPolicies(interceptor: RouterInterceptor): string[] {
    const raw = interceptor.config?.['policies']
    if (!Array.isArray(raw)) return []
    return raw as string[]
  }

  public teamBudgetCount(interceptor: RouterInterceptor): number {
    const b = interceptor.config?.['budgets'] as Record<string, unknown> | undefined
    return b ? Object.keys(b).length : 0
  }

  public teamBudgetEntries(interceptor: RouterInterceptor): Record<string, { max_cost_usd?: number; max_requests?: number; overflow_target_id?: string }> {
    return (interceptor.config?.['budgets'] as Record<string, { max_cost_usd?: number; max_requests?: number; overflow_target_id?: string }> | undefined) ?? {}
  }

  public teamName(teamId: string | undefined): string {
    return teamId ? this.teamNameMap[teamId] || teamId : '—'
  }

  public overflowTargetName(modelId: string | undefined): string {
    return modelId ? this.modelName(modelId) || modelId : '—'
  }

  private modelName(modelId: string | undefined): string | undefined {
    return modelId ? this.modelDisplayNameMap[modelId] || modelId : undefined
  }

  public async toggle(interceptor: RouterInterceptor): Promise<void> {
    if (!interceptor.id) return
    const { data: updated } = await this.api.routerIdInterceptorsInterceptorIdPatch({
      id: this.routerId,
      interceptorId: interceptor.id,
      body: { isEnabled: !interceptor.isEnabled },
    })
    this.$emit('toggled', updated)
  }

  public async onReorder(newOrder: RouterInterceptor[]): Promise<void> {
    const ordered = newOrder.map((i, idx) => ({ ...i, executionOrder: idx }))
    const previousOrderById = new Map(this.interceptors.map((interceptor) => [interceptor.id, interceptor.executionOrder ?? 0]))
    const changed = ordered.filter((interceptor) => interceptor.id && previousOrderById.get(interceptor.id) !== interceptor.executionOrder)

    await Promise.all(
      changed.map((interceptor) =>
        this.api.routerIdInterceptorsInterceptorIdPatch({
          id: this.routerId,
          interceptorId: interceptor.id,
          body: { executionOrder: interceptor.executionOrder },
        }),
      ),
    )
    this.$emit('reordered', ordered)
  }

  public async remove(interceptorId: string | undefined): Promise<void> {
    if (!interceptorId) return
    await this.api.routerIdInterceptorsInterceptorIdDelete({ id: this.routerId, interceptorId })
    this.$emit('removed', interceptorId)
  }

  public startEdit(interceptor: RouterInterceptor, targetId: string | undefined): void {
    if (!interceptor.id || !targetId) return
    this.editingKey = `${interceptor.id}:${targetId}`
    this.utterancesText = this.targetUtterances(interceptor, targetId).join('\n')
  }

  public async saveUtterances(interceptor: RouterInterceptor, targetId: string | undefined): Promise<void> {
    if (!interceptor.id || !targetId) return
    this.utterancesBusy = true
    try {
      const utterances = splitTrimmedLines(this.utterancesText)
      const currentTargets = (interceptor.config?.['targets'] ?? {}) as Record<string, string[]>
      const newConfig = { ...interceptor.config, targets: { ...currentTargets, [targetId]: utterances } }
      const { data: updated } = await this.api.routerIdInterceptorsInterceptorIdPatch({
        id: this.routerId,
        interceptorId: interceptor.id,
        body: { config: newConfig as Record<string, object> },
      })
      this.$emit('updated', updated)
      this.editingKey = undefined
      this.utterancesText = ''
    } finally {
      this.utterancesBusy = false
    }
  }
}
</script>
