import { SUPABASE_CLIENT } from '@/supabase'
import { builder } from '@/util/container'
import { SUPABASE } from '.'

export default builder(({ provide }) => {
  provide(SUPABASE, async () => SUPABASE_CLIENT)
})
