<template lang="pug">
ui-layout(use="core-default-layout")
  div(class="flex flex-col flex-1 min-h-0 h-full overflow-hidden")
    app-chat-chat
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class AppView extends Vue {}
</script>
