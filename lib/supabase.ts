// Supabase client configuration for Heiwa House booking system integration
// Connected to the existing wavecampdashboard Supabase instance

import { createClient } from '@supabase/supabase-js'

// Use the same Supabase instance as the wavecampdashboard
// This ensures booking data consistency between the website and admin dashboard
// CRITICAL: Must use pguipwhrxdzzrndbluxb project (where the actual data is stored)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pguipwhrxdzzrndbluxb.supabase.co'
// Fallback to actual key if env var not available (for Netlify builds that haven't picked up env vars yet)
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWlwd2hyeGR6enJuZGJsdXhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NjU4ODUsImV4cCI6MjA3ODQ0MTg4NX0.9Kq4rka92XmoJj_BWu4eEYvbhaasljZX6yTp8FMof7o'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWlwd2hyeGR6enJuZGJsdXhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg2NTg4NSwiZXhwIjoyMDc4NDQxODg1fQ.Fe7nN1GEVbgAh0M55HML0ppDgMyyMsCeSk6ugd37TWA'

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

// Singleton pattern to prevent multiple client instances
// Use globalThis to ensure singleton across module reloads in Next.js
// Separate singletons for server and client to avoid Next.js bundling issues
const getGlobalForSupabase = () => {
  if (typeof window === 'undefined') {
    // Server-side: use globalThis
    const key = '__HEIWA_SUPABASE_SERVER__'
    if (!(globalThis as any)[key]) {
      (globalThis as any)[key] = {
        supabaseInstance: undefined,
        supabaseAdminInstance: undefined,
        instanceCount: 0,
        adminInstanceCount: 0,
        creationStack: [] as string[]
      }
    }
    return (globalThis as any)[key]
  } else {
    // Client-side: use window object with a unique key to avoid conflicts
    const key = '__HEIWA_SUPABASE_CLIENT__'
    if (!(window as any)[key]) {
      (window as any)[key] = {
        supabaseInstance: undefined,
        supabaseAdminInstance: undefined,
        instanceCount: 0,
        adminInstanceCount: 0,
        creationStack: [] as string[]
      }
    }
    return (window as any)[key]
  }
}

const globalForSupabase = getGlobalForSupabase()

// Runtime detection for multiple GoTrueClient instances
function detectMultipleInstances(type: 'public' | 'admin') {
  if (typeof window === 'undefined') return // Only check client-side
  
  const count = type === 'public' 
    ? globalForSupabase.instanceCount 
    : globalForSupabase.adminInstanceCount
  
  if (count > 1) {
    const stack = new Error().stack || ''
    const creationStack = globalForSupabase.creationStack || []
    
    console.error(`❌ Multiple GoTrueClient instances detected for ${type} client!`)
    console.error(`   Instance count: ${count}`)
    console.error(`   This can cause undefined behavior.`)
    console.error(`   Stack trace:`, stack)
    
    if (creationStack.length > 0) {
      console.error(`   Previous creation locations:`, creationStack)
    }
    
    // Store stack trace for debugging
    if (!creationStack.includes(stack)) {
      creationStack.push(stack)
      if (creationStack.length > 5) {
        creationStack.shift() // Keep only last 5
      }
    }
  }
}

// Create Supabase client for public operations (booking system integration)
export const supabase = (() => {
  // Check if instance already exists
  if (globalForSupabase.supabaseInstance) {
    return globalForSupabase.supabaseInstance
  }
  
  // Track instance creation
  globalForSupabase.instanceCount++
  
  if (typeof window !== 'undefined') {
    const stack = new Error().stack || ''
    if (!globalForSupabase.creationStack) {
      globalForSupabase.creationStack = []
    }
    globalForSupabase.creationStack.push(stack.split('\n')[2]?.trim() || 'unknown')
  }
  
  // Create new instance with singleton protection
  globalForSupabase.supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
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
  
  // Detect multiple instances (client-side only)
  if (typeof window !== 'undefined') {
    detectMultipleInstances('public')
  }
  
  if (typeof window === 'undefined') {
    console.log('🏄‍♂️ Heiwa House Website - Supabase connection initialized:', {
      url: supabaseUrl,
      hasKey: !!supabaseAnonKey,
      hasServiceKey: !!supabaseServiceKey,
      project: 'heiwa-booking-integration'
    })
  }
  
  return globalForSupabase.supabaseInstance
})()

// Create Supabase client with service role for admin operations (CMS)
// Note: Service role key should only be used server-side, but we provide fallback for client-side compatibility
export const supabaseAdmin = (() => {
  // Check if instance already exists
  if (globalForSupabase.supabaseAdminInstance) {
    return globalForSupabase.supabaseAdminInstance
  }
  
  // Track instance creation
  globalForSupabase.adminInstanceCount++
  
  if (typeof window !== 'undefined') {
    const stack = new Error().stack || ''
    if (!globalForSupabase.creationStack) {
      globalForSupabase.creationStack = []
    }
    globalForSupabase.creationStack.push(stack.split('\n')[2]?.trim() || 'unknown')
  }
  
  // Use service role key if available, otherwise fall back to anon key for client-side
  const adminKey = supabaseServiceKey || supabaseAnonKey
  if (!adminKey) {
    throw new Error('Supabase admin key is required. Set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  
  // Create new instance with singleton protection
  globalForSupabase.supabaseAdminInstance = createClient(supabaseUrl, adminKey, {
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
  
  // Detect multiple instances (client-side only)
  if (typeof window !== 'undefined') {
    detectMultipleInstances('admin')
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

