<template lang="pug">
div(class="p-4 flex flex-col gap-5")
  //- Router-level default prompt
  div(class="flex flex-col gap-3")
    ui-overline Router Default

    div(class="flex flex-col gap-1.5")
      span(class="text-sm font-medium text-gray-700") System prompt
      domain-ui-input-combobox-prompt(:model-value="routerPromptOption" @update:model-value="onRouterPromptChange")
      p(class="text-xs text-gray-400")
        | Injected before every inference on this router. Targets can override this individually.
        | Use {{ '{' }}{{ '{' }}variable{{ '}' }}{{ '}' }} placeholders filled from request fields.
    div(class="flex items-center justify-end gap-2")
      ui-button(v-if="routerPromptOption" type="button" :variant="Variant.Gray" :disabled="routerPromptBusy" @click="clearRouterPrompt") Remove
      ui-button(:disabled="!routerPromptModified || routerPromptBusy" :busy="routerPromptBusy" @click="saveRouterPrompt") Save

  //- Per-target overrides
  div(class="flex flex-col gap-3 border-t border-gray-100 pt-4")
    ui-overline Per-target Overrides

    ui-empty-state(v-if="!targets.length" heading="No targets" subheading="Add targets on the Targets tab first.")

    div(v-for="target in targets" :key="target.id" class="flex flex-col gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-3")
      div(class="flex items-center gap-2 min-w-0")
        div(class="w-1.5 h-1.5 rounded-full shrink-0" :class="target.isEnabled ? 'bg-green-500' : 'bg-gray-300'")
        span(class="text-xs font-semibold text-gray-700 truncate") {{ displayName(target) }}
        span(class="text-xs font-mono text-gray-400 truncate") {{ target.modelId }}
      domain-ui-input-combobox-prompt(
        :model-value="targetState(target.id).option"
        placeholder="None — inherit router default"
        @update:model-value="onTargetPromptChange(target.id, $event)"
      )
      div(class="flex items-center justify-end gap-2")
        ui-button(
          v-if="targetState(target.id).option"
          type="button"
          :variant="Variant.Gray"
          :disabled="targetState(target.id).busy"
          @click="clearTargetPrompt(target.id)"
        ) Remove
        ui-button(
          :disabled="!targetState(target.id).modified || targetState(target.id).busy"
          :busy="targetState(target.id).busy"
          @click="saveTargetPrompt(target.id)"
        ) Save
</template>

<script lang="ts">
import {
  HyperstrateApi,
  HyperstrateServerInternalModulesPromptsApplicationPromptResponse,
  InternalModulesRouterInterfacesHttpRouterTargetResponse,
} from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { type Option } from '@/features/ui/inputs/model'
import { Mixins } from '@/util/mixin'
import { Variant } from '@/features/ui/clickables/model'
import { Component, Watch } from 'vue-facing-decorator'
import { ArrayProp, StringProp } from '@/util/prop-decorators'
import { reactive } from 'vue'

type PromptResponse = HyperstrateServerInternalModulesPromptsApplicationPromptResponse
type PromptOption = Option<PromptResponse>
type RouterTarget = InternalModulesRouterInterfacesHttpRouterTargetResponse

interface TargetState {
  option: PromptOption | undefined
  savedPromptId: string
  busy: boolean
  modified: boolean
}

type Emits = {
  (e: 'router-prompt-updated'): void
  (e: 'target-updated', value: RouterTarget): void
  (e: string): void
}

@Component({ emits: ['router-prompt-updated', 'target-updated'] })
export default class RouterPromptsControl extends Mixins(ApiClientsMixin) {
  public Variant = Variant

  @StringProp(true)
  public readonly routerId!: string

  @StringProp('')
  public readonly initialRouterPromptId!: string

  @ArrayProp(() => [])
  public readonly targets!: RouterTarget[]

  declare public $emit: Emits

  public routerPromptOption: PromptOption | undefined = undefined
  public savedRouterPromptId = ''
  public routerPromptModified = false
  public routerPromptBusy = false

  public states: Record<string, TargetState> = reactive({})

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  public displayName(target: RouterTarget): string {
    return target.model?.displayName ?? target.model?.alias ?? target.modelId ?? '—'
  }

  public targetState(targetId: string | undefined): TargetState {
    if (!targetId) return { option: undefined, savedPromptId: '', busy: false, modified: false }
    if (!this.states[targetId]) {
      this.states[targetId] = reactive({ option: undefined, savedPromptId: '', busy: false, modified: false })
    }
    return this.states[targetId]
  }

  public created(): void {
    this.initializePromptOptions()
  }

  @Watch('targets', { deep: true })
  public onTargetsChange(): void {
    this.initializePromptOptions()
  }

  private initializePromptOptions(): void {
    this.savedRouterPromptId = this.initialRouterPromptId
    this.routerPromptOption = this.promptOptionFromId(this.initialRouterPromptId)
    this.routerPromptModified = false
    const newStates: Record<string, TargetState> = {}
    for (const target of this.targets) {
      if (!target.id) continue
      const savedPromptId = target.promptId ?? ''
      newStates[target.id] = reactive({
        option: this.promptOptionFromId(savedPromptId),
        savedPromptId,
        busy: false,
        modified: false,
      })
    }
    this.states = reactive(newStates)
  }

  private promptOptionFromId(id: string | undefined): PromptOption | undefined {
    if (!id) return undefined
    return { value: { id } as PromptResponse, label: id }
  }

  public clearRouterPrompt(): void {
    this.routerPromptOption = undefined
    this.routerPromptModified = this.savedRouterPromptId !== ''
  }

  public onRouterPromptChange(option: PromptOption | undefined): void {
    this.routerPromptOption = option
    this.routerPromptModified = this.routerPromptId !== this.savedRouterPromptId
  }

  public async saveRouterPrompt(): Promise<void> {
    if (this.routerPromptBusy) return
    this.routerPromptBusy = true
    try {
      await this.api.routerIdPatch({
        id: this.routerId,
        body: { promptId: this.routerPromptId },
      })
      this.savedRouterPromptId = this.routerPromptId
      this.routerPromptModified = false
      this.$emit('router-prompt-updated')
    } finally {
      this.routerPromptBusy = false
    }
  }

  public onTargetPromptChange(targetId: string, option: PromptOption | undefined): void {
    const state = this.targetState(targetId)
    state.option = option
    state.modified = this.targetPromptId(state) !== state.savedPromptId
  }

  public clearTargetPrompt(targetId: string): void {
    const state = this.targetState(targetId)
    state.option = undefined
    state.modified = state.savedPromptId !== ''
  }

  public async saveTargetPrompt(targetId: string): Promise<void> {
    const state = this.targetState(targetId)
    if (state.busy) return
    state.busy = true
    try {
      const { data: updated } = await this.api.routerIdTargetsTargetIdPatch({
        id: this.routerId,
        targetId,
        body: { promptId: state.option?.value?.id ?? '' },
      })
      state.savedPromptId = this.targetPromptId(state)
      state.modified = false
      this.$emit('target-updated', updated)
    } finally {
      state.busy = false
    }
  }

  private targetPromptId(state: TargetState): string {
    return state.option?.value?.id ?? ''
  }

  private get routerPromptId(): string {
    return this.routerPromptOption?.value?.id ?? ''
  }
}
</script>
