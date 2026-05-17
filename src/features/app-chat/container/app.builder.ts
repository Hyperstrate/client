import { APPS } from '@/features/core/container'
import { type AppName } from '@/features/core/model'
import { option } from '@/util/container'

export const APP_CHAT: AppName = 'APP_CHAT'

export default option(APPS, () => {
  return {
    name: APP_CHAT,
    label: 'Chat',
    link: {
      to: { name: 'AppChat' },
    },
    icon: 'chats',
    order: 1,
    group: 'test',
  }
})
