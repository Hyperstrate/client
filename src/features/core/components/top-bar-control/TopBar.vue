<template lang="pug">
div(class="flex items-center justify-between w-full")
  span(class="text-sm font-semibold text-gray-900") {{ activeApp?.label }}
  div(class="flex items-center gap-3")
    div(v-if="idToken" class="flex items-center gap-3")
      ui-button(type="button" :size="Size.SM" :variant="Variant.Gray" @click="openPalette")
        span Search pages
        kbd(class="font-mono text-xs") ⌘K
      div(class="flex items-center gap-2")
        div(:class="['w-6 h-6 rounded-full shrink-0 overflow-hidden', isAdmin ? 'ring-2 ring-amber-400 ring-offset-1' : 'ring-1 ring-zinc-200']")
          img(v-if="idToken.user.avatar" :src="idToken.user.avatar" class="w-full h-full object-cover" :alt="displayName")
          div(
            v-else
            :class="['w-full h-full flex items-center justify-center text-xs font-bold', isAdmin ? 'bg-amber-50 text-amber-600' : 'bg-zinc-100 text-zinc-500']"
          ) {{ userInitials }}
        span(class="text-sm text-gray-700 max-w-[160px] truncate") {{ displayName }}
        ui-pill(v-if="isAdmin" :variant="Variant.Indigo") Admin
      ui-button(:size="Size.SM" :variant="Variant.Dark" @click="onLogout") Sign out
</template>

<script lang="ts">
import { Size, Variant } from '@/features/ui/clickables/model'
import { HyperstrateServerInternalModulesAuthDomainUserRole } from '@/__generated__/hyperstrate-api'
import { Mixins } from '@/util/mixin'
import { SupabaseClient } from '@supabase/supabase-js'
import { Component } from 'vue-facing-decorator'
import { SUPABASE } from '../../container'
import { RootState } from '../../store'
import { type IdToken } from '../../store/id-token'
import { OPEN_COMMAND_PALLETE_EVENT } from '../command-palette/CommandPalette.global.vue'
import AppsMixin from '../mixins/apps.mixin'

const UserRole = HyperstrateServerInternalModulesAuthDomainUserRole

@Component
export default class TopBar extends Mixins(AppsMixin) {
  @RootState
  public readonly idToken?: IdToken

  private Size = Size
  private Variant = Variant

  public get isAdmin(): boolean {
    return this.idToken?.user.role === UserRole.UserRoleAdmin
  }

  public get displayName(): string {
    return this.idToken?.user.name || this.idToken?.user.email || ''
  }

  public get userInitials(): string {
    const src = this.idToken?.user.name || this.idToken?.user.email || ''
    const parts = src.trim().split(/[\s@]+/)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return src.slice(0, 2).toUpperCase()
  }

  public openPalette(): void {
    window.dispatchEvent(new CustomEvent(OPEN_COMMAND_PALLETE_EVENT))
  }

  private get supabase(): SupabaseClient {
    return this.container(SUPABASE)
  }

  public async onLogout(): Promise<void> {
    await this.supabase.auth.signOut()
    void this.$router.push({ name: 'AppAuth/Login' })
  }
}
</script>
