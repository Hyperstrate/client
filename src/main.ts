import 'reflect-metadata'

import container from '@/bootstrap'
import { APP, CONTAINER } from './features/core/container'
import './index.css'

void (async () => {
  const get = await container()

  const app = get(APP)
  app.provide(CONTAINER, get)

  return app.mount('#app')
})().catch((err) => {
  console.error('Uncaught error during app start:', err?.stack || err)
})
