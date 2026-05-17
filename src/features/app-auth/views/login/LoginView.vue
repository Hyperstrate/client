<template lang="pug">
div(class="min-h-screen flex items-center justify-center bg-gray-50")
  div(class="w-full max-w-sm")
    div(class="bg-white rounded-2xl border border-gray-200 shadow-xs p-8 flex flex-col gap-8")
      div(class="text-center")
        div(class="flex flex-col gap-1")
          h1(class="text-2xl font-bold text-gray-900") Hyperstrate
          p(class="text-sm text-gray-500") Sign in to continue

      div(class="flex flex-col gap-3")
        template(v-if="loadingProviders")
          div(class="flex justify-center py-4")
            span(class="text-sm text-gray-400") Loading...

        template(v-else-if="providers.length === 0")
          p(class="text-sm text-gray-500 text-center") No login providers configured.

        template(v-else)
          ui-clickable(
            v-for="provider in providers"
            :key="provider"
            :disabled="loading"
            class="flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            @click="onLogin(provider)"
          )
            ui-icon(v-if="provider === 'google'" icon="google" :size="20") 
            ui-icon(v-else-if="provider === 'github'" icon="github" :size="20")
            | Sign in with {{ providerLabel(provider) }}

        div(v-if="error" class="text-xs text-red-500 text-center") {{ error }}
</template>

<script lang="ts">
import { HyperstrateApi } from '@/__generated__/hyperstrate-api'
import ApiClientsMixin from '@/features/core/components/mixins/api-clients.mixin'
import { SUPABASE } from '@/features/core/container'
import { HYPERSTRATE_API } from '@/features/core/container/api/hyperstrate-api.builder'
import { AsyncData } from '@/util/async-data.decorator'
import { Mixins } from '@/util/mixin'
import { SupabaseClient } from '@supabase/supabase-js'
import { Component } from 'vue-facing-decorator'

@Component
export default class LoginView extends Mixins(ApiClientsMixin) {
  public loading = false
  public loadingProviders = true
  public error = ''
  public providers: string[] = []

  private get api(): HyperstrateApi {
    return this.apiClientFactory<HyperstrateApi>(HYPERSTRATE_API)
  }

  private get supabase(): SupabaseClient {
    return this.container(SUPABASE)
  }

  @AsyncData()
  public async asyncData(): Promise<AsyncData<LoginView>> {
    this.loadingProviders = true
    try {
      const { data } = await this.api.authSsoProvidersPublicGet()
      return { providers: (data as Array<{ type?: string }>).map((p) => p.type).filter((t): t is string => !!t) }
    } catch {
      this.error = 'Failed to load login options.'
      return {}
    } finally {
      this.loadingProviders = false
    }
  }

  public providerLabel(provider: string): string {
    const labels: Record<string, string> = { google: 'Google', github: 'GitHub' }
    return labels[provider] ?? provider.charAt(0).toUpperCase() + provider.slice(1)
  }

  public async onLogin(provider: string): Promise<void> {
    this.loading = true
    this.error = ''
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: provider as Parameters<typeof this.supabase.auth.signInWithOAuth>[0]['provider'],
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      this.error = error.message
      this.loading = false
    }
  }
}
</script>
