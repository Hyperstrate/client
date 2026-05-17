import { type HyperstrateServerInternalSharedPaginationPaginatedMeta } from '@/__generated__/hyperstrate-api'
import { LoadingMixin } from '@/features/core/components/mixins/loading.mixin'
import { PaginationMixin } from '@/features/core/components/mixins/pagination.mixin'
import { Input, type Option } from '@/features/ui/inputs/model'
import { AsyncData } from '@/util/async-data.decorator'
import { debounceAsyncCancelable } from '@/util/debounce-cancelable'
import { Mixins } from '@/util/mixin'
import { BooleanProp } from '@/util/prop-decorators'
import { isArray, isEmpty, isEqual, isNil, isPlainObject, isString, size } from 'lodash'
import { Component, Model, Watch } from 'vue-facing-decorator'

export type SearchFnReturnType<T = unknown> = { items: T[]; meta: HyperstrateServerInternalSharedPaginationPaginatedMeta }
export type SearchFnArgs = { search?: string; page: number; perPage: number }
type IdOnlyValue = { id?: string }

@Component
export class InputComboboxSearch<T = unknown, K extends boolean = boolean> extends Mixins(PaginationMixin, LoadingMixin) implements Input {
  @Model()
  protected model?: K extends true ? Option<T>[] : Option<T>

  @BooleanProp(false)
  declare protected multiple: K

  public items: T[] = []
  public meta?: HyperstrateServerInternalSharedPaginationPaginatedMeta
  public search?: string
  protected debounceMs = 150
  protected lastSelectedLabel?: string
  protected isUserSearching = false

  private searchLoading = false
  private resolveLoading = false
  private itemsCache = new Map<string, Map<number, T[]>>()
  private metaCache = new Map<string, HyperstrateServerInternalSharedPaginationPaginatedMeta>()
  protected searchItems = new Set<string>()
  private resolvingIds = new Set<string>()
  private _debouncedSearch?: InputComboboxSearch['asyncData']

  private get debouncedSearch(): Exclude<InputComboboxSearch['_debouncedSearch'], undefined> {
    if (!this._debouncedSearch) {
      this._debouncedSearch = debounceAsyncCancelable(() => this.asyncData(), this.debounceMs)
    }
    return this._debouncedSearch
  }

  // Methods that should be overridden by subclasses
  protected async searchFn(args: SearchFnArgs): Promise<SearchFnReturnType<T>> {
    throw new Error('search must be implemented by subclass')
  }

  protected getOptionLabel(item: T): string {
    throw new Error('getOptionLabel must be implemented by subclass')
  }

  protected getOptionId(item: T): string {
    throw new Error('getOptionId must be implemented by subclass')
  }

  protected async getInitialValue(_id: string): Promise<T | undefined> {
    return undefined
  }

  public setLoading(value: boolean): boolean {
    this.searchLoading = value
    return this.syncLoading()
  }

  public get normalizedValue(): K extends true ? Option<T>[] : Option<T> {
    return this.model as K extends true ? Option<T>[] : Option<T>
  }

  public get empty(): boolean {
    return isNil(this.model) || (this.multiple ? isEmpty(this.model as Option<T>[]) : false)
  }

  public get pristine(): boolean {
    return this.model === undefined
  }

  public get options(): Option<T>[] {
    return this.items.map((value) => ({
      label: this.getOptionLabel(value),
      value,
    }))
  }

  // Server already filtered — skip Reka UI's client-side label filter.
  public get filterFn(): (options: Option<T>[]) => Option<T>[] {
    return (options) => options
  }

  public get hasMore(): boolean {
    return this.items.length < (this.meta?.total ?? 0)
  }

  protected mounted(): void {
    void this.resolveInitialValue()
  }

  private setResolveLoading(value: boolean): boolean {
    this.resolveLoading = value
    return this.syncLoading()
  }

  private syncLoading(): boolean {
    this.loading = this.searchLoading || this.resolveLoading
    return this.loading
  }

  private getCacheKey(search?: string): string {
    return isEmpty(search) ? '__EMPTY__' : search!
  }

  private getCachedData(args: { search?: string; page: number }): T[] | undefined {
    const cacheKey = this.getCacheKey(args.search)
    return this.itemsCache.get(cacheKey)?.get(args.page) || undefined
  }

  private setCachedData(args: { search?: string; page: number; data: T[] }): void {
    const cacheKey = this.getCacheKey(args.search)
    if (!this.itemsCache.has(cacheKey)) {
      this.itemsCache.set(cacheKey, new Map())
    }
    this.itemsCache.get(cacheKey)!.set(args.page, args.data)
  }

  private addUniqueItems(newItems: T[]): void {
    newItems.forEach((item) => {
      const itemId = this.getOptionId(item)
      if (!this.searchItems.has(itemId)) {
        this.searchItems.add(itemId)
        this.items.push(item)
      }
    })
  }

  protected loadCachedDataForCurrentSearch(): void {
    try {
      this.setLoading(true)

      const cacheKey = this.getCacheKey(this.search)
      const searchCache = this.itemsCache.get(cacheKey)

      if (searchCache) {
        const allCachedItems: T[] = []
        for (let page = 1; page <= this.page; page++) {
          const pageData = searchCache.get(page)
          if (pageData) allCachedItems.push(...pageData)
        }

        this.items = []
        this.searchItems.clear()
        this.addUniqueItems(allCachedItems)

        const cachedMeta = this.metaCache.get(cacheKey)
        if (cachedMeta) this.meta = cachedMeta
      }
    } finally {
      this.setLoading(false)
    }
  }

  @AsyncData()
  protected async asyncData(): Promise<void> {
    const cachedData = this.getCachedData({ search: this.search, page: this.page })

    if (cachedData !== undefined) {
      this.addUniqueItems(cachedData)
      const cachedMeta = this.metaCache.get(this.getCacheKey(this.search))
      if (cachedMeta) this.meta = cachedMeta
      return
    }

    try {
      this.setLoading(true)
      const { items, meta } = await this.searchFn({ search: this.search, page: this.page, perPage: this.perPage })

      this.setCachedData({ search: this.search, page: this.page, data: items })
      this.metaCache.set(this.getCacheKey(this.search), meta)

      this.addUniqueItems(items)
      this.meta = meta
    } finally {
      this.setLoading(false)
    }
  }

  public onSearch(value: string): void {
    this.isUserSearching = !isEmpty(value) && value !== this.lastSelectedLabel
    this.search = this.isUserSearching ? value : ''
  }

  public async onLoadMore(): Promise<void> {
    try {
      this.setLoading(true)
      if (!this.hasMore) return

      this.page += 1
      await this.asyncData()
    } finally {
      this.setLoading(false)
    }
  }

  public clear(): void {
    try {
      this.setLoading(true)
      this.items = []
      this.searchItems.clear()
      this.itemsCache.clear()
      this.metaCache.clear()
      this.meta = undefined
      this.search = undefined
      this.page = 1
    } finally {
      this.setLoading(false)
    }
  }

  @Watch('search')
  private onSearchChange(): void {
    this.page = 1
    this.items = []
    this.searchItems.clear()
    this.meta = undefined
    this.loadCachedDataForCurrentSearch()
    if (this.items.length === 0) {
      this.setLoading(true)
      void this.debouncedSearch()
    }
  }

  @Watch('model', { deep: true })
  private onModelChange(): void {
    void this.resolveInitialValue()

    if (this.multiple && isArray(this.model) && !isEmpty(this.model)) {
      this.lastSelectedLabel = this.model[0].label
    } else if (!this.multiple && this.model) {
      this.lastSelectedLabel = (this.model as Option<T>).label
    }

    // Reset user searching flag when model changes (selection made)
    this.isUserSearching = false

    // Reset search to show all options when dropdown opens again
    if (!this.multiple) {
      this.search = ''
    }
  }

  private getSelectedOptionId(value: unknown): string | undefined {
    if (isString(value)) return value || undefined
    const option = value as Option<T> | undefined
    const id = (option?.value as IdOnlyValue | undefined)?.id
    return id || undefined
  }

  private shouldResolveSelectedOption(value: unknown): boolean {
    if (isString(value)) return !isEmpty(value)
    const option = value as Option<T> | undefined
    const id = (option?.value as IdOnlyValue | undefined)?.id
    if (!id) return false
    return option?.label === id || (isPlainObject(option?.value) && size(option?.value as object) <= 1)
  }

  private async resolveInitialValue(): Promise<void> {
    if (this.empty) return

    if (this.multiple) {
      if (!isArray(this.model)) return
      const resolved = await Promise.all(this.model.map((option) => this.resolveOption(option)))
      if (!isEqual(resolved, this.model)) {
        this.model = resolved as K extends true ? Option<T>[] : Option<T>
      }
      return
    }

    const resolved = await this.resolveOption(this.model)
    if (!isEqual(resolved, this.model)) {
      this.model = resolved as K extends true ? Option<T>[] : Option<T>
    }
  }

  private async resolveOption(value: unknown): Promise<Option<T>> {
    const id = this.getSelectedOptionId(value)
    if (!id) return value as Option<T>
    if (!this.shouldResolveSelectedOption(value)) return value as Option<T>
    if (this.resolvingIds.has(id)) return this.toFallbackOption(value, id)

    try {
      this.resolvingIds.add(id)
      this.setResolveLoading(true)
      const item = await this.getInitialValue(id)
      if (item) return { value: item, label: this.getOptionLabel(item) }
    } catch {
      // Keep an id-only option usable when the backing record is missing.
    } finally {
      this.resolvingIds.delete(id)
      this.setResolveLoading(this.resolvingIds.size > 0)
    }
    return this.toFallbackOption(value, id)
  }

  private toFallbackOption(value: unknown, id: string): Option<T> {
    if (!isString(value)) return value as Option<T>
    return { value: { id } as T, label: id }
  }
}
