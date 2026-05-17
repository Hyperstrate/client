import { builder } from '@/util/container'
import { h } from 'vue'
import { ROOT_COMPONENT } from '.'
import RootComponent from '../components/RootComponent.vue'

export default builder(({ provide }) => {
  provide(ROOT_COMPONENT, async () => {
    return h(RootComponent)
  })
})
