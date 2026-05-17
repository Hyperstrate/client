import { APPS } from '@/features/core/container'
import { type AppName } from '@/features/core/model'
import { option } from '@/util/container'

export const APP_ANALYTICS: AppName = 'APP_ANALYTICS'

export default option(APPS, () => ({
  name: APP_ANALYTICS,
  label: 'Analytics',
  link: { to: { name: 'AppAnalytics' } },
  icon: 'bar-chart',
  order: 1,
  group: 'observe',
}))
