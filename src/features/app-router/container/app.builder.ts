import { APPS } from '@/features/core/container'
import { type AppName } from '@/features/core/model'
import { option } from '@/util/container'

export const APP_ROUTER: AppName = 'APP_ROUTER'

export default option(APPS, () => {
  return {
    name: APP_ROUTER,
    label: 'Routers',
    link: {
      to: { name: 'AppRouter' },
    },
    icon: 'router',
    order: 2,
    group: 'configure',
  }
})
