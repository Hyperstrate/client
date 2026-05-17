import {
  HyperstrateServerInternalModulesAuthDomainUserRole,
  type HyperstrateServerInternalModulesAuthApplicationUserResponse as UserResponse,
} from '@/__generated__/hyperstrate-api'
import delay from '@/util/delay'
import { get } from 'lodash-es'
import { Store } from 'vuex'
import { type ToastMessage } from '../components/toaster/model'
import { type App } from '../model'
import { type Route } from '../router/model'
import { ID_TOKEN_KEY, type IdToken } from './id-token'
import { type AddToastMessageParams, TOAST_DEFAULT_DURATION } from './toast'

export type { UserResponse }

export type RootStore = Store<State>

export const SET_ID_TOKEN = 'SET_ID_TOKEN'
export const UNSET_ID_TOKEN = 'UNSET_ID_TOKEN'
export const SET_SETUP_REQUIRED = 'SET_SETUP_REQUIRED'

export const ADD_TOAST_MESSAGES = 'ADD_TOAST_MESSAGES'
export const REMOVE_TOAST_MESSAGES = 'REMOVE_TOAST_MESSAGES'

export class State {
  declare public route?: Route
  public idToken?: IdToken = (() => {
    try {
      const raw = localStorage.getItem(ID_TOKEN_KEY)
      if (!raw) return undefined
      const idToken = JSON.parse(raw) as IdToken
      // HMAC session tokens are 2 parts (encoded.sig). Old Supabase JWTs are 3 parts. Discard stale ones.
      if (!idToken.accessToken || idToken.accessToken.split('.').length !== 2) {
        localStorage.removeItem(ID_TOKEN_KEY)
        return undefined
      }
      return idToken
    } catch {
      return undefined
    }
  })()
  public toastMessages: ToastMessage[] = []
  // undefined = not yet checked; true/false = result cached from initial load.
  public setupRequired?: boolean = undefined
}

export async function createStore(apps: Record<string, App>): Promise<RootStore> {
  return new Store({
    state: () => new State(),
    getters: {
      appMap(): Record<string, App> {
        return apps
      },
      app(state): App | undefined {
        return apps[get(state, 'route.meta.app', '') as string]
      },
      isAuthenticated(state): boolean {
        return !!state.idToken
      },
      isAdmin(state): boolean {
        return state.idToken?.user?.role === HyperstrateServerInternalModulesAuthDomainUserRole.UserRoleAdmin
      },
    },
    mutations: {
      [SET_ID_TOKEN](state, idToken: IdToken) {
        state.idToken = idToken
        localStorage.setItem(ID_TOKEN_KEY, JSON.stringify(idToken))
      },
      [UNSET_ID_TOKEN](state) {
        state.idToken = undefined
        localStorage.removeItem(ID_TOKEN_KEY)
      },
      [SET_SETUP_REQUIRED](state, required: boolean) {
        state.setupRequired = required
      },
      [ADD_TOAST_MESSAGES](state, messages: ToastMessage[]) {
        state.toastMessages = state.toastMessages.concat(messages)
      },
      [REMOVE_TOAST_MESSAGES](state, messages: ToastMessage[]) {
        state.toastMessages = state.toastMessages.filter((message) => !messages.includes(message))
      },
    },
    actions: {
      async [ADD_TOAST_MESSAGES](context, params: AddToastMessageParams) {
        context.commit(ADD_TOAST_MESSAGES, params.messages)
        const addedToasts = context.state.toastMessages.slice(-params.messages.length)
        await delay(params.duration ?? TOAST_DEFAULT_DURATION)
        context.commit(REMOVE_TOAST_MESSAGES, addedToasts)
      },
    },
  })
}
