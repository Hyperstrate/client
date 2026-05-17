<template lang="pug">
transition(name="cross-fade" mode="out-in")
  slot
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class CrossFadeTransition extends Vue {}
</script>

<style lang="scss" scoped>
.cross-fade-enter-active,
.cross-fade-leave-active {
  transition: opacity 300ms;
}

.cross-fade-enter-from,
.cross-fade-leave-to {
  opacity: 0;
}
</style>
