import { ROUTES } from '@/features/core/container/index'
import { option } from '@/util/container/index'
import { component } from '../component'
import { APP_FUNCTIONS } from './app.builder'

export default option(ROUTES, () => [
  {
    name: 'AppFunctions',
    path: '/functions',
    component: component('views/app/AppView.vue'),
    meta: { app: APP_FUNCTIONS, key: () => 'AppFunctions' },
  },
])
