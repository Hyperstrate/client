import { ROUTES } from '@/features/core/container/index'
import { option } from '@/util/container/index'
import { component } from '../component'
import { APP_AUTH } from './app.builder'

export default option(ROUTES, () => [
  {
    name: 'AppAuth',
    path: '/auth',
    component: component('views/app/AppView.vue'),
    meta: { app: APP_AUTH, key: () => 'AppAuth' },
  },
  {
    name: 'AppAuth/Login',
    path: '/login',
    component: component('views/login/LoginView.vue'),
    meta: { guest: true, key: () => 'Login' },
  },
  {
    name: 'AppAuth/AuthCallback',
    path: '/auth/callback',
    component: component('views/callback/CallbackView.vue'),
    meta: { guest: true, key: () => 'AuthCallback' },
  },
  {
    name: 'AppAuth/Setup',
    path: '/setup',
    component: component('views/setup/SetupView.vue'),
    meta: { guest: true, key: () => 'Setup' },
  },
  {
    name: 'AppAuth/VirtualKey',
    path: '/auth/virtual-keys/:id',
    component: component('views/virtual-key/VirtualKeyView.vue'),
    meta: { app: APP_AUTH, key: (r: { params: { id: string } }) => `VirtualKey/${r.params.id}` },
  },
  {
    name: 'AppAuth/Team',
    path: '/auth/teams/:id',
    component: component('views/team/TeamView.vue'),
    meta: { app: APP_AUTH, key: (r: { params: { id: string } }) => `Team/${r.params.id}` },
  },
])
