import { supabase } from './supabase'

// Server-side: Get all site settings as key-value object
export async function getSiteSettings(): Promise<Record<string, any>> {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')

    if (error || !data) {
      console.error('Error fetching site settings:', error)
      return {}
    }

    const settings: Record<string, any> = {}
    data.forEach(item => {
      // Parse JSON strings, keep other values as-is
      settings[item.key] = typeof item.value === 'string' ? item.value.replace(/^"|"$/g, '') : item.value
    })
    return settings
  } catch (error) {
    console.error('Error in getSiteSettings:', error)
    return {}
  }
}

// Server-side: Get a single setting by key
export async function getSiteSetting(key: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .single()

    if (error || !data) return null

    // Parse JSON strings
    const value = data.value
    return typeof value === 'string' ? value.replace(/^"|"$/g, '') : value
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error)
    return null
  }
}

// Server-side: Get settings by category
export async function getSiteSettingsByCategory(category: string): Promise<Record<string, any>> {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .eq('category', category)

    if (error || !data) return {}

    const settings: Record<string, any> = {}
    data.forEach(item => {
      settings[item.key] = typeof item.value === 'string' ? item.value.replace(/^"|"$/g, '') : item.value
    })
    return settings
  } catch (error) {
    console.error(`Error fetching settings for category ${category}:`, error)
    return {}
  }
}

// Default values for fallback
export const DEFAULT_SETTINGS = {
  contact_phone: '+351 912 193 785',
  contact_email: 'info@heiwahouse.com',
  booking_email: 'bookings@heiwahouse.com',
  whatsapp_number: '+351912193785',
  address: 'Santa Cruz, Portugal',
  instagram_url: 'https://www.instagram.com/heiwahouse_portugal',
  facebook_url: 'https://www.facebook.com/heiwahouse',
  map_latitude: 39.1853,
  map_longitude: -9.1657,
  logo_url: 'https://pguipwhrxdzzrndbluxb.supabase.co/storage/v1/object/public/cms-media/general/1763932909543_heiwalogo.webp'
}

// Helper to get setting with fallback
export function getSettingWithFallback(settings: Record<string, any>, key: keyof typeof DEFAULT_SETTINGS): any {
  return settings[key] || DEFAULT_SETTINGS[key]
}
