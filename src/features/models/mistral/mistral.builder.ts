import { HyperstrateServerInternalModulesAiDomainProvider } from '@/__generated__/hyperstrate-api'
import { MODELS } from '@/features/core/container'
import { option } from '@/util/container'
import component from './MistralPanel.vue'
import lg from './lg.svg?component'
import md from './md.svg?component'
import sm from './sm.svg?component'
import { Size } from '@/features/ui/clickables/model'

export default option(MODELS, async () => ({
  name: HyperstrateServerInternalModulesAiDomainProvider.ProviderMistral,
  label: 'Mistral AI',
  shortLabel: 'Mistral',
  icons: { [Size.SM]: sm, [Size.MD]: md, [Size.LG]: lg },
  component,
}))
