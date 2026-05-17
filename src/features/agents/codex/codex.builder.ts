import { AGENTS } from '@/features/core/container'
import { type Agent } from '@/features/core/model'
import { Size } from '@/features/ui/clickables/model'
import { option } from '@/util/container'
import lg from './lg.svg?component'
import md from './md.svg?component'
import sm from './sm.svg?component'

export const definition: Agent = {
  name: 'codex',
  label: 'Codex',
  shortLabel: 'Codex',
  aliases: ['openai_codex', 'openai-codex', 'codex_cli', 'codex-cli'],
  category: 'agent',
  icons: { [Size.SM]: sm, [Size.MD]: md, [Size.LG]: lg },
}

export default option(AGENTS, async () => definition)
