import vue from '@vitejs/plugin-vue'
import colors from 'picocolors'
import { fileURLToPath } from 'url'
import { defineConfig, type PluginOption } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import svgLoader from 'vite-svg-loader'
import vuePugPlugin from 'vue-pug-plugin'
import tailwindcss from '@tailwindcss/vite'

const hotReload: () => PluginOption = () => ({
  name: 'hot-reload',
  handleHotUpdate({ server, file }) {
    console.log(
      `${colors.gray(new Date().toUTCString())} ${colors.cyan(colors.bold('[vite]'))} ${colors.gray('(client)')} ${colors.green('hmr update')} ${file}`,
    )
    server.ws.send({ type: 'full-reload' })
    return []
  },
})

export default defineConfig({
  base: '/',
  server: { port: 8080 },
  plugins: [
    vue({
      template: {
        preprocessOptions: {
          plugins: [vuePugPlugin],
        },
      },
    }),
    vueDevTools(),
    svgLoader(),
    hotReload(),
    // WIP: global components types
    // Components({
    //   globs: ['./**/*.global.vue'],
    //   dts: true,
    // }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/vue-facing-decorator')) {
            return 'vue-facing-decorator'
          }
        },
      },
    },
  },
})
