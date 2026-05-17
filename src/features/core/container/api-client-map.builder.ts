import { provide } from '@/util/container'
import { groupBy, mapValues } from 'lodash'
import { API_CLIENT_MAP, API_CLIENTS } from '.'

export default provide(API_CLIENT_MAP, async (get) => {
  const apiClients = await get(API_CLIENTS)

  return mapValues(groupBy(apiClients, 'name'), (apiClients) => Object.assign({}, ...apiClients))
})
