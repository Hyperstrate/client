export enum Size {
  XS = 'XS',
  SM = 'SM',
  MD = 'MD',
  LG = 'LG',
}

export enum Variant {
  Dark = 'dark',
  Gray = 'gray',
  Blue = 'blue',
  Green = 'green',
  Red = 'red',
  Orange = 'orange',
  Purple = 'purple',
  Indigo = 'indigo',
}

export type ClickableAttrs = {
  disabled?: boolean
  tag?: string
  to?: string
  stop?: string
  href?: string
  onClick?: unknown
}
