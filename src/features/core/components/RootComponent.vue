<template lang="pug">
layout-engine(default-layout="core-default-layout")
  router-view(:key="routerViewKey")
</template>

<script lang="ts">
import LayoutEngine from '@/features/ui/layout/layout-engine'
import { Component, Vue } from 'vue-facing-decorator'

@Component({
  components: { LayoutEngine },
})
export default class RootComponent extends Vue {
  public get routerViewKey(): string {
    const key = this.$route.matched[0]?.meta?.key

    return typeof key === 'function' ? key(this.$route) : this.$route.path
  }
}
</script>
