import { ROUTES } from '@/features/core/container/index'
import { option } from '@/util/container/index'
import { component } from '../component'
import { APP_MCP } from './app.builder'

export default option(ROUTES, () => [
  {
    name: 'AppMCP',
    path: '/mcp/servers',
    component: component('views/app/AppView.vue'),
    meta: { app: APP_MCP, key: () => 'AppMCP' },
  },
])
