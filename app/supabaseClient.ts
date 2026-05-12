import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cynqzzlermzoiilzwdac.supabase.co'
const supabaseAnonKey = 'sb_publishable_2i-AFjEahFdzaGhptaHvRQ_Jm8LnSkX'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)