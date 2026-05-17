import registerComponents from '@/util/component-loader'
import { defineSetupVue3 } from '@histoire/plugin-vue'
import '../src/index.css'

export const setupVue3 = defineSetupVue3(async (ctx) => {
  registerComponents(ctx.app, import.meta.glob('../src/features/ui/**/*.global.vue', { eager: true }), 'ui-')
  registerComponents(ctx.app, import.meta.glob('../src/features/domain-ui/**/*.global.vue', { eager: true }), 'domain-ui-')
})
