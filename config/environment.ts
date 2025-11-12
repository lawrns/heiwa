// Environment configuration for Heiwa House website
// This file provides type-safe access to environment variables

export const env = {
  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pguipwhrxdzzrndbluxb.supabase.co',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWlwd2hyeGR6enJuZGJsdXhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NjU4ODUsImV4cCI6MjA3ODQ0MTg4NX0.9Kq4rka92XmoJj_BWu4eEYvbhaasljZX6yTp8FMof7o',
  },

  // Booking Widget Configuration
  booking: {
    widgetUrl: process.env.NEXT_PUBLIC_BOOKING_WIDGET_URL || 'http://localhost:3006/widget-test-wp',
    apiBaseUrl: process.env.NEXT_PUBLIC_BOOKING_API_BASE_URL || 'http://localhost:3006/api',
  },

  // Payload CMS Configuration (for future implementation)
  payload: {
    secret: process.env.PAYLOAD_SECRET,
    mongoUri: process.env.MONGODB_URI,
    publicServerUrl: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  },

  // Email Configuration (Resend)
  email: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.FROM_EMAIL || 'Heiwa House <noreply@heiwahouse.com>',
    adminEmail: process.env.ADMIN_EMAIL || 'info@heiwahouse.com',
    replyToEmail: process.env.REPLY_TO_EMAIL || 'info@heiwahouse.com',
  },

  // Application Configuration
  app: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
  },
} as const

// Validation
if (!env.supabase.url) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
}

if (!env.supabase.anonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
}

export default env

