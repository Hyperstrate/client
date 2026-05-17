<template lang="pug">
ui-modal(ref="modalRef")
  template(#trigger="props")
    slot(name="trigger" v-bind="props")

  template(#default)
    div(class="w-full")
      div(class="px-6 pt-6 pb-4 border-b border-gray-100")
        div(class="flex flex-col gap-0.5")
          h2(class="text-base font-semibold text-gray-900") {{ isEditing ? 'Edit Prompt' : 'New System Prompt' }}
          p(class="text-sm text-gray-500") Use {{ '{' }}{{ '{' }}variable{{ '}' }}{{ '}' }} placeholders — they are filled from request fields at inference time

      ui-form(
        v-slot="{ dirty, validated, busy, submit, formData, apiError }"
        :validation="PromptFormData"
        :action="save"
        :initial-data="initialFormData"
        :auto-dirty="isEditing"
        no-reset
      )
        div(class="flex flex-col gap-4 px-6 py-5")
          p(v-if="apiError" class="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2") {{ apiError }}
          ui-form-field(input="ui-input-text" path="name" label="Name" placeholder="e.g. customer-support-agent" required)
          ui-form-field(input="ui-input-text" path="description" label="Description" placeholder="Optional description")
          div(class="flex flex-col gap-1.5")
            div(class="flex items-center justify-between")
              div(v-if="computeVars(formData.content).length > 0" class="flex items-center gap-1")
                span(class="text-xs text-gray-400") Variables:
                span(v-for="v in computeVars(formData.content)" :key="v" class="font-mono bg-blue-50 text-blue-700 px-1 rounded text-xs") {{ '{' }}{{ '{' }}+ v +{{ '}' }}{{ '}' }}
            ui-form-field(input="ui-input-textarea" path="content" label="Content" :placeholder="contentPlaceholder" :input-props="{ rows: 8 }" required)

        div(class="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100")
          ui-button(type="button" :variant="Variant.Gray" @click="close") Cancel
          ui-button(:disabled="!dirty || !validated" :busy="busy" @click="submit")
            | {{ isEditing ? 'Save changes' : 'Create prompt' }}
</template>

<script lang="ts">
import type { HyperstrateServerInternalModulesPromptsApplicationPromptResponse } from '@/__generated__/hyperstrate-api'
import { HyperstrateApi } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { Variant } from '@/features/ui/clickables/model'
import Modal from '@/features/ui/modal/Modal.global.vue'
import { Mixins } from '@/util/mixin'
import { ObjectProp } from '@/util/prop-decorators'
import { IsNotEmpty, IsOptional } from 'class-validator'
import { Component, Ref } from 'vue-facing-decorator'

type Prompt = HyperstrateServerInternalModulesPromptsApplicationPromptResponse

const varRe = /\{\{(\w+)\}\}/g

export class PromptFormData {
  @IsNotEmpty()
  name!: string

  @IsOptional()
  description?: string

  @IsNotEmpty()
  content!: string
}

type PromptModalEmits = {
  (e: 'saved'): void
  (e: string): void
}

@Component({ emits: ['saved'] })
export default class PromptModal extends Mixins(ApiClientsMixin) {
  declare public $emit: PromptModalEmits

  public readonly PromptFormData = PromptFormData
  public Variant = Variant

  @ObjectProp(() => ({}))
  public readonly prompt?: Prompt

  @Ref()
  public readonly modalRef!: Modal

  public get isEditing(): boolean {
    return !!this.prompt?.id
  }

  public computeVars(content: unknown): string[] {
    if (typeof content !== 'string' || !content) return []
    const seen = new Set<string>()
    const out: string[] = []
    for (const m of content.matchAll(new RegExp(varRe.source, 'g'))) {
      if (!seen.has(m[1])) {
        seen.add(m[1])
        out.push(m[1])
      }
    }
    return out
  }

  public get initialFormData(): Partial<PromptFormData> {
    return {
      name: this.prompt?.name ?? '',
      description: this.prompt?.description ?? '',
      content: this.prompt?.content ?? '',
    }
  }

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  private get contentPlaceholder(): string {
    return 'You are a helpful assistant for {{company_name}}. Always respond in {{language}}.'
  }

  public async save(formData: PromptFormData): Promise<void> {
    if (this.isEditing && this.prompt) {
      await this.api.promptsIdPatch({
        id: this.prompt.id,
        body: {
          name: formData.name.trim(),
          description: formData.description?.trim() || undefined,
          content: formData.content,
        },
      })
    } else {
      await this.api.promptsPost({
        body: {
          name: formData.name.trim(),
          description: formData.description?.trim() || undefined,
          content: formData.content,
        },
      })
    }
    this.$emit('saved')
    this.close()
  }

  public open(): void {
    this.modalRef.open()
  }

  public close(): void {
    this.modalRef.close()
  }
}
</script>
