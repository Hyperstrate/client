import { APPS } from '@/features/core/container'
import { type AppName } from '@/features/core/model'
import { option } from '@/util/container'

export const APP_MODEL: AppName = 'APP_MODEL'

export default option(APPS, () => {
  return {
    name: APP_MODEL,
    label: 'Models',
    link: {
      to: { name: 'AppModel' },
    },
    icon: 'ai',
    order: 1,
    group: 'configure',
  }
})
