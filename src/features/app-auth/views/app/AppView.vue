<template lang="pug">
ui-layout(use="core-default-layout")
  div(class="h-full flex flex-col")
    div(class="max-w-screen-lg w-full mx-auto px-4 pt-8 pb-4 shrink-0")
      domain-ui-page-header(title="Auth" subtitle="API keys, virtual keys and teams")
    div(class="flex-1 min-h-0 overflow-hidden")
      div(class="max-w-screen-lg mx-auto px-4 pb-6 h-full")
        app-auth-app-tab-bar-control
</template>

<script lang="ts">
import { Component } from 'vue-facing-decorator'
import { Vue } from 'vue-facing-decorator'

@Component
export default class AppView extends Vue {}
</script>
