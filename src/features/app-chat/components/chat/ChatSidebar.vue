<template lang="pug">
div(class="w-64 shrink-0 flex flex-col bg-white border-r border-gray-200")
  div(class="flex flex-col gap-3 p-4 border-b border-gray-100")
    ui-button-group(:model-value="modeOption" :options="modes" class="w-full" @update:model-value="$emit('update:mode', $event.value)")

    template(v-if="mode === 'model'")
      ui-overline Model
      domain-ui-input-combobox-model(:model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)")
    template(v-else)
      ui-overline Router
      domain-ui-input-combobox-router(:model-value="selectedRouter" @update:model-value="$emit('update:selectedRouter', $event)")

    ui-button(:size="Size.SM" :variant="Variant.Gray" class="w-full" :disabled="mode === 'model' ? !modelValue : !selectedRouter" @click="$emit('newChat')")
      template(#before)
        ui-icon(icon="plus" :size="16")
      | New Chat

  template(v-if="mode === 'model'")
    div(class="flex-1 overflow-y-auto")
      div(v-if="loadingConversations" v-loading="true")
      div(v-else-if="conversations.length === 0" class="p-8 text-sm text-gray-400 text-center") No conversations yet
      div(v-else class="flex flex-col")
        ui-clickable(
          v-for="conv in conversations"
          :key="conv.id"
          tag="button"
          :class="['w-full text-left px-4 py-3 border-b border-gray-100 transition-colors flex flex-col gap-0.5', conv.id === conversationId ? 'bg-blue-50' : 'hover:bg-gray-50']"
          @click="$emit('selectConversation', conv)"
        )
          p(class="text-sm font-medium text-gray-900 truncate") {{ conv.preview || 'New conversation' }}
          p(class="text-xs text-gray-400") {{ formatDate(conv.createdAt) }}
  template(v-else)
    div(class="p-8 text-sm text-gray-400 text-center") Router chats are stateless — history lives only in this session.
</template>

<script lang="ts">
import { ArrayProp, BooleanProp, OptionalProp, StringProp } from '@/util/prop-decorators'
import { Size, Variant } from '@/features/ui/clickables/model'
import type { Option } from '@/features/ui/inputs/model'
import { Component, Vue } from 'vue-facing-decorator'
import type { ChatMode, Conversation, ModelOption, RouterOption } from './types'
import { formatDate as formatShortDate } from '@/util/format'

type ChatSidebarEmits = {
  (e: 'update:modelValue', value?: ModelOption): void
  (e: 'update:selectedRouter', value?: RouterOption): void
  (e: 'update:mode', value: ChatMode): void
  (e: 'newChat'): void
  (e: 'selectConversation', value: Conversation): void
  (e: string, ...args: unknown[]): void
}

@Component({ emits: ['update:modelValue', 'update:selectedRouter', 'update:mode', 'newChat', 'selectConversation'] })
export default class ChatSidebar extends Vue {
  public Variant = Variant
  public Size = Size
  public readonly formatDate = (iso: string): string => formatShortDate(iso, { month: 'short', day: 'numeric' })

  declare public $emit: ChatSidebarEmits

  public readonly modes: Option<ChatMode>[] = [
    { value: 'model', label: 'Model' },
    { value: 'router', label: 'Router' },
  ]

  @OptionalProp(undefined)
  public readonly modelValue!: ModelOption | undefined

  @OptionalProp(undefined)
  public readonly selectedRouter!: RouterOption | undefined

  @StringProp('model')
  public readonly mode!: ChatMode

  @ArrayProp(() => [])
  public readonly conversations!: Conversation[]

  @BooleanProp(false)
  public readonly loadingConversations!: boolean

  @OptionalProp(null)
  public readonly conversationId!: string | undefined

  public get modeOption(): Option<ChatMode> {
    return this.modes.find((m) => m.value === this.mode) ?? this.modes[0]
  }
}
</script>
