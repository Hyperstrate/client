import type { State } from '@/features/core/store/create-store'
import type { Router, RouteLocationNormalizedLoaded } from 'vue-router'
import { type Store } from 'vuex'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: Store<State>
    $router: Router
    $route: RouteLocationNormalizedLoaded
  }
}
