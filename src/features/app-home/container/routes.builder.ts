import { ROUTES } from '@/features/core/container/index'
import { option } from '@/util/container/index'
import { component } from '../component'
import { APP_HOME } from './app.builder'

export default option(ROUTES, () => [
  {
    path: '/',
    redirect: () => ({ name: 'AppHome', hash: undefined }),
  },
  {
    name: 'AppHome',
    path: '/home',
    component: component('views/app/AppView.vue'),
    meta: { app: APP_HOME, key: () => 'AppHome' },
  },
])
