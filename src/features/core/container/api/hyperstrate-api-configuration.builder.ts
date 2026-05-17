import { Configuration } from '@/__generated__/hyperstrate-api'
import { HYPERSTRATE_API_URL } from '@/env'
import { builder } from '@/util/container'
import { HYPERSTRATE_API_CONFIGURATION, STORE } from '..'

export default builder(({ provide }) => {
  provide(HYPERSTRATE_API_CONFIGURATION, async (get) => {
    const store = await get(STORE)

    return new Configuration({
      basePath: HYPERSTRATE_API_URL,
      apiKey: () => {
        const token = store.state.idToken?.accessToken
        return token ? `Bearer ${token}` : ''
      },
    })
  })
})
