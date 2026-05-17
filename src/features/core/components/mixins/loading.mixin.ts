import { Component, Vue } from 'vue-facing-decorator'

@Component
export class LoadingMixin extends Vue {
  protected loading!: boolean

  public setLoading(value: boolean): boolean {
    this.loading = value
    return this.loading
  }
}
