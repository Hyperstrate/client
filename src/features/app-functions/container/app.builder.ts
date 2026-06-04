import { APPS } from '@/features/core/container'
import { type AppName } from '@/features/core/model'
import { option } from '@/util/container'

export const APP_FUNCTIONS: AppName = 'APP_FUNCTIONS'

export default option(APPS, () => {
  return {
    name: APP_FUNCTIONS,
    label: 'Functions',
    link: {
      to: { name: 'AppFunctions' },
    },
    icon: 'cogs',
    order: 5,
    group: 'configure',
  }
})
