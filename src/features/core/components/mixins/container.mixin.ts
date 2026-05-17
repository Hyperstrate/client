import { type Container } from '@/util/container'
import { Component, Inject, Vue } from 'vue-facing-decorator'
import { CONTAINER } from '../../container'

@Component
export default class ContainerMixin extends Vue {
  @Inject({
    from: CONTAINER,
  })
  protected readonly container!: Container
}
