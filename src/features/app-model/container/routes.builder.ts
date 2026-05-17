import { ROUTES } from '@/features/core/container/index'
import { option } from '@/util/container/index'
import { component } from '../component'
import { APP_MODEL } from './app.builder'

export default option(ROUTES, () => [
  {
    name: 'AppModel',
    path: '/model',
    component: component('views/app/AppView.vue'),
    meta: { app: APP_MODEL, key: () => 'AppModel' },
  },
])
