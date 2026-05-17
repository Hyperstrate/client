import { builder } from '@/util/container'
import { APP, APP_MAP, STORE } from '.'
import { createStore } from '../store'

export default builder(({ configure, provide }) => {
  provide(STORE, async (get) => createStore(await get(APP_MAP)))

  configure(async (get) => {
    void (await get(APP)).use(await get(STORE))
  })
})
