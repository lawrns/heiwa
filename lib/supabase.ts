// Supabase client configuration for Heiwa House booking system integration
// Connected to the existing wavecampdashboard Supabase instance

import { createClient } from '@supabase/supabase-js'

// Use the same Supabase instance as the wavecampdashboard
// This ensures booking data consistency between the website and admin dashboard
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pguipwhrxdzzrndbluxb.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWlwd2hyeGR6enJuZGJsdXhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NjU4ODUsImV4cCI6MjA3ODQ0MTg4NX0.9Kq4rka92XmoJj_BWu4eEYvbhaasljZX6yTp8FMof7o'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWlwd2hyeGR6enJuZGJsdXhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg2NTg4NSwiZXhwIjoyMDc4NDQxODg1fQ.Fe7nN1GEVbgAh0M55HML0ppDgMyyMsCeSk6ugd37TWA'

// Singleton pattern to prevent multiple client instances
// Use globalThis to ensure singleton across module reloads in Next.js
const globalForSupabase = globalThis as unknown as {
  supabaseInstance: ReturnType<typeof createClient> | undefined
  supabaseAdminInstance: ReturnType<typeof createClient> | undefined
}

// No-op storage implementation to prevent multiple GoTrueClient instances
const noOpStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
}

// Create Supabase client for public operations (booking system integration)
export const supabase = (() => {
  if (!globalForSupabase.supabaseInstance) {
    globalForSupabase.supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storage: noOpStorage, // Use no-op storage to prevent multiple instances
        storageKey: 'heiwa-supabase-auth-unique',
        flowType: 'pkce'
      },
      global: {
        headers: {
          'x-client-info': 'heiwa-house-website'
        }
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
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
        storage: noOpStorage, // Use no-op storage to prevent multiple instances
        storageKey: 'heiwa-supabase-admin-auth-unique',
        flowType: 'pkce'
      },
      global: {
        headers: {
          'x-client-info': 'heiwa-house-admin'
        }
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

