/* eslint-disable @typescript-eslint/no-misused-promises */
/**
 * Global asyncData plugin.
 *
 * Installs a Vue mixin that automatically calls `asyncData()` in the `created`
 * lifecycle hook for every component that defines the method. If the method
 * returns an object, each key is written onto `this.$data`, making the initial
 * data load declarative — no `mounted()` boilerplate needed for the first fetch.
 *
 * Lifecycle:
 *   created: this plugin calls asyncData() once, populating initial state
 *   mounted: call asyncData() again only when you need to re-fetch
 *              (e.g. after a route param changes or when triggered by a @Watch)
 *
 * Works together with the @AsyncData() method decorator
 * (src/util/async-data.decorator.ts), which applies the same return-value
 * assignment when asyncData() is called explicitly (pagination, refresh, etc.).
 *
 * Errors thrown by asyncData() are caught here and logged to the console so
 * that a single failing component does not crash the entire tree.
 */
import { APP } from '@/features/core/container'
import { configure } from '@/util/container'
import { isFunction } from '@/util/lang'
import { isObject } from 'lodash-es'

export default configure(async (get) => {
  const app = await get(APP)

  app.use({
    install(Vue) {
      Vue.mixin({
        async created() {
          const asyncData = this['asyncData']
          if (isFunction(asyncData)) {
            try {
              const data = await asyncData()
              if (isObject(data)) {
                for (const [key, value] of Object.entries(data)) {
                  this.$data[key] = value
                }
              }
            } catch (error) {
              console.error(error)
            }
          }
        },
      })
    },
  })
})
