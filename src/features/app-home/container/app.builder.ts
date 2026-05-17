import { APPS } from '@/features/core/container'
import { type AppName } from '@/features/core/model'
import { option } from '@/util/container'

export const APP_HOME: AppName = 'APP_HOME'

export default option(APPS, () => {
  return {
    name: APP_HOME,
    label: 'Home',
    link: {
      to: { name: 'AppHome' },
    },
    icon: 'home',
    order: 0,
    group: '',
  }
})
