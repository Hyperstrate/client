import { type AxiosError } from 'axios'
import axios from 'axios'

export const isApiError = (error: unknown): error is AxiosError => {
  return axios.isAxiosError(error)
}
