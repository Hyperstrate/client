<template lang="pug">
div(key="layout" class="h-screen max-h-screen flex")
  aside(class="h-screen flex flex-col shrink-0")
    slot(name="sidebar")
      core-sidebar-control
  div(class="flex-1 flex flex-col")
    header
      slot(name="header")
        core-top-bar-control(class="h-12 px-4 border-b border-gray-200")
    main(key="main" class="flex-1 overflow-auto")
      slot
core-toaster
core-command-palette
</template>

<script lang="ts">
import { APP_TITLE } from '@/env'
import { type ActiveHeadEntry, useHead, UseHeadInput } from '@unhead/vue'
import { Component, Setup, Vue } from 'vue-facing-decorator'

@Component
export default class DefaultLayout extends Vue {
  @Setup(() => useHead({ title: APP_TITLE }))
  private head!: ActiveHeadEntry<UseHeadInput>
}
</script>
