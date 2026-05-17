import { createClient } from '@supabase/supabase-js'
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './env'

export const SUPABASE_CLIENT = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
