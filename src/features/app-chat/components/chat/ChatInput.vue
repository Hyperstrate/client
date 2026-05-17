<template lang="pug">
div(class="px-4 pb-4 pt-2 shrink-0")
  div(class="border border-gray-200 rounded-2xl bg-white shadow-xs overflow-hidden")
    //- Active extra field content
    div(v-if="activeField && activeFieldDef" class="px-4 pt-3 pb-1 flex flex-col gap-2")
      span(class="text-xs font-medium text-gray-500") {{ activeFieldDef.label }}

      //- Text field
      ui-input-textarea(
        v-if="activeFieldDef.type === 'text'"
        v-model="extraTextFields[activeField]"
        :placeholder="activeFieldDef.description || activeFieldDef.label"
        :rows="2"
        class="w-full !min-w-0"
      )

      //- Image field
      template(v-else-if="activeFieldDef.type === 'image'")
        input(
          :ref="'fileInput_' + activeField"
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          multiple
          class="hidden"
          @change="handleImageUpload(activeField, $event)"
        )
        div(v-if="(extraImageLists[activeField] || []).length > 0" class="flex flex-wrap gap-2")
          div(v-for="(src, idx) in extraImageLists[activeField]" :key="idx" class="relative group")
            img(:src="src" class="h-20 w-20 object-cover rounded-lg border border-gray-200")
            ui-clickable(
              tag="button"
              class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              @click="removeImage(activeField, idx)"
            ) ✕
        ui-button(:variant="Variant.Gray" :size="Size.SM" @click="openFileInput(activeField)")
          | {{ (extraImageLists[activeField] || []).length > 0 ? '+ Add more' : 'Choose image' }}

      //- Single file field
      template(v-else)
        input(
          :ref="'fileInput_' + activeField"
          type="file"
          :accept="fileAccept(activeFieldDef.type)"
          class="hidden"
          @change="handleSingleFileUpload(activeField, $event)"
        )
        div(class="flex items-center gap-3")
          ui-button(:variant="Variant.Gray" :size="Size.SM" @click="openFileInput(activeField)") Choose file
          span(class="text-xs text-gray-400 truncate max-w-xs")
            | {{ extraFileNames[activeField] || 'No file chosen' }}
          div(class="flex-1 flex justify-end")
            ui-button(v-if="extraFileFields[activeField]" :variant="Variant.Red" :outlined="true" :size="Size.SM" @click="clearFileField(activeField)") ✕ Clear
        video(
          v-if="activeFieldDef.type === 'video' && extraFileFields[activeField]"
          :src="extraFileFields[activeField]"
          controls
          class="max-h-40 rounded-lg border border-gray-200 w-full"
        )
        audio(v-else-if="activeFieldDef.type === 'audio' && extraFileFields[activeField]" :src="extraFileFields[activeField]" controls class="w-full")

    //- Extra field pills
    div(v-if="nonPromptFields.length > 0" class="flex gap-1.5 px-4 pt-3 flex-wrap")
      ui-clickable(
        v-for="field in nonPromptFields"
        :key="field.key"
        tag="button"
        :class="['flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors', activeField === field.key ? 'bg-gray-900 text-white border-gray-900' : hasFieldValue(field) ? 'bg-blue-50 text-blue-700 border-blue-200' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-500']"
        @click="toggleField(field.key)"
      )
        span {{ fieldTypeIcon(field.type) }}
        span {{ field.label }}
        span(v-if="hasFieldValue(field) && activeField !== field.key && field.type === 'image'" class="opacity-60") &nbsp;{{ extraImageLists[field.key]?.length }}
        span(v-else-if="hasFieldValue(field) && activeField !== field.key" class="opacity-60") &nbsp;✓

    //- Prompt textarea
    div(class="px-4 py-3")
      textarea(
        ref="promptInput"
        v-model="inputValue"
        placeholder="Type a message…"
        :disabled="streaming"
        rows="1"
        class="w-full text-sm focus:outline-hidden resize-none bg-transparent placeholder:text-gray-400 text-gray-900"
        style="min-height: 24px; max-height: 160px"
        @keydown.enter.exact.prevent="handleSend"
        @input="autoResize"
      )

    //- Bottom bar
    div(class="flex items-center justify-between px-4 pb-3")
      span(class="text-xs text-gray-400 truncate") {{ modelLabel || 'No model selected' }}
      ui-clickable(
        v-if="streaming"
        tag="button"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-medium text-gray-700 transition-colors shrink-0"
        @click="$emit('stop')"
      )
        span(class="w-2 h-2 rounded-xs bg-gray-700 shrink-0")
        span Stop
      ui-clickable(
        v-else
        tag="button"
        :disabled="!canSend"
        :class="['flex items-center justify-center w-7 h-7 rounded-full transition-colors shrink-0', canSend ? 'bg-gray-900 hover:bg-gray-700 text-white' : 'bg-gray-100 text-gray-300 cursor-not-allowed']"
        @click="handleSend"
      )
        svg(xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5")
          path(
            d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"
          )
</template>

<script lang="ts">
import { ArrayProp, BooleanProp, StringProp } from '@/util/prop-decorators'
import { Size, Variant } from '@/features/ui/clickables/model'
import { Component, Ref, Vue } from 'vue-facing-decorator'
import type { InputFieldDef, SendPayload } from './types'

type ChatInputEmits = {
  (e: 'send', value: SendPayload): void
  (e: 'stop'): void
  (e: string): void
}

@Component
export default class ChatInput extends Vue {
  public Variant = Variant
  public Size = Size

  declare public $emit: ChatInputEmits

  @Ref()
  private readonly promptInput?: HTMLTextAreaElement

  @ArrayProp(() => [])
  public readonly nonPromptFields!: InputFieldDef[]

  @BooleanProp(false)
  public readonly streaming!: boolean

  @StringProp()
  public readonly modelLabel!: string | undefined

  public inputValue = ''
  public activeField?: string = undefined
  public extraTextFields: Record<string, string> = {}
  public extraImageLists: Record<string, string[]> = {}
  public extraFileFields: Record<string, string> = {}
  public extraFileNames: Record<string, string> = {}

  public get activeFieldDef(): InputFieldDef | undefined {
    return this.nonPromptFields.find((f) => f.key === this.activeField)
  }

  public get canSend(): boolean {
    if (!this.inputValue.trim() || !this.modelLabel || this.streaming) return false
    return this.nonPromptFields
      .filter((f) => f.required)
      .every((f) => {
        if (f.type === 'text') return !!this.extraTextFields[f.key]?.trim()
        if (f.type === 'image') return (this.extraImageLists[f.key]?.length ?? 0) > 0
        return !!this.extraFileFields[f.key]
      })
  }

  public hasFieldValue(field: InputFieldDef): boolean {
    if (field.type === 'text') return !!this.extraTextFields[field.key]?.trim()
    if (field.type === 'image') return (this.extraImageLists[field.key]?.length ?? 0) > 0
    return !!this.extraFileFields[field.key]
  }

  public toggleField(key: string): void {
    this.activeField = this.activeField === key ? undefined : key
  }

  public removeImage(key: string, idx: number): void {
    this.extraImageLists[key]?.splice(idx, 1)
  }

  public clearFileField(key: string): void {
    delete this.extraFileFields[key]
    delete this.extraFileNames[key]
    const input = this.$refs[`fileInput_${key}`] as HTMLInputElement | undefined
    if (input) input.value = ''
  }

  public fileAccept(type: string): string {
    const map: Record<string, string> = { video: 'video/*', audio: 'audio/*', file: '*/*' }
    return map[type] ?? '*/*'
  }

  public openFileInput(key: string): void {
    const ref = this.$refs[`fileInput_${key}`] as HTMLInputElement | undefined
    ref?.click()
  }

  public handleImageUpload(key: string, event: Event): void {
    const files = (event.target as HTMLInputElement).files
    if (!files || files.length === 0) return
    if (!this.extraImageLists[key]) this.extraImageLists[key] = []
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        this.extraImageLists[key].push(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    })
    ;(event.target as HTMLInputElement).value = ''
  }

  public handleSingleFileUpload(key: string, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      this.extraFileFields[key] = e.target?.result as string
      this.extraFileNames[key] = file.name
    }
    reader.readAsDataURL(file)
  }

  public fieldTypeIcon(type: string): string {
    const icons: Record<string, string> = { image: '🖼', video: '🎬', audio: '🎵', file: '📎', text: '✏️' }
    return icons[type] ?? '📄'
  }

  public autoResize(e: Event): void {
    const el = e.target as HTMLTextAreaElement
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  public handleSend(): void {
    if (!this.canSend) return

    const prompt = this.inputValue.trim()
    const apiFields: Record<string, string> = { prompt, ...this.extraTextFields }
    const displayFields: Record<string, string> = {}

    for (const [key, images] of Object.entries(this.extraImageLists)) {
      const val = images.length === 1 ? images[0] : JSON.stringify(images)
      apiFields[key] = val
      displayFields[key] = val
    }
    for (const [key, value] of Object.entries(this.extraFileFields)) {
      apiFields[key] = value
      displayFields[key] = value
    }

    const payload: SendPayload = { prompt, apiFields, displayFields }
    this.reset()
    this.$emit('send', payload)
  }

  public reset(): void {
    this.inputValue = ''
    this.activeField = undefined
    this.extraTextFields = {}
    this.extraImageLists = {}
    this.extraFileFields = {}
    this.extraFileNames = {}
    if (this.promptInput) this.promptInput.style.height = 'auto'
    this.clearFileInputs()
  }

  private clearFileInputs(): void {
    for (const field of this.nonPromptFields) {
      if (field.type !== 'text') {
        const input = this.$refs[`fileInput_${field.key}`] as HTMLInputElement | undefined
        if (input) input.value = ''
      }
    }
  }
}
</script>
