/**
 * Fetch Utility with Timeout and Retry Logic
 * Provides reliable HTTP requests with automatic timeout and retry
 */

import { logger } from './logger'

export interface FetchOptions extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
  skipRetryFor?: number[]
}

export interface FetchResult<T = any> {
  success: boolean
  data?: T
  error?: string
  status?: number
  attempts: number
}

/**
 * Fetch with timeout and retry logic
 */
export async function fetchWithTimeout<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<FetchResult<T>> {
  const {
    timeout = 30000, // 30 seconds default timeout
    retries = 3,
    retryDelay = 1000,
    skipRetryFor = [400, 401, 403, 404, 422],
    ...fetchOptions
  } = options

  let lastError: Error | null = null
  let attempt = 0

  while (attempt <= retries) {
    attempt++

    let controller: AbortController | null = null
    let timeoutId: NodeJS.Timeout | null = null

    try {
      // Create abort controller for timeout
      controller = new AbortController()
      timeoutId = setTimeout(() => controller!.abort(), timeout)

      // Make request
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      })

      clearTimeout(timeoutId!)
      timeoutId = null

      // Check response status
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
        lastError = error

        // Check if we should retry
        if (attempt <= retries && !skipRetryFor.includes(response.status)) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
          continue
        }

        // Try to get error details from response
        let errorDetails: any
        try {
          errorDetails = await response.json()
        } catch {
          errorDetails = await response.text()
        }

        logger.warn(`Fetch failed: ${url}`, {
          status: response.status,
          statusText: response.statusText,
          attempt,
          retries,
          errorDetails,
        })

        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          attempts: attempt,
        }
      }

      // Parse response
      const contentType = response.headers.get('content-type')
      let data: T

      if (contentType?.includes('application/json')) {
        data = await response.json()
      } else if (contentType?.includes('text/')) {
        data = await response.text() as T
      } else {
        data = await response.blob() as T
      }

      logger.debug(`Fetch successful: ${url}`, {
        status: response.status,
        attempt,
        retries,
      })

      return {
        success: true,
        data,
        status: response.status,
        attempts: attempt,
      }
    } catch (error) {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      lastError = error as Error

      // Check if it's an abort error (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        logger.warn(`Fetch timeout: ${url}`, {
          timeout,
          attempt,
          retries,
        })
      } else {
        logger.error(`Fetch error: ${url}`, error instanceof Error ? error : new Error(String(error)), {
          timeout,
          attempt,
          retries,
        })
      }

      // Retry if not last attempt
      if (attempt <= retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
        continue
      }

      return {
        success: false,
        error: lastError?.message || 'Fetch failed',
        attempts: attempt,
      }
    }
  }

  // Should not reach here, but TypeScript needs a return
  return {
    success: false,
    error: 'Max retries exceeded',
    attempts: retries + 1,
  }
}

/**
 * GET request with timeout
 */
export async function get<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<FetchResult<T>> {
  return fetchWithTimeout<T>(url, {
    ...options,
    method: 'GET',
  })
}

/**
 * POST request with timeout
 */
export async function post<T = any>(
  url: string,
  data?: any,
  options: FetchOptions = {}
): Promise<FetchResult<T>> {
  return fetchWithTimeout<T>(url, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
}

/**
 * PUT request with timeout
 */
export async function put<T = any>(
  url: string,
  data?: any,
  options: FetchOptions = {}
): Promise<FetchResult<T>> {
  return fetchWithTimeout<T>(url, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
}

/**
 * DELETE request with timeout
 */
export async function del<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<FetchResult<T>> {
  return fetchWithTimeout<T>(url, {
    ...options,
    method: 'DELETE',
  })
}

/**
 * PATCH request with timeout
 */
export async function patch<T = any>(
  url: string,
  data?: any,
  options: FetchOptions = {}
): Promise<FetchResult<T>> {
  return fetchWithTimeout<T>(url, {
    ...options,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
}

/**
 * Upload file with timeout
 */
export async function uploadFile<T = any>(
  url: string,
  file: File,
  options: Omit<FetchOptions, 'body' | 'headers'> = {}
): Promise<FetchResult<T>> {
  const formData = new FormData()
  formData.append('file', file)

  return fetchWithTimeout<T>(url, {
    ...options,
    method: 'POST',
    body: formData,
    // Don't set Content-Type header for FormData (browser sets it with boundary)
  })
}

/**
 * Fetch multiple URLs in parallel
 */
export async function fetchAll<T = any>(
  urls: string[],
  options: FetchOptions = {}
): Promise<FetchResult<T>[]> {
  const results = await Promise.all(
    urls.map(url => fetchWithTimeout<T>(url, options))
  )

  return results
}

/**
 * Fetch URLs sequentially (one after another)
 */
export async function fetchSequential<T = any>(
  urls: string[],
  options: FetchOptions = {}
): Promise<FetchResult<T>[]> {
  const results: FetchResult<T>[] = []

  for (const url of urls) {
    const result = await fetchWithTimeout<T>(url, options)
    results.push(result)

    // Stop on first failure if configured
    if (!result.success && options.retries === 0) {
      break
    }
  }

  return results
}
