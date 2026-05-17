import type { HyperstrateApi } from '@/__generated__/hyperstrate-api'
import type { HyperstrateServerInternalModulesAuthApplicationUserResponse as UserResponse } from '@/__generated__/hyperstrate-api'
import { type Session, type SupabaseClient } from '@supabase/supabase-js'
import { debounce } from 'lodash'
import { SET_ID_TOKEN, UNSET_ID_TOKEN, type RootStore } from './create-store'

export interface IdToken {
  accessToken: string
  session: Session
  user: UserResponse
}

export const ID_TOKEN_KEY = 'ID_TOKEN_KEY'

export function setupIdTokenSync(store: RootStore, supabase: SupabaseClient, api: HyperstrateApi): void {
  const unsetIdToken = (): void => {
    store.commit(UNSET_ID_TOKEN)
  }

  const setIdToken = debounce(async (): Promise<void> => {
    const { data: sessionData } = await supabase.auth.getSession()
    const session = sessionData.session

    if (!session || (session.expires_at ?? 0) * 1000 < Date.now()) {
      unsetIdToken()
      return
    }

    const existing = store.state.idToken
    if (existing && existing.session.access_token === session.access_token) {
      return
    }

    try {
      const { data } = await api.authOidcExchangePost({ body: { token: session.access_token } })
      store.commit(SET_ID_TOKEN, { accessToken: data.token, session, user: data.user })
    } catch {
      unsetIdToken()
    }
  }, 50)

  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
      void setIdToken()
    }

    if (event === 'SIGNED_OUT') {
      unsetIdToken()
    }
  })

  // On page load, validate any stored HMAC token against the server.
  // If the server rejects it (revoked, rotated keys, deleted user, etc.)
  // the token is cleared so the normal exchange flow takes over.
  async function validateStoredSession(): Promise<void> {
    const existing = store.state.idToken
    if (!existing) {
      void setIdToken()
      return
    }
    try {
      const { data: user } = await api.authMeGet()
      store.commit(SET_ID_TOKEN, { ...existing, user })
    } catch {
      unsetIdToken()
      void setIdToken()
    }
  }

  void validateStoredSession()
}
