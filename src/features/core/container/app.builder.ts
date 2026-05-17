import { builder } from '@/util/container'
import { createApp } from 'vue'
import { APP, ROOT_COMPONENT } from '.'

export default builder(({ provide }) => {
  provide(APP, async (get) => {
    const root = await get(ROOT_COMPONENT)

    return createApp({
      name: 'App',
      render() {
        return root
      },
    })
  })
})
