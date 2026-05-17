<template lang="pug">
div(class="p-4 flex flex-col gap-3")
  div(class="flex items-center justify-between")
    ui-overline Targets
  ui-empty-state(v-if="!targets.length" heading="No targets yet" subheading="Add a model to start routing traffic.")
  div(v-for="target in targets" :key="target.id" class="rounded-lg border border-gray-200 overflow-hidden")
    div(class="flex items-center gap-2 px-3 py-2.5")
      div(class="w-1.5 h-1.5 rounded-full shrink-0" :class="target.isEnabled ? 'bg-green-500' : 'bg-gray-300'")
      div(class="flex-1 min-w-0")
        p(class="text-xs font-medium text-gray-800 truncate") {{ displayName(target) }}
        p(class="text-xs text-gray-400 font-mono truncate") {{ target.modelId }}
      ui-badge(v-if="isWeighted" :variant="Variant.Gray" :size="Size.SM") w:{{ target.weight }}
      ui-badge(v-if="isPercentage" :variant="Variant.Gray" :size="Size.SM") {{ target.percentage }}%
      ui-badge(v-if="isFailover" :variant="Variant.Gray" :size="Size.SM") priority:{{ target.priority }}
      ui-dropdown(align="end")
        template(#trigger)
          ui-icon-button(icon="dots-horizontal" :icon-size="16" :size="Size.SM" :variant="Variant.Gray" :square="true")
        template(#content="{ close }")
          div(class="p-1 flex flex-col")
            ui-clickable(
              tag="button"
              class="flex items-center gap-2 w-full px-3 py-2 text-xs text-left text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              @click="toggle(target), close()"
            ) {{ target.isEnabled ? 'Disable' : 'Enable' }}
            ui-divider
            domain-ui-confirm-delete-modal(
              :name="target.modelId || 'target'"
              description="This target will be removed from the router."
              @confirm="remove(target.id)"
            )
              template(#trigger)
                ui-clickable(tag="button" class="flex items-center gap-2 w-full px-3 py-2 text-xs text-left text-red-600 rounded-md hover:bg-red-50 transition-colors") Remove
</template>

<script lang="ts">
import {
  HyperstrateApi,
  InternalModulesRouterInterfacesHttpRouterTargetResponse,
  HyperstrateServerInternalModulesRouterDomainRoutingStrategy,
} from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Mixins } from '@/util/mixin'
import { Size, Variant } from '@/features/ui/clickables/model'
import { Component } from 'vue-facing-decorator'
import { ArrayProp, OptionalProp, StringProp } from '@/util/prop-decorators'

type RouterTarget = InternalModulesRouterInterfacesHttpRouterTargetResponse
type RoutingStrategy = HyperstrateServerInternalModulesRouterDomainRoutingStrategy
const S = HyperstrateServerInternalModulesRouterDomainRoutingStrategy

@Component({ emits: ['added', 'toggled', 'removed'] })
export default class RouterTargetsControl extends Mixins(ApiClientsMixin) {
  public Variant = Variant
  public Size = Size

  @StringProp(true)
  public readonly routerId!: string

  @OptionalProp()
  public readonly strategy!: RoutingStrategy | undefined

  @ArrayProp(() => [])
  public readonly targets!: RouterTarget[]

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  public get isWeighted(): boolean {
    return this.strategy === S.RoutingStrategyWeighted
  }
  public get isPercentage(): boolean {
    return this.strategy === S.RoutingStrategyPercentage
  }
  public get isFailover(): boolean {
    return this.strategy === S.RoutingStrategyFailover
  }

  public displayName(target: RouterTarget): string {
    return target.model?.displayName ?? target.model?.alias ?? target.modelId ?? '—'
  }

  public async toggle(target: RouterTarget): Promise<void> {
    if (!target.id) return
    const { data: updated } = await this.api.routerIdTargetsTargetIdPatch({
      id: this.routerId,
      targetId: target.id,
      body: { isEnabled: !target.isEnabled },
    })
    this.$emit('toggled', updated)
  }

  public async remove(targetId: string | undefined): Promise<void> {
    if (!targetId) return
    await this.api.routerIdTargetsTargetIdDelete({ id: this.routerId, targetId })
    this.$emit('removed', targetId)
  }
}
</script>
