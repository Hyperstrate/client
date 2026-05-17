import { Component, Vue } from 'vue-facing-decorator'

@Component
export class PaginationMixin extends Vue {
  protected pageSize!: number

  protected page = 1

  protected get total(): number {
    return 0
  }

  protected get pages(): number {
    return Math.ceil(this.total / this.perPage)
  }

  protected get perPage(): number {
    return this.pageSize
  }
}
