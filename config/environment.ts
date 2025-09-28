// Environment configuration for Heiwa House website
// This file provides type-safe access to environment variables

export const env = {
  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zejrhceuuujzgyukdwnb.supabase.co',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplanJoY2V1dXVqemd5dWtkd25iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMDQ4MDksImV4cCI6MjA3MjY4MDgwOX0.yIqpTz-OTqcaL5h7GIzoBmRezoJD-MC2yPTpxvo-aNA',
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
