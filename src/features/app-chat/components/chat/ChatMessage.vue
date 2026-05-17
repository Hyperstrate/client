<!-- eslint-disable vue/no-v-html -->
<template lang="pug">
div(:class="['flex gap-3', message.role === 'user' ? 'justify-end' : 'justify-start']")
  div(:class="['max-w-2xl flex flex-col gap-2', message.role === 'user' ? 'items-end' : 'items-start']")
    //- Attached media fields
    div(v-if="message.fields && hasVisibleFields" class="flex flex-col gap-2 max-w-full")
      template(v-for="(value, key) in message.fields" :key="key")
        template(v-if="key !== 'prompt' && value")
          div(v-if="fieldMediaType(String(value)) === 'images'" class="flex flex-wrap gap-1.5")
            img(v-for="(src, idx) in parseImageField(String(value))" :key="idx" :src="src" class="max-h-48 rounded-xl object-contain border border-gray-200")
          video(v-else-if="fieldMediaType(String(value)) === 'video'" :src="String(value)" controls class="max-h-40 rounded-xl w-full border border-gray-200")
          audio(v-else-if="fieldMediaType(String(value)) === 'audio'" :src="String(value)" controls class="w-full")
          div(v-else class="rounded-lg bg-gray-100 border border-gray-200 px-3 py-1.5 text-xs text-gray-600 flex items-baseline gap-1")
            span(class="font-semibold shrink-0") {{ formatFieldKey(String(key)) }}:
            span {{ String(value) }}

    //- Message bubble
    div(
      :class="['px-4 py-3 rounded-2xl text-sm leading-relaxed break-words', message.role === 'user' ? 'bg-gray-900 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm']"
    )
      div(v-if="message.role === 'assistant'")
        span(v-if="isLoadingCursor" class="inline-block w-0.5 h-4 bg-gray-500 rounded animate-[blink_1s_step-end_infinite]")
        div(
          v-else
          class="prose prose-sm max-w-none prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1 prose-code:rounded"
          v-html="renderedContent"
        )
      p(v-else class="whitespace-pre-wrap")
        | {{ message.content }}
        span(v-if="message.streaming" class="inline-block w-1.5 h-[1em] bg-current animate-pulse rounded align-middle")
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { RequiredProp } from '@/util/prop-decorators'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import type { Message } from './types'

// Register a code renderer that uses highlight.js.
// Uses marked.use() — the correct API for marked v5+.
marked.use({
  renderer: {
    code({ text, lang }: { text: string; lang?: string }) {
      const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
      const highlighted = hljs.highlight(text, { language }).value
      return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`
    },
  },
})

@Component
export default class ChatMessage extends Vue {
  @RequiredProp()
  public readonly message!: Message

  public get isLoadingCursor(): boolean {
    return !!this.message.streaming && !this.message.content
  }

  public get renderedContent(): string {
    return DOMPurify.sanitize(marked(this.message.content ?? '') as string)
  }

  public get hasVisibleFields(): boolean {
    if (!this.message.fields) return false
    return Object.entries(this.message.fields).some(([k, v]) => k !== 'prompt' && v)
  }

  public fieldMediaType(value: string): 'images' | 'video' | 'audio' | 'text' {
    try {
      const arr = JSON.parse(value)
      if (Array.isArray(arr) && arr.length > 0) {
        const first = arr[0] as string
        if (first.startsWith('data:image/')) return 'images'
        if (first.startsWith('data:video/')) return 'video'
        if (first.startsWith('data:audio/')) return 'audio'
      }
    } catch {}
    if (value.startsWith('data:image/')) return 'images'
    if (value.startsWith('data:video/')) return 'video'
    if (value.startsWith('data:audio/')) return 'audio'
    return 'text'
  }

  public parseImageField(value: string): string[] {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed
    } catch {}
    return [value]
  }

  public formatFieldKey(key: string): string {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
  }
}
</script>
