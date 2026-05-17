import { APPS } from '@/features/core/container'
import { type AppName } from '@/features/core/model'
import { option } from '@/util/container'

export const APP_PLAYGROUND: AppName = 'APP_PLAYGROUND'

export default option(APPS, () => ({
  name: APP_PLAYGROUND,
  label: 'Playground',
  link: { to: { name: 'AppPlayground' } },
  icon: 'flask',
  order: 2,
  group: 'test',
}))
