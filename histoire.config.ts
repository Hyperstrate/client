import { defineConfig } from 'histoire'
import { HstVue } from '@histoire/plugin-vue'
import type { Plugin } from 'vite'
import { tailwindTokens } from 'histoire/dist/node/builtin-plugins/tailwind-tokens'

// vue-facing-decorator's ESM build has a circular dependency:
//   index.js -> mixins.js -> index.js
// Vite's SSR transform captures `const Vue = import("./index").Vue` at module
// evaluation time, before index.js finishes — so Vue is undefined.
// We patch mixins.js to use a namespace import (`import * as`) which vite SSR
// transforms to lazy property access (`__vite_ssr_import_0__.Vue`) read at
// call time, after index.js has completed.
const fixVueFacingDecoratorCircularDep: Plugin = {
  name: 'fix-vfd-circular-dep',
  transform(code, id) {
    if (!id.includes('vue-facing-decorator') || !id.endsWith('mixins.js')) return
    return code
      .replace("import { Vue } from './index';", "import * as __vfd_index from './index';")
      .replace('class MixinsClass extends Vue {', 'class MixinsClass extends __vfd_index.Vue {')
  },
}

export default defineConfig({
  viteIgnorePlugins: ['vite-plugin-vue-devtools', 'vite-plugin-inspect'],
  plugins: [HstVue(), tailwindTokens({ configFile: '' })],
  setupFile: './histoire/setup.ts',
  vite: {
    plugins: [fixVueFacingDecoratorCircularDep],
    optimizeDeps: {
      // Tell Vite to scan all story/component/setup files so it auto-discovers
      // every dependency and pre-bundles them. Without this, histoire's vite
      // server only scans its own entry points and misses app-level deps.
      entries: ['./histoire/setup.ts', './src/**/*.story.vue', './src/**/*.global.vue', './src/**/*.ts'],
      // Explicitly include CJS-only packages (no ESM build) and packages whose
      // ESM build imports CJS sub-modules — Vite won't auto-bundle these correctly
      // without a nudge, and serving them raw causes ERR_INSUFFICIENT_RESOURCES
      // from too many individual module requests.
      include: ['validator', 'class-validator', 'class-transformer', 'lodash', 'common-tags'],
    },
  },
})
