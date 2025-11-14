/**
 * Image URL utilities for handling Supabase storage URLs
 * Handles migration between old and new Supabase projects
 */

/**
 * Normalize image URLs to use the correct Supabase project
 * Converts old project URLs to new project URLs if needed
 */
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return '/images/rooms/room1.jpg'
  
  // If it's already a relative path, return as-is
  if (url.startsWith('/')) return url
  
  // If it's a full URL, check if it needs conversion
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Convert old Supabase project URLs to new project URLs
    // Old: zejrhceuuujzgyukdwnb.supabase.co
    // New: pguipwhrxdzzrndbluxb.supabase.co
    if (url.includes('zejrhceuuujzgyukdwnb.supabase.co')) {
      return url.replace('zejrhceuuujzgyukdwnb.supabase.co', 'pguipwhrxdzzrndbluxb.supabase.co')
    }
    return url
  }
  
  // Fallback for any other format
  return url
}

/**
 * Normalize an array of image URLs
 */
export function normalizeImageUrls(urls: (string | null | undefined)[] | null | undefined): string[] {
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return ['/images/rooms/room1.jpg']
  }
  
  const normalized = urls
    .map(normalizeImageUrl)
    .filter(url => url && url.trim() !== '')
  
  return normalized.length > 0 ? normalized : ['/images/rooms/room1.jpg']
}

/**
 * Get the first valid image URL from an array, with fallback
 */
export function getFirstImageUrl(
  images: (string | null | undefined)[] | null | undefined,
  fallback: string = '/images/rooms/room1.jpg'
): string {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return fallback
  }
  
  const firstImage = images.find(img => img && img.trim() !== '')
  return normalizeImageUrl(firstImage) || fallback
}

