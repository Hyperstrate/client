import type { HyperstrateApi } from '@/__generated__/hyperstrate-api'
import { builder } from '@/util/container'
import { setupIdTokenSync } from '../store/id-token'
import { API_CLIENT_MAP, STORE, SUPABASE } from '.'
import { HYPERSTRATE_API } from './api/hyperstrate-api.builder'

export default builder(({ configure }) => {
  configure(async (get) => {
    const store = await get(STORE)
    const supabase = await get(SUPABASE)
    const api = (await get(API_CLIENT_MAP))[HYPERSTRATE_API].client as HyperstrateApi
    setupIdTokenSync(store, supabase, api)
  })
})
