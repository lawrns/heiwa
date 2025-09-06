// Feature flags and configuration for Heiwa House Dashboard
export const config = {
  // Feature flags
  aiPricing: false,
  digitalWaivers: false,
  instantBooking: true,
  paymentProcessing: true,
  realTimeUpdates: true,
  calendarIntegration: false,
  emailNotifications: true,

  // App configuration
  appName: 'Heiwa House',
  appVersion: '1.0.0',

  // Supabase configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },



  // UI configuration
  ui: {
    defaultTheme: 'light',
    maxTableRows: 50,
    paginationSize: 10,
  },

  // Business configuration
  business: {
    currency: 'USD',
    timezone: 'America/Los_Angeles',
    maxGuests: 20,
  },
} as const;

// Helper functions for feature checks
export const isFeatureEnabled = (feature: keyof typeof config): boolean => {
  return config[feature] as boolean;
};

export const getConfigValue = <T>(key: keyof typeof config): T => {
  return config[key] as T;
};
