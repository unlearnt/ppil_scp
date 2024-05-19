import {createClient} from '@supabase/supabase-js'

let supabase = null;
if (process.env.SUPABASE_API_KEY && process.env.SUPABASE_API_URL) {
    supabase = createClient(process.env.SUPABASE_API_URL, process.env.SUPABASE_API_KEY)
}

export const getSupabaseClient = () => {
    return supabase;
}