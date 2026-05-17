export type Accessor<T = unknown, V = unknown> = (row: T) => V

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface Column<T = unknown> {
  /**
   * Name of the column slot
   */
  name: string
  /**
   * Accessor function to get this columns value or a property path compatible with lodash's get
   */
  accessor?: string | Accessor<T>
  label?: string
  /**
   * If this column is sortable, if the sort key is different from the name a
   * string can be passed to be used as the sort key
   */
  sortable?: boolean | string
  hideable?: boolean
  align?: 'left' | 'center' | 'right'
  alignColumn?: 'left' | 'center' | 'right'
  verticalAlign?: 'top' | 'middle' | 'bottom'
  width?: string | number
  order?: number
  key?: (value: T) => string | number
}

export interface SortKey {
  key: string
  direction: Order
}

export interface NormalizedColumn extends Required<Omit<Column, 'accessor' | 'field' | 'sortable' | 'width' | 'key'>> {
  accessor: Accessor
  sortable?: string
  width?: string
  index: number
  key?: (value: unknown) => string | number
}

export type IsRowExpanded<T = unknown> = (row: T, index: number) => boolean

export type RowClickedEvent<T = unknown> = { row: T; index: number }
