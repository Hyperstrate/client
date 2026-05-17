import { AGENTS } from '@/features/core/container'
import { type Agent } from '@/features/core/model'
import { Size } from '@/features/ui/clickables/model'
import { option } from '@/util/container'
import lg from './lg.svg?component'
import md from './md.svg?component'
import sm from './sm.svg?component'

export const definition: Agent = {
  name: 'void',
  label: 'Void',
  shortLabel: 'Void',
  aliases: ['void_editor', 'void-editor', 'void_ai', 'void-ai'],
  category: 'editor',
  icons: { [Size.SM]: sm, [Size.MD]: md, [Size.LG]: lg },
}

export default option(AGENTS, async () => definition)
