// Supabase client configuration for Heiwa House booking system integration
// Connected to the existing wavecampdashboard Supabase instance

import { createClient } from '@supabase/supabase-js'

// Use the same Supabase instance as the wavecampdashboard
// This ensures booking data consistency between the website and admin dashboard
// CRITICAL: Must use zejrhceuuujzgyukdwnb project (where the actual data is stored)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zejrhceuuujzgyukdwnb.supabase.co'
// Fallback to actual key if env var not available (for Netlify builds that haven't picked up env vars yet)
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplanJoY2V1dXVqemd5dWtkd25iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMDQ4MDksImV4cCI6MjA3MjY4MDgwOX0.yIqpTz-OTqcaL5h7GIzoBmRezoJD-MC2yPTpxvo-aNA'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplanJoY2V1dXVqemd5dWtkd25iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwNDgwOSwiZXhwIjoyMDcyNjgwODA5fQ.RbzOLzCaOAsgaMixdACMLdPvLZjU9MPfXn8Y90gsxcc'

// Validate that API keys are set (only check server-side for service role key)
if (typeof window === 'undefined') {
  // Server-side validation
  if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_ANON_KEY_HERE') {
    console.error('❌ ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set!')
    console.error('   Please get the API key from: https://supabase.com/dashboard/project/zejrhceuuujzgyukdwnb/settings/api')
    console.error('   Then update your .env.local file')
  }

  if (!supabaseServiceKey || supabaseServiceKey === 'YOUR_SERVICE_ROLE_KEY_HERE') {
    console.error('❌ ERROR: SUPABASE_SERVICE_ROLE_KEY is not set!')
    console.error('   Please get the service role key from: https://supabase.com/dashboard/project/zejrhceuuujzgyukdwnb/settings/api')
    console.error('   Then update your .env.local file')
  }
} else {
  // Client-side validation (only check anon key)
  if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_ANON_KEY_HERE') {
    console.error('❌ ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set!')
    console.error('   Please get the API key from: https://supabase.com/dashboard/project/zejrhceuuujzgyukdwnb/settings/api')
    console.error('   Then update your .env.local file')
  }
}

// Singleton pattern to prevent multiple client instances
// Use globalThis to ensure singleton across module reloads in Next.js
const globalForSupabase = globalThis as unknown as {
  supabaseInstance: ReturnType<typeof createClient> | undefined
  supabaseAdminInstance: ReturnType<typeof createClient> | undefined
}

// Create Supabase client for public operations (booking system integration)
export const supabase = (() => {
  if (!globalForSupabase.supabaseInstance) {
    globalForSupabase.supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Use a dedicated storage key to avoid GoTrue warnings when multiple clients exist
        storageKey: 'heiwa-public-auth',
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })
    if (typeof window === 'undefined') {
      console.log('🏄‍♂️ Heiwa House Website - Supabase connection initialized:', {
        url: supabaseUrl,
        hasKey: !!supabaseAnonKey,
        hasServiceKey: !!supabaseServiceKey,
        project: 'heiwa-booking-integration'
      })
    }
  }
  return globalForSupabase.supabaseInstance
})()

// Create Supabase client with service role for admin operations (CMS)
export const supabaseAdmin = (() => {
  if (!globalForSupabase.supabaseAdminInstance) {
    globalForSupabase.supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        // Separate storage key so admin client doesn't conflict with public client
        storageKey: 'heiwa-admin-auth',
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    })
  }
  return globalForSupabase.supabaseAdminInstance
})()

// Export individual services for easier access
export const db = supabase
export const auth = supabase.auth
export const storage = supabase.storage

// Admin services for CMS operations
export const dbAdmin = supabaseAdmin
export const storageAdmin = supabaseAdmin.storage

// Export default for convenience
export default supabase

// Booking-related types (mirroring wavecampdashboard schema)
export interface BookingInquiry {
  id?: string
  name: string
  email: string
  phone?: string
  checkIn: string
  checkOut: string
  roomType?: string
  guests: number
  message?: string
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt?: string
  updatedAt?: string
}

export interface RoomAvailability {
  roomId: string
  roomName: string
  available: boolean
  checkIn: string
  checkOut: string
  price?: number
}

export interface SurfCampBooking {
  id?: string
  participantName: string
  email: string
  phone?: string
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  startDate: string
  duration: number
  specialRequests?: string
  status: 'inquiry' | 'booked' | 'completed' | 'cancelled'
  createdAt?: string
}

