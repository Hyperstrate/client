<template lang="pug">
ui-layout(use="core-default-layout")
  ui-cross-fade-transition
    div(class="flex flex-col h-1/2 justify-center items-center")
      div(class="text-lg")
        | Not Found
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class NotFoundView extends Vue {}
</script>
