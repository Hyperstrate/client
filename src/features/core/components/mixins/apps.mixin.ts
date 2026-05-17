import { Mixins } from '@/util/mixin'
import { Component } from 'vue-facing-decorator'
import { APP_MAP } from '../../container'
import { type App } from '../../model'
import ContainerMixin from './container.mixin'

@Component
export default class AppsMixin extends Mixins(ContainerMixin) {
  protected get appMap(): Record<string, App> {
    return this.container(APP_MAP)
  }

  protected get activeApp(): App | undefined {
    return Object.values(this.appMap).find(({ name }) => name === this.$route.meta?.app)
  }

  protected isAppActive(app: App): boolean {
    return this.activeApp?.link?.to.name === app.link?.to.name
  }
}
