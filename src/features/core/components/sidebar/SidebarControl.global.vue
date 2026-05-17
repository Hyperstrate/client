<template lang="pug">
sidebar
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'
import Sidebar from './Sidebar.vue'

@Component({
  components: {
    Sidebar,
  },
})
export default class SidebarControl extends Vue {}
</script>
