<template lang="pug">
div(ref="container" class="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4")
  div(v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full gap-1")
    p(class="text-gray-400 font-medium text-sm") No messages yet
    p(class="text-gray-400 text-xs") Select a model and start a conversation below.
  chat-message(v-for="message in messages" :key="message.id" :message="message")
</template>

<script lang="ts">
import { ArrayProp } from '@/util/prop-decorators'
import { Component, Ref, Vue, Watch } from 'vue-facing-decorator'
import ChatMessage from './ChatMessage.vue'
import type { Message } from './types'

@Component({ components: { ChatMessage } })
export default class ChatMessages extends Vue {
  @Ref()
  private readonly container?: HTMLElement

  @ArrayProp(() => [])
  public readonly messages!: Message[]

  @Watch('messages', { deep: true })
  private onMessagesChange(): void {
    void this.$nextTick(() => this.scrollToBottom())
  }

  private scrollToBottom(): void {
    if (this.container) this.container.scrollTop = this.container.scrollHeight
  }
}
</script>
