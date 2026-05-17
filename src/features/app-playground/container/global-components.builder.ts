import { APP } from '@/features/core/container'
import { registerAsyncComponents } from '@/util/component-loader'
import { configure } from '@/util/container'
import { component } from '../component'

export default configure(async (get) => {
  const app = await get(APP)

  registerAsyncComponents(app, import.meta.glob('../**/*.global.vue'), component, 'app-playground-')
})
