/* eslint-disable complexity */
import type { HyperstrateApi } from '@/__generated__/hyperstrate-api'
import { type SupabaseClient } from '@supabase/supabase-js'
import type { Router } from 'vue-router'
import type { RootStore } from '../store/create-store'
import { SET_SETUP_REQUIRED } from '../store/create-store'

async function resolveSetupRequired(api: HyperstrateApi, store: RootStore): Promise<boolean> {
  // Already checked this session — use the cached value.
  if (store.state.setupRequired !== undefined) return store.state.setupRequired

  try {
    const { data } = await api.authSetupStatusGet()
    const required = data.required === true
    store.commit(SET_SETUP_REQUIRED, required)
    return required
  } catch {
    store.commit(SET_SETUP_REQUIRED, false)
    return false
  }
}

export function setupAuthChecker(router: Router, supabase: SupabaseClient, store: RootStore, api: HyperstrateApi): void {
  router.beforeEach(async (to, _from, next) => {
    if (to.name === 'NotFound') return next()

    // ── Setup gate ────────────────────────────────────────────────────────────
    if (await resolveSetupRequired(api, store)) {
      // Login and callback must stay open so the user can authenticate first.
      if (to.name === 'AppAuth/Login' || to.name === 'AppAuth/AuthCallback') return next()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      // Require a valid session before the setup page is accessible.
      if (!session) return next({ name: 'AppAuth/Login' })
      if (to.name === 'AppAuth/Setup') return next()
      return next({ name: 'AppAuth/Setup' })
    }

    // ── Normal auth gate ──────────────────────────────────────────────────────
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const isGuestRoute = to.meta?.guest === true

    if (!isGuestRoute && session && (session.expires_at ?? 0) * 1000 < Date.now()) {
      return next({ name: 'AppAuth/Login' })
    }
    if (!isGuestRoute && !session) {
      return next({ name: 'AppAuth/Login' })
    }
    if (!isGuestRoute && session && !store.state.idToken) {
      return next({ name: 'AppAuth/AuthCallback', query: { redirect: to.fullPath } })
    }
    if (!isGuestRoute && store.state.idToken && !(store.state.idToken.user as unknown as Record<string, unknown>)['orgId']) {
      return next({ name: 'AppAuth/Setup' })
    }
    if (isGuestRoute && session && store.state.idToken) {
      return next({ name: 'AppHome' })
    }

    return next()
  })
}
