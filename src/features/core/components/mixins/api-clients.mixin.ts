import { Mixins } from '@/util/mixin'
import { API_CLIENT_MAP } from '../../container'
import { type ApiClient } from '../../model'
import ContainerMixin from './container.mixin'
import { Component } from 'vue-facing-decorator'

@Component
export default class ApiClientsMixin extends Mixins(ContainerMixin) {
  protected get apiClientMap(): Record<string, ApiClient> {
    return this.container(API_CLIENT_MAP)
  }

  protected apiClientFactory<T = unknown>(name: string): ApiClient<T>['client'] {
    return this.apiClientMap[name].client as ApiClient<T>['client']
  }
}
