// src/lib/adminFetch.js
// Wrapper around fetch that automatically includes the Supabase auth token
// for admin API calls. Required because the browser Supabase client stores
// tokens in localStorage (not cookies), so middleware/API routes can't
// read them automatically.
import { supabase } from '@/lib/supabase'

export async function adminFetch(url, options = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}
