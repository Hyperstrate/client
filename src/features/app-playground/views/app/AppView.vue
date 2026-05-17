<template lang="pug">
ui-layout(use="core-default-layout")
  div(class="h-full flex flex-col")
    div(class="max-w-screen-lg w-full mx-auto px-4 pt-8 pb-4 shrink-0")
      domain-ui-page-header(title="Playground" subtitle="Compare models side-by-side or test a router with full pipeline visibility")
    div(class="flex-1 overflow-y-auto min-h-0")
      div(class="max-w-screen-lg mx-auto px-4 pb-6")
        app-playground-playground
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class AppView extends Vue {}
</script>
