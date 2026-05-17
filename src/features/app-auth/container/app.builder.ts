import { APPS } from '@/features/core/container'
import { type AppName } from '@/features/core/model'
import { option } from '@/util/container'

export const APP_AUTH: AppName = 'APP_AUTH'

export default option(APPS, () => {
  return {
    name: APP_AUTH,
    label: 'Auth',
    link: {
      to: { name: 'AppAuth' },
    },
    icon: 'lock',
    order: 1,
    group: 'manage',
  }
})
