<template lang="pug">
div(class="flex h-full overflow-hidden bg-gray-50")
  chat-sidebar(
    v-model="selectedModel"
    v-model:selected-router="selectedRouter"
    v-model:mode="chatMode"
    :conversations="conversations"
    :loading-conversations="loadingConversations"
    :conversation-id="conversationId"
    @new-chat="startNewChat"
    @select-conversation="selectConversation"
  )

  div(class="flex flex-col flex-1 min-w-0 overflow-hidden")
    //- Top bar
    div(class="px-6 py-3 border-b border-gray-200 flex items-center justify-between bg-white shrink-0")
      div
        span(v-if="chatMode === 'model' && selectedModel" class="text-sm font-semibold text-gray-900") {{ selectedModel.label }}
        span(v-else-if="chatMode === 'router' && selectedRouter" class="text-sm font-semibold text-gray-900") {{ selectedRouter.label }}
        span(v-else class="text-sm text-gray-400") {{ chatMode === 'router' ? 'No router selected' : 'No model selected' }}
      ui-button(v-show="conversationId || (chatMode === 'router' && messages.length)" :variant="Variant.Gray" :size="Size.SM" @click="startNewChat") New chat

    chat-messages(:messages="messages")

    chat-input(
      ref="chatInputRef"
      :non-prompt-fields="nonPromptFields"
      :streaming="streaming"
      :model-label="chatMode === 'model' ? selectedModel?.label : selectedRouter?.label"
      @send="handleSend"
      @stop="stopStream"
    )
</template>

<script lang="ts">
import {
  HyperstrateApi,
  HyperstrateServerInternalModulesAiApplicationAddConversationMessageInputRoleEnum as ConversationRole,
} from '@/__generated__/hyperstrate-api'
import { HYPERSTRATE_API_URL } from '@/env'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { RootState } from '@/features/core/store'
import { type IdToken } from '@/features/core/store/id-token'
import { Mixins } from '@/util/mixin'
import { AsyncData } from '@/util/async-data.decorator'
import { Persist } from '@/util/persist-decorator'
import { Size, Variant } from '@/features/ui/clickables/model'
import { Component, Ref, Watch } from 'vue-facing-decorator'
import ChatInput from './ChatInput.vue'
import ChatMessages from './ChatMessages.vue'
import ChatSidebar from './ChatSidebar.vue'
import type { ChatMode, Conversation, InputFieldDef, Message, ModelOption, RouterOption, SendPayload } from './types'

@Component({ components: { ChatSidebar, ChatMessages, ChatInput } })
export default class Chat extends Mixins(ApiClientsMixin) {
  public Variant = Variant
  public Size = Size

  @RootState
  private readonly idToken!: IdToken

  @Ref()
  private readonly chatInputRef?: ChatInput

  @Persist('chat:mode')
  public chatMode: ChatMode = 'model'

  @Persist('chat:lastModel')
  public selectedModel: ModelOption | undefined = undefined

  @Persist('chat:lastRouter')
  public selectedRouter: RouterOption | undefined = undefined

  public messages: Message[] = []
  public streaming = false
  public conversations: Conversation[] = []
  public loadingConversations = false
  public conversationId?: string = undefined

  private abortController?: AbortController = undefined

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  private streamAuthHeaders(): Record<string, string> {
    return this.idToken.accessToken ? { Authorization: `Bearer ${this.idToken.accessToken}` } : {}
  }

  public get nonPromptFields(): InputFieldDef[] {
    const fields = this.selectedModel?.value?.inputFields as InputFieldDef[] | undefined
    return fields?.filter((f) => f.key !== 'prompt') ?? []
  }

  public async created(): Promise<void> {
    // Clear persisted selections if the referenced resource no longer exists.
    if (this.selectedModel?.value?.id) {
      try {
        await this.api.aiModelsIdGet({ id: this.selectedModel.value.id })
      } catch {
        this.selectedModel = undefined
      }
    }
    if (this.selectedRouter?.value?.id) {
      try {
        await this.api.routerIdGet({ id: this.selectedRouter.value.id })
      } catch {
        this.selectedRouter = undefined
      }
    }
  }

  @Watch('selectedModel')
  public onModelChange(): void {
    this.startNewChat()
  }

  @Watch('selectedRouter')
  public onRouterChange(): void {
    this.startNewChat()
  }

  @Watch('chatMode')
  public onModeChange(): void {
    this.startNewChat()
  }

  public startNewChat(): void {
    this.conversationId = undefined
    this.messages = []
    this.chatInputRef?.reset()
  }

  public stopStream(): void {
    this.abortController?.abort()
  }

  public async selectConversation(conv: Conversation): Promise<void> {
    this.conversationId = conv.id
    this.messages = []
    const { data: msgs } = await this.api.aiConversationsIdMessagesGet({ id: conv.id })
    this.messages = msgs.map((m) => ({
      id: m.id ?? Date.now().toString(),
      role: (m.role ?? 'user') as 'user' | 'assistant',
      content: m.content ?? '',
      fields: m.fields ? (JSON.parse(m.fields) as Record<string, string>) : undefined,
    }))
  }

  @AsyncData()
  public async asyncData(): Promise<AsyncData<Chat>> {
    this.loadingConversations = true
    try {
      const { data } = await this.api.aiConversationsGet({ perPage: 50 })
      const conversations: Conversation[] = (data.items ?? []).map((c) => ({
        id: c.id ?? '',
        modelId: c.modelId ?? '',
        title: c.title ?? '',
        preview: c.title || undefined,
        createdAt: c.createdAt ?? '',
        modifiedAt: c.modifiedAt ?? '',
      }))
      await this.hydrateConversationPreviews(conversations)
      return { conversations }
    } finally {
      this.loadingConversations = false
    }
  }

  private async hydrateConversationPreviews(conversations: Conversation[]): Promise<void> {
    await Promise.all(
      conversations
        .filter((c) => !c.preview)
        .map(async (conv) => {
          const { data: msgs } = await this.api.aiConversationsIdMessagesGet({ id: conv.id })
          const first = msgs.find((m) => m.role === 'user')
          if (first) conv.preview = (first.content ?? '').slice(0, 60)
        }),
    )
  }

  public async handleSend(payload: SendPayload): Promise<void> {
    if (this.chatMode === 'router') {
      await this.handleRouterSend(payload)
    } else {
      await this.handleModelSend(payload)
    }
  }

  private async handleRouterSend(payload: SendPayload): Promise<void> {
    const routerId = this.selectedRouter!.value.id

    this.messages.push({ id: Date.now().toString(), role: 'user', content: payload.prompt })
    this.pushStreamingAssistant()

    const openAiMessages = this.messages.slice(0, -1).map((m) => ({ role: m.role, content: m.content }))

    try {
      await this.streamChatCompletions(`${HYPERSTRATE_API_URL}/router/${routerId}/v1/chat/completions`, openAiMessages)
    } catch (error) {
      this.handleStreamError(error)
    } finally {
      this.finalizeStream()
    }
  }

  private async handleModelSend(payload: SendPayload): Promise<void> {
    this.messages.push({
      id: Date.now().toString(),
      role: 'user',
      content: payload.prompt,
      fields: Object.keys(payload.displayFields).length ? payload.displayFields : undefined,
    })
    this.pushStreamingAssistant()

    try {
      if (!this.conversationId) {
        const { data: conv } = await this.api.aiConversationsPost({
          body: { modelId: this.selectedModel!.value.id },
        })
        this.conversationId = conv.id ?? null
        this.conversations.unshift({
          id: conv.id,
          modelId: conv.modelId,
          title: conv.title ?? '',
          preview: payload.prompt.slice(0, 60),
          createdAt: conv.createdAt,
          modifiedAt: conv.modifiedAt,
        })
      }

      const openAiMessages = this.messages.slice(0, -1).map((m) => ({ role: m.role, content: m.content }))
      const modelId = this.selectedModel!.value.id

      await this.streamChatCompletions(`${HYPERSTRATE_API_URL}/proxy/ai/${modelId}/v1/chat/completions`, openAiMessages)

      if (this.conversationId) {
        const convId = this.conversationId
        const assistantContent = this.messages[this.messages.length - 1].content
        await Promise.all([
          this.api.aiConversationsIdMessagesPost({ id: convId, body: { role: ConversationRole.USER, content: payload.prompt } }),
          this.api.aiConversationsIdMessagesPost({ id: convId, body: { role: ConversationRole.ASSISTANT, content: assistantContent } }),
        ])
      }
    } catch (error) {
      this.handleStreamError(error)
    } finally {
      this.finalizeStream()
    }
  }

  private pushStreamingAssistant(): void {
    this.streaming = true
    this.abortController = new AbortController()
    this.messages.push({ id: (Date.now() + 1).toString(), role: 'assistant', content: '', streaming: true })
  }

  private handleStreamError(error: unknown): void {
    if (error instanceof Error && error.name === 'AbortError') return
    this.messages[this.messages.length - 1].content = `Error: ${error instanceof Error ? error.message : 'Something went wrong'}`
  }

  private finalizeStream(): void {
    this.messages[this.messages.length - 1].streaming = false
    this.streaming = false
    this.abortController = undefined
  }

  private async streamChatCompletions(url: string, messages: Array<{ role: string; content: string }>): Promise<void> {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.streamAuthHeaders() },
      body: JSON.stringify({ messages, stream: true }),
      signal: this.abortController!.signal,
    })

    if (!response.ok || !response.body) {
      const errorText = await response.text()
      throw new Error(errorText || `Request failed: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let done = false

    while (!done) {
      const { done: streamDone, value } = await reader.read()
      if (streamDone) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const chunk = line.slice(6)
        if (chunk === '[DONE]') {
          done = true
          break
        }
        try {
          const parsed = JSON.parse(chunk)
          const delta = parsed.choices?.[0]?.delta?.content
          if (delta) this.messages[this.messages.length - 1].content += delta
        } catch {}
      }
    }
  }
}
</script>
