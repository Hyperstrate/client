import { AGENTS } from '@/features/core/container'
import { type Agent } from '@/features/core/model'
import { Size } from '@/features/ui/clickables/model'
import { option } from '@/util/container'
import lg from './lg.svg?component'
import md from './md.svg?component'
import sm from './sm.svg?component'

export const definition: Agent = {
  name: 'jetbrains_ai',
  label: 'JetBrains AI',
  shortLabel: 'JetBrains',
  aliases: ['jetbrains', 'jetbrains-ai', 'intellij_ai', 'intellij-ai'],
  category: 'ide',
  icons: { [Size.SM]: sm, [Size.MD]: md, [Size.LG]: lg },
}

export default option(AGENTS, async () => definition)
