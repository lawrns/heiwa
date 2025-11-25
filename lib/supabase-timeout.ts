// Supabase query timeout utility
// Prevents long waits when Supabase is unreachable

const DEFAULT_TIMEOUT_MS = 1000 // 1 second timeout for fast failure

/**
 * Wrap a Supabase query with a timeout to prevent long waits
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => {
        reject(new Error(`Query timeout after ${timeoutMs}ms - Supabase may be unreachable`))
      }, timeoutMs)
    ),
  ])
}

/**
 * Execute a Supabase query with timeout protection
 * Wraps Supabase query promises with timeout to prevent long waits
 */
export async function executeWithTimeout<T>(
  queryPromise: Promise<{ data: T | null; error: any }>,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<{ data: T | null; error: any }> {
  try {
    return await withTimeout(queryPromise, timeoutMs)
  } catch (error) {
    // Timeout or network error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const isTimeout = errorMessage.includes('timeout')
    const isNetworkError = errorMessage.includes('ERR_NAME_NOT_RESOLVED') ||
                          errorMessage.includes('getaddrinfo') ||
                          errorMessage.includes('ENOTFOUND') ||
                          errorMessage.includes('fetch failed') ||
                          errorMessage.includes('network') ||
                          errorMessage.includes('ECONNREFUSED')

    return {
      data: null,
      error: {
        message: isTimeout || isNetworkError
          ? 'Database connection timeout. Please check Supabase configuration.'
          : errorMessage,
        code: isTimeout ? 'TIMEOUT' : isNetworkError ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR',
        originalError: error
      }
    }
  }
}

