import { ROUTES } from '@/features/core/container/index'
import { option } from '@/util/container/index'
import { component } from '../component'
import { APP_PLAYGROUND } from './app.builder'
export default option(ROUTES, () => [
  {
    name: 'AppPlayground',
    path: '/playground',
    component: component('views/app/AppView.vue'),
    meta: { app: APP_PLAYGROUND, key: () => 'AppPlayground' },
  },
])
