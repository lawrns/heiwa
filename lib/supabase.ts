// Supabase client configuration for Heiwa House booking system integration
// Connected to the existing wavecampdashboard Supabase instance
// SINGLETON PATTERN: Uses global variable to prevent multiple GoTrueClient instances

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Use the same Supabase instance as the wavecampdashboard
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pguipwhrxdzzrndbluxb.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Declare global types for TypeScript
declare global {
  // eslint-disable-next-line no-var
  var _heiwaSupabase: SupabaseClient | undefined
  // eslint-disable-next-line no-var
  var _heiwaSupabaseAdmin: SupabaseClient | undefined
}

// Singleton factory for public client
function getSupabaseClient(): SupabaseClient {
  // In browser, check window
  if (typeof window !== 'undefined') {
    if (!(window as any)._heiwaSupabase) {
      (window as any)._heiwaSupabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          storageKey: 'heiwa-supabase-auth',
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false
        }
      })
    }
    return (window as any)._heiwaSupabase
  }
  
  // Server-side: use global
  if (!global._heiwaSupabase) {
    global._heiwaSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storageKey: 'heiwa-supabase-auth',
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })
  }
  return global._heiwaSupabase
}

// Singleton factory for admin client
function getSupabaseAdminClient(): SupabaseClient {
  const adminKey = supabaseServiceKey || supabaseAnonKey
  
  // In browser, check window
  if (typeof window !== 'undefined') {
    if (!(window as any)._heiwaSupabaseAdmin) {
      (window as any)._heiwaSupabaseAdmin = createClient(supabaseUrl, adminKey, {
        auth: {
          storageKey: 'heiwa-supabase-admin-auth',
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      })
    }
    return (window as any)._heiwaSupabaseAdmin
  }
  
  // Server-side: use global
  if (!global._heiwaSupabaseAdmin) {
    global._heiwaSupabaseAdmin = createClient(supabaseUrl, adminKey, {
      auth: {
        storageKey: 'heiwa-supabase-admin-auth',
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })
  }
  return global._heiwaSupabaseAdmin
}

// Export singleton instances
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

