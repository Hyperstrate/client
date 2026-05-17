import { Variant } from '@/features/ui/clickables/model'

export type ToastMessage = {
  title?: string
  text: string
  type?: ToastMessageType
}

export enum ToastMessageType {
  DANGER = Variant.Red,
  ALERT = Variant.Orange,
  INFO = Variant.Blue,
  SUCCESS = Variant.Green,
}
