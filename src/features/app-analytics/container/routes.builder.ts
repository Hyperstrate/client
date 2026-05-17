import { ROUTES } from '@/features/core/container/index'
import { option } from '@/util/container/index'
import { component } from '../component'
import { APP_ANALYTICS } from './app.builder'

export default option(ROUTES, () => [
  {
    name: 'AppAnalytics',
    path: '/analytics',
    component: component('views/app/AppView.vue'),
    meta: { app: APP_ANALYTICS, key: () => 'AppAnalytics' },
  },
  {
    name: 'AppAnalytics/AgentSession',
    path: '/analytics/agent-sessions/:sessionId',
    component: component('views/agent-session/AgentSessionView.vue'),
    meta: { app: APP_ANALYTICS, key: (route: { params: { sessionId: string } }) => `AppAnalytics?agent-session:${route.params.sessionId}` },
  },
])
