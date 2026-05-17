<template lang="pug">
div(class="bg-white border border-gray-100 rounded-xl p-4 shadow-xs")
  slot
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class Card extends Vue {}
</script>
