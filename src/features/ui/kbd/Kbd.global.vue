<template lang="pug">
kbd(class="inline-flex items-center px-1.5 py-0.5 rounded bg-white border border-zinc-200 shadow-xs font-mono text-xs text-zinc-500")
  slot
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class Kbd extends Vue {}
</script>
