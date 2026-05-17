import registerComponents from '@/util/component-loader'
import { builder } from '@/util/container'
import { APP } from '.'

export default builder(({ configure }) => {
  configure(async (get) => {
    const app = await get(APP)

    registerComponents(app, import.meta.glob('../**/*.global.vue', { eager: true }), 'core-')
  })
})
