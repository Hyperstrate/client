import { APPS } from '@/features/core/container'
import { type AppName } from '@/features/core/model'
import { option } from '@/util/container'

export const APP_MCP: AppName = 'APP_MCP'

export default option(APPS, () => {
  return {
    name: APP_MCP,
    label: 'MCP Servers',
    link: {
      to: { name: 'AppMCP' },
    },
    icon: 'puzzle-piece',
    order: 4,
    group: 'configure',
  }
})
