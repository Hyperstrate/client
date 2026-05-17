import { APPS } from '@/features/core/container'
import { type AppName } from '@/features/core/model'
import { option } from '@/util/container'

export const APP_PROMPT: AppName = 'APP_PROMPT'

export default option(APPS, () => {
  return {
    name: APP_PROMPT,
    label: 'Prompts',
    link: {
      to: { name: 'AppPrompt' },
    },
    icon: 'chat-code',
    order: 3,
    group: 'configure',
  }
})
