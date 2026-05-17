import { AGENTS } from '@/features/core/container'
import { type Agent } from '@/features/core/model'
import { Size } from '@/features/ui/clickables/model'
import { option } from '@/util/container'
import lg from './lg.svg?component'
import md from './md.svg?component'
import sm from './sm.svg?component'

export const definition: Agent = {
  name: 'github_copilot',
  label: 'GitHub Copilot',
  shortLabel: 'Copilot',
  aliases: ['copilot', 'github-copilot', 'githubcopilot'],
  category: 'ide',
  icons: { [Size.SM]: sm, [Size.MD]: md, [Size.LG]: lg },
}

export default option(AGENTS, async () => definition)
