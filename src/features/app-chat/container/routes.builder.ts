import { ROUTES } from '@/features/core/container/index'
import { option } from '@/util/container/index'
import { component } from '../component'
import { APP_CHAT } from './app.builder'

export default option(ROUTES, () => [
  {
    name: 'AppChat',
    path: '/chat',
    component: component('views/app/AppView.vue'),
    meta: { app: APP_CHAT, key: () => 'AppChat' },
  },
])
