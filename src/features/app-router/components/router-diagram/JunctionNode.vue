<template lang="pug">
div(class="relative flex items-center justify-center w-4 h-4")
  handle(type="target" :position="Position.Left")
  div(class="w-3 h-3 rounded-full bg-gray-400 border-2 border-white shadow-xs")
  handle#junction-out(type="source" :position="Position.Right")
</template>

<script lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { Component, Vue } from 'vue-facing-decorator'

@Component({ components: { Handle } })
export default class JunctionNode extends Vue {
  public readonly Position = Position
}
</script>
