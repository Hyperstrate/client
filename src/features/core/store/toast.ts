import { type ToastMessage } from '../components/toaster/model'

export interface AddToastMessageParams {
  messages: ToastMessage[]
  duration?: number
}

export const TOAST_DEFAULT_DURATION = 5000
