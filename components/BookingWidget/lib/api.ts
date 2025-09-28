/* Next.js API helper for the booking widget
 * Connects directly to our Next.js API endpoints
 */

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const url = `/api${path.startsWith('/') ? path : `/${path}`}`

  const headers = new Headers(init.headers || {})
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000) // 15 second timeout

  try {
    const response = await fetch(url, {
      ...init,
      headers,
      signal: controller.signal,
    })
    return response
  } finally {
    clearTimeout(timeout)
  }
}

export function getApiBase(): string {
  return '/api'
}
