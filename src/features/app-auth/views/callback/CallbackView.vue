<template lang="pug">
div(class="min-h-screen flex items-center justify-center bg-gray-50")
  p(class="text-sm text-gray-400") Signing you in…
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator'

@Component
export default class CallbackView extends Vue {
  private timeout?: ReturnType<typeof setTimeout> = undefined

  public created(): void {
    const redirect = (this.$route.query.redirect as string | undefined) ?? '/'

    this.$watch(
      () => this.$store.state.idToken,
      (token: unknown) => {
        if (token) void this.$router.replace(redirect)
      },
      { immediate: true },
    )

    this.timeout = setTimeout(() => void this.$router.replace({ name: 'Login' }), 10_000)
  }

  public unmounted(): void {
    if (this.timeout !== null) clearTimeout(this.timeout)
  }
}
</script>
