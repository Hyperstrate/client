<template lang="pug">
ui-drawer(:model-value="!!promptId" :title="drawerTitle" @close="$emit('close')")
  div(v-if="promptId" class="px-6 py-5 flex flex-col gap-4")
    div(v-if="loading" class="text-sm text-gray-400") Loading versions…
    div(v-else-if="!versions.length" class="text-sm text-gray-400 py-8 text-center") No versions recorded yet.
    div(v-else class="flex flex-col gap-3")
      div(
        v-for="v in versions"
        :key="v.id"
        class="border border-gray-100 rounded-xl p-4 flex flex-col gap-2"
        :class="v.version === currentVersion ? 'border-indigo-200 bg-indigo-50' : 'bg-white'"
      )
        div(class="flex items-center justify-between gap-3")
          div(class="flex items-center gap-2")
            span(class="text-xs font-semibold text-gray-700") v{{ v.version }}
            ui-badge(v-if="v.version === currentVersion" variant="indigo" :size="Size.SM") current
            span(v-if="v.name" class="text-xs text-gray-500") {{ v.name }}
          div(class="flex items-center gap-2")
            span(class="text-xs text-gray-400") {{ v.createdAt ? formatDate(v.createdAt) : '' }}
            ui-button(
              v-if="v.version !== currentVersion"
              :busy="restoringId !== undefined && restoringId === v.id"
              :variant="Variant.Gray"
              :size="Size.SM"
              @click="restore(v)"
            ) Restore
        div(v-if="v.variables?.length" class="flex flex-wrap gap-1")
          ui-badge(v-for="vr in v.variables" :key="vr" variant="blue" :size="Size.SM") {{ '{' }}{{ '{' }}+ vr +{{ '}' }}{{ '}' }}
        pre(v-if="expanded === v.id" class="text-xs bg-gray-50 border border-gray-100 rounded p-3 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto") {{ v.content }}
        ui-clickable(tag="button" class="self-start text-xs text-indigo-600 hover:underline" @click="expanded = expanded === v.id ? undefined : v.id") {{ expanded === v.id ? 'Hide content' : 'Show content' }}
</template>

<script lang="ts">
import type { HyperstrateServerInternalModulesPromptsApplicationPromptVersionResponse } from '@/__generated__/hyperstrate-api'
import { HyperstrateApi } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Size, Variant } from '@/features/ui/clickables/model'
import { formatDate } from '@/util/format'
import { Mixins } from '@/util/mixin'
import { Component, Watch } from 'vue-facing-decorator'
import { NumberProp, OptionalProp } from '@/util/prop-decorators'

type Version = HyperstrateServerInternalModulesPromptsApplicationPromptVersionResponse

type Emits = {
  close: []
  restored: []
  (e: string): void
}

@Component({ emits: ['close', 'restored'] })
export default class PromptVersionDrawer extends Mixins(ApiClientsMixin) {
  declare public $emit: Emits
  private readonly Size = Size
  public readonly formatDate = formatDate

  @OptionalProp()
  public readonly promptId?: string

  @OptionalProp()
  public readonly promptName?: string

  @NumberProp(0)
  public readonly currentVersion!: number

  public readonly Variant = Variant
  public versions: Version[] = []
  public loading = false
  public restoringId?: string = undefined
  public expanded?: string = undefined

  public get drawerTitle(): string {
    return this.promptName ? `Version history — ${this.promptName}` : 'Version history'
  }

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  @Watch('promptId', { immediate: true })
  public async onPromptIdChange(): Promise<void> {
    this.versions = []
    this.expanded = undefined
    if (!this.promptId) return
    this.loading = true
    try {
      const { data } = await this.api.promptsIdVersionsGet({ id: this.promptId })
      this.versions = (data as unknown as { items?: Version[] })?.items ?? (data as unknown as Version[]) ?? []
    } finally {
      this.loading = false
    }
  }

  public async restore(v: Version): Promise<void> {
    if (!this.promptId || this.restoringId) return
    this.restoringId = v.id
    try {
      await this.api.promptsIdVersionsVersionIdRestorePost({ id: this.promptId, versionId: v.id! })
      this.$emit('restored')
      this.$emit('close')
    } finally {
      this.restoringId = undefined
    }
  }
}
</script>
