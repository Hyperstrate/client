import { HyperstrateApi } from '@/__generated__/hyperstrate-api'
import { option } from '@/util/container'
import { API_CLIENTS, HYPERSTRATE_API_CONFIGURATION } from '..'

export const HYPERSTRATE_API = 'HYPERSTRATE_API'

export default option(API_CLIENTS, async (get) => ({
  name: HYPERSTRATE_API,
  client: new HyperstrateApi(await get(HYPERSTRATE_API_CONFIGURATION)),
}))
