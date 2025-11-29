// Supabase client configuration for Heiwa House booking system integration
// Connected to the existing wavecampdashboard Supabase instance
// SINGLETON PATTERN: Uses Symbol-keyed global to prevent multiple GoTrueClient instances

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Use the same Supabase instance as the wavecampdashboard
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pguipwhrxdzzrndbluxb.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Use Symbol keys to ensure uniqueness across module evaluations
const SUPABASE_PUBLIC_KEY = Symbol.for('heiwa.supabase.public')
const SUPABASE_ADMIN_KEY = Symbol.for('heiwa.supabase.admin')

// Type-safe global storage
type GlobalWithSupabase = typeof globalThis & {
  [SUPABASE_PUBLIC_KEY]?: SupabaseClient
  [SUPABASE_ADMIN_KEY]?: SupabaseClient
}

const globalStore = (typeof globalThis !== 'undefined' ? globalThis : global) as GlobalWithSupabase

// Lazy singleton getter for public client - only creates on first access
function getSupabaseClient(): SupabaseClient {
  if (!globalStore[SUPABASE_PUBLIC_KEY]) {
    globalStore[SUPABASE_PUBLIC_KEY] = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Use unique storage key to prevent conflicts
        storageKey: 'sb-heiwa-public-auth-token',
        persistSession: typeof window !== 'undefined',
        autoRefreshToken: typeof window !== 'undefined',
        detectSessionInUrl: false,
        // Prevent multiple auth state change listeners
        flowType: 'pkce'
      },
      global: {
        headers: {
          'x-client-info': 'heiwa-house-public'
        }
      }
    })
  }
  return globalStore[SUPABASE_PUBLIC_KEY]
}

// Lazy singleton getter for admin client - only creates on first access
function getSupabaseAdminClient(): SupabaseClient {
  if (!globalStore[SUPABASE_ADMIN_KEY]) {
    // Warn if service role key is missing (critical for production)
    if (!supabaseServiceKey && process.env.NODE_ENV === 'production') {
      console.error('⚠️ WARNING: SUPABASE_SERVICE_ROLE_KEY is not set in production!')
      console.error('⚠️ Admin operations may fail. Set SUPABASE_SERVICE_ROLE_KEY in Netlify environment variables.')
    }
    
    const adminKey = supabaseServiceKey || supabaseAnonKey
    
    if (!adminKey) {
      throw new Error(
        'Supabase admin client requires either SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY to be set'
      )
    }
    
    globalStore[SUPABASE_ADMIN_KEY] = createClient(supabaseUrl, adminKey, {
      auth: {
        // Use completely different storage key
        storageKey: 'sb-heiwa-admin-auth-token',
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          'x-client-info': 'heiwa-house-admin'
        }
      }
    })
  }
  return globalStore[SUPABASE_ADMIN_KEY]
}

// Export as getters to ensure lazy initialization
export const supabase = getSupabaseClient()
export const supabaseAdmin = getSupabaseAdminClient()

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

