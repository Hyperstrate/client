import { builder } from '@/util/container'
import { createHead } from '@unhead/vue/client'
import { APP, META } from '.'

export default builder(({ configure, provide, option }) => {
  provide(META, async () => createHead())

  configure(async (get) => {
    void (await get(APP)).use(await get(META))
  })
})
