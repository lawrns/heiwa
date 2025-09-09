import { createClient } from '@supabase/supabase-js'

// Use fallback values to prevent deployment failures when environment variables are missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zejrhceuuujzgyukdwnb.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplanJoY2V1dXVqemd5dWtkd25iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMDQ4MDksImV4cCI6MjA3MjY4MDgwOX0.yIqpTz-OTqcaL5h7GIzoBmRezoJD-MC2yPTpxvo-aNA'

console.log('✅ Client Supabase connection initialized:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  project: 'heiwa'
})

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export for backward compatibility with Firebase imports
export const db = supabase
export const auth = supabase.auth
export const storage = supabase.storage

export default supabase
