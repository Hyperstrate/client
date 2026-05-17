import { AGENTS } from '@/features/core/container'
import { type Agent } from '@/features/core/model'
import { Size } from '@/features/ui/clickables/model'
import { option } from '@/util/container'
import lg from './lg.svg?component'
import md from './md.svg?component'
import sm from './sm.svg?component'

export const definition: Agent = {
  name: 'vscode',
  label: 'VS Code',
  shortLabel: 'VS Code',
  aliases: ['visual_studio_code', 'visual-studio-code', 'code'],
  category: 'editor',
  icons: { [Size.SM]: sm, [Size.MD]: md, [Size.LG]: lg },
}

export default option(AGENTS, async () => definition)
