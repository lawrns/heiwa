/**
 * Cache-busting utilities for faster deployments
 * Prevents browser and CDN caching during development
 */

export const cacheHeaders = {
  // No caching for API routes - instant updates
  noCache: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Last-Modified': new Date().toUTCString()
  },
  
  // Short-term caching for dynamic content
  shortCache: {
    'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
    'Last-Modified': new Date().toUTCString()
  },
  
  // Long-term caching for static assets
  longCache: {
    'Cache-Control': 'public, max-age=31536000, immutable'
  }
}

/**
 * Add cache-busting query parameter to URLs
 */
export function addCacheBuster(url: string, customTimestamp?: string): string {
  const timestamp = customTimestamp || Date.now().toString()
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}_cb=${timestamp}`
}

/**
 * Create a response with appropriate cache headers
 */
export function createCacheResponse(
  data: any, 
  cacheType: 'noCache' | 'shortCache' | 'longCache' = 'noCache',
  status: number = 200
) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...cacheHeaders[cacheType]
    }
  })
}

/**
 * Middleware to add cache-busting headers to API responses
 */
export function withCacheBusting(response: Response, cacheType: 'noCache' | 'shortCache' | 'longCache' = 'noCache'): Response {
  Object.entries(cacheHeaders[cacheType]).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

/**
 * Generate unique build identifier for cache invalidation
 */
export function getBuildId(): string {
  return process.env.BUILD_ID || Date.now().toString()
}

/**
 * Check if cache should be bypassed based on query parameters
 */
export function shouldBypassCache(request: Request): boolean {
  const url = new URL(request.url)
  return url.searchParams.has('_cb') || 
         url.searchParams.has('refresh') || 
         url.searchParams.has('no-cache')
}

/**
 * Add version parameter to static asset URLs
 */
export function versionedUrl(url: string, version?: string): string {
  const versionParam = version || getBuildId()
  return addCacheBuster(url, versionParam)
}
