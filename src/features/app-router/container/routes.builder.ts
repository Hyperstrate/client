import { ROUTES } from '@/features/core/container/index'
import { option } from '@/util/container/index'
import { component } from '../component'
import { APP_ROUTER } from './app.builder'

export default option(ROUTES, () => [
  {
    name: 'AppRouter',
    path: '/router',
    component: component('views/app/AppView.vue'),
    meta: { app: APP_ROUTER, key: () => 'AppRouter' },
  },
  {
    name: 'AppRouter/Router',
    path: '/router/:id',
    component: component('views/router/RouterView.vue'),
    meta: { app: APP_ROUTER, key: (route: { params: { id: string } }) => `AppRouter?${route.params.id}` },
  },
])
