<template lang="pug">
div(class="fixed top-24 right-4")
  div(class="flex flex-col gap-3")
    div(
      v-for="(message, index) in toastMessages"
      :key="index"
      class="flex flex-row gap-3 justify-start min-w-20 max-w-lg px-6 py-5 z-50 bg-white border border-grey-1 shadow-lg"
      :class="[getToastMessageBorderColor(message), getToastMessageBackgroundColor(message)]"
    )
      div(class="flex flex-col gap-2")
        span(v-if="message.title" class="text-body font-bold")
          | {{ message.title }}
        p(class="text-sm font-normal text-main")
          | {{ message.text }}
      ui-clickable(class="text-gray-400" @click="close(message)")
        ui-icon(icon="close" :size="16")
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import { REMOVE_TOAST_MESSAGES, RootMutation, RootState } from '../../store'
import { ToastMessage, ToastMessageType } from './model'

@Component
export default class Toaster extends Vue {
  @RootState
  private readonly toastMessages!: ToastMessage[]

  @RootMutation
  private readonly [REMOVE_TOAST_MESSAGES]!: (messages: ToastMessage[]) => void

  private close(message: ToastMessage): void {
    this[REMOVE_TOAST_MESSAGES]([message])
  }

  private getToastMessageBorderColor({ type }: ToastMessage): string {
    switch (type) {
      case ToastMessageType.SUCCESS:
        return '!border-green-1'
      case ToastMessageType.DANGER:
        return '!border-danger-1'
      case ToastMessageType.ALERT:
        return '!border-warning-1'
      case ToastMessageType.INFO:
        return '!border-info-1'
      default:
        return '!bg-grey-1'
    }
  }

  private getToastMessageBackgroundColor({ type }: ToastMessage): string {
    switch (type) {
      case ToastMessageType.SUCCESS:
        return '!bg-green-base'
      case ToastMessageType.DANGER:
        return '!bg-red-base'
      case ToastMessageType.ALERT:
        return '!bg-yellow-base'
      case ToastMessageType.INFO:
        return '!bg-cyan-base'
      default:
        return '!bg-white'
    }
  }
}
</script>
