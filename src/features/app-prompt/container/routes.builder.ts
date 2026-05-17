import { ROUTES } from '@/features/core/container/index'
import { option } from '@/util/container/index'
import { component } from '../component'
import { APP_PROMPT } from './app.builder'

export default option(ROUTES, () => [
  {
    name: 'AppPrompt',
    path: '/prompts',
    component: component('views/app/AppView.vue'),
    meta: { app: APP_PROMPT, key: () => 'AppPrompt' },
  },
])
