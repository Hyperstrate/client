import { createRouter as createRouterFn, createWebHistory, type Router } from 'vue-router'
import NotFoundView from '../views/NotFoundView.vue'
import { type Route } from './model'

export function createRouter(routes: Route[]): Router {
  return createRouterFn({
    history: createWebHistory(),
    routes: [
      ...routes,
      {
        path: '/:catchAll(.*)',
        component: NotFoundView,
        name: 'NotFound',
        meta: { guest: true },
      },
    ],
  })
}
