import { type HyperstrateApi } from '@/__generated__/hyperstrate-api'
import { builder } from '@/util/container'
import { flatten } from 'lodash-es'
import { APP, API_CLIENT_MAP, ROUTER, ROUTES, STORE, SUPABASE } from '.'
import { createRouter } from '../router'
import { setupAuthChecker } from '../router/auth-checker'
import { HYPERSTRATE_API } from './api/hyperstrate-api.builder'

export default builder(({ configure, provide }) => {
  provide(ROUTER, async (get) => {
    const router = createRouter(flatten(await get(ROUTES)))
    return router
  })

  configure(async (get) => {
    const router = await get(ROUTER)
    const api = (await get(API_CLIENT_MAP))[HYPERSTRATE_API].client as HyperstrateApi
    setupAuthChecker(router, await get(SUPABASE), await get(STORE), api)
    void (await get(APP)).use(router)
  })
})
