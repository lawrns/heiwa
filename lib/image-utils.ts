/**
 * Image URL utilities for handling Supabase storage URLs
 * Handles migration between old and new Supabase projects
 */

/**
 * Normalize image URLs to use the correct Supabase project
 * Converts old project URLs to new project URLs if needed
 */
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string' || url.trim() === '') return '/images/rooms/room1.jpg'
  
  // If it's already a relative path, return as-is
  if (url.startsWith('/')) return url
  
  // If it's a full URL, return as-is (no conversion needed - using old project)
  if (url.startsWith('http://') || url.startsWith('https://')) {
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
  
  try {
    const normalized = urls
      .map(url => {
        try {
          return normalizeImageUrl(url)
        } catch (e) {
          console.warn('Error normalizing image URL:', url, e)
          return null
        }
      })
      .filter((url): url is string => {
        return url !== null && url.trim() !== '' && url !== '/images/rooms/room1.jpg'
      })
    
    // If all were invalid, return fallback
    if (normalized.length === 0) {
      return ['/images/rooms/room1.jpg']
    }
    
    return normalized
  } catch (error) {
    console.error('Error in normalizeImageUrls:', error)
    return ['/images/rooms/room1.jpg']
  }
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

