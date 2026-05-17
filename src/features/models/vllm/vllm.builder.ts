import { HyperstrateServerInternalModulesAiDomainProvider } from '@/__generated__/hyperstrate-api'
import { MODELS } from '@/features/core/container'
import { Size } from '@/features/ui/clickables/model'
import { option } from '@/util/container'
import component from './VLLMPanel.vue'
import lg from './lg.svg?component'
import md from './md.svg?component'
import sm from './sm.svg?component'

export default option(MODELS, async () => ({
  name: HyperstrateServerInternalModulesAiDomainProvider.ProviderVLLM,
  label: 'vLLM',
  shortLabel: 'vLLM',
  icons: { [Size.SM]: sm, [Size.MD]: md, [Size.LG]: lg },
  component,
}))
