/**
 * Utility for retrying failed API calls with exponential backoff
 */

export interface RetryOptions {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
  retryableStatuses?: number[]
}

const defaultOptions: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504]
}

export async function retryFetch(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  const config = { ...defaultOptions, ...retryOptions }
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetch(url, options)

      // If successful or non-retryable error, return immediately
      if (response.ok || !config.retryableStatuses.includes(response.status)) {
        return response
      }

      // If last attempt, return the error response
      if (attempt === config.maxRetries) {
        return response
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.initialDelay * Math.pow(config.backoffMultiplier, attempt),
        config.maxDelay
      )

      await new Promise(resolve => setTimeout(resolve, delay))
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')

      // If last attempt, throw the error
      if (attempt === config.maxRetries) {
        throw lastError
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.initialDelay * Math.pow(config.backoffMultiplier, attempt),
        config.maxDelay
      )

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError || new Error('Failed after retries')
}

/**
 * Wrapper for fetch with automatic retry logic
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  return retryFetch(url, options, retryOptions)
}

