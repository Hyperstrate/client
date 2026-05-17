<template lang="pug">
top-bar
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import TopBar from './TopBar.vue'

@Component({
  components: {
    TopBar,
  },
})
export default class TopBarControl extends Vue {}
</script>
