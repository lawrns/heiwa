// Supabase client configuration for Heiwa House booking system integration
// Connected to the existing wavecampdashboard Supabase instance

import { createClient } from '@supabase/supabase-js'

// Use the same Supabase instance as the wavecampdashboard
// This ensures booking data consistency between the website and admin dashboard
// CRITICAL: Must use pguipwhrxdzzrndbluxb project (where the actual data is stored)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pguipwhrxdzzrndbluxb.supabase.co'
// SECURITY: API keys MUST be set via environment variables
// The anon key is safe to expose client-side (it's designed for that)
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
// SECURITY: Service role key should NEVER be hardcoded - it bypasses RLS
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Validate Supabase URL format
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  console.error('❌ ERROR: Invalid Supabase URL format:', supabaseUrl)
  console.error('   Expected format: https://[project-ref].supabase.co')
}

// Validate that API keys are set (only check server-side for service role key)
if (typeof window === 'undefined') {
  // Server-side validation
  if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_ANON_KEY_HERE') {
    console.error('❌ ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set!')
    console.error('   Please get the API key from: https://supabase.com/dashboard/project/pguipwhrxdzzrndbluxb/settings/api')
    console.error('   Then update your .env.local file or production environment variables')
  }

  if (!supabaseServiceKey || supabaseServiceKey === 'YOUR_SERVICE_ROLE_KEY_HERE') {
    console.error('❌ ERROR: SUPABASE_SERVICE_ROLE_KEY is not set!')
    console.error('   Please get the service role key from: https://supabase.com/dashboard/project/pguipwhrxdzzrndbluxb/settings/api')
    console.error('   Then update your .env.local file or production environment variables')
  }
  
  // Run diagnostics in development or when explicitly enabled
  if (process.env.NODE_ENV === 'development' || process.env.ENABLE_SUPABASE_DIAGNOSTICS === 'true') {
    import('./supabase-diagnostics').then(({ logSupabaseDiagnostics }) => {
      logSupabaseDiagnostics().catch(console.error)
    })
  }
} else {
  // Client-side validation (only check anon key)
  if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_ANON_KEY_HERE') {
    console.error('❌ ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set!')
    console.error('   Please get the API key from: https://supabase.com/dashboard/project/pguipwhrxdzzrndbluxb/settings/api')
    console.error('   Then update your .env.local file or production environment variables')
  }
}

// Global singleton storage - use a single global object
declare global {
  var __HEIWA_SUPABASE_SINGLETON__: {
    supabaseInstance?: any
    supabaseAdminInstance?: any
    initialized: boolean
  } | undefined
}

// Initialize global singleton if it doesn't exist
if (typeof globalThis !== 'undefined' && !globalThis.__HEIWA_SUPABASE_SINGLETON__) {
  globalThis.__HEIWA_SUPABASE_SINGLETON__ = {
    supabaseInstance: undefined,
    supabaseAdminInstance: undefined,
    initialized: false
  }
}

const globalSingleton = globalThis.__HEIWA_SUPABASE_SINGLETON__


// Create Supabase client for public operations (booking system integration)
export const supabase = (() => {
  // Return existing instance if already created
  if (globalSingleton.supabaseInstance) {
    return globalSingleton.supabaseInstance
  }
  
  // Create new instance only once
  globalSingleton.supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Use a dedicated storage key to avoid GoTrue warnings when multiple clients exist
      storageKey: 'heiwa-public-auth',
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    // Disable realtime subscriptions to reduce overhead
    realtime: {
      params: {
        eventsPerSecond: 2
      }
    }
  })
  
  globalSingleton.initialized = true
  
  if (typeof window === 'undefined') {
    console.log('🏄‍♂️ Heiwa House Website - Supabase connection initialized:', {
      url: supabaseUrl,
      hasKey: !!supabaseAnonKey,
      hasServiceKey: !!supabaseServiceKey,
      project: 'heiwa-booking-integration'
    })
  }
  
  return globalSingleton.supabaseInstance
})()

// Create Supabase client with service role for admin operations (CMS)
// Note: Service role key should only be used server-side, but we provide fallback for client-side compatibility
export const supabaseAdmin = (() => {
  // Return existing instance if already created
  if (globalSingleton.supabaseAdminInstance) {
    return globalSingleton.supabaseAdminInstance
  }
  
  // Use service role key if available, otherwise fall back to anon key for client-side
  const adminKey = supabaseServiceKey || supabaseAnonKey
  if (!adminKey) {
    throw new Error('Supabase admin key is required. Set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  
  // Create new instance only once
  globalSingleton.supabaseAdminInstance = createClient(supabaseUrl, adminKey, {
    auth: {
      // Separate storage key so admin client doesn't conflict with public client
      storageKey: 'heiwa-admin-auth',
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    // Disable realtime subscriptions to reduce overhead
    realtime: {
      params: {
        eventsPerSecond: 2
      }
    }
  })
  
  return globalSingleton.supabaseAdminInstance
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

