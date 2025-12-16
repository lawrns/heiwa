// Error logging utility
// Falls back to console if logger is not available
const logger = {
  error: (message: string, error?: any, context?: Record<string, any>) => {
    console.error(`[ERROR] ${message}`, error, context)
  },
  warn: (message: string, context?: Record<string, any>) => {
    console.warn(`[WARN] ${message}`, context)
  },
  apiError: (endpoint: string, error: any, context?: Record<string, any>) => {
    console.error(`[API ERROR] ${endpoint}`, error, context)
  },
  validationError: (field: string, message: string, context?: Record<string, any>) => {
    console.error(`[VALIDATION ERROR] ${field}: ${message}`, context)
  },
  bookingError: (step: string, error: any, context?: Record<string, any>) => {
    console.error(`[BOOKING ERROR] ${step}`, error, context)
  },
}

/**
 * Log error with context for production debugging
 */
export function logError(error: Error, context?: {
  component?: string
  action?: string
  userId?: string
  bookingId?: string
  [key: string]: any
}) {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    ...context,
  }

  logger.error('Application error', error, errorInfo)

  // TODO: Send to error reporting service
  // Example:
  // if (typeof window !== 'undefined' && window.Sentry) {
  //   window.Sentry.captureException(error, { extra: errorInfo })
  // }
  
  // Optional: Send to API endpoint for logging
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Don't await to avoid blocking
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorInfo),
    }).catch(() => {
      // Silently fail if error reporting fails
    })
  }
}

/**
 * Custom error classes for different error types
 */

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint: string,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value?: any
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class BookingError extends Error {
  constructor(
    message: string,
    public step: string,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'BookingError'
  }
}

/**
 * Error handler utilities
 */

export function handleAPIError(error: any, endpoint: string): APIError {
  const message = error?.message || 'An API error occurred'
  const statusCode = error?.response?.status || 500
  
  logger.apiError(endpoint, error, {
    statusCode,
    response: error?.response?.data,
  })

  return new APIError(message, statusCode, endpoint, {
    originalError: error,
  })
}

export function handleValidationError(field: string, value: any, message?: string): ValidationError {
  const errorMessage = message || `Invalid value for ${field}`
  
  logger.validationError(field, errorMessage, {
    value,
  })

  return new ValidationError(errorMessage, field, value)
}

export function handleBookingError(step: string, error: any): BookingError {
  const message = error?.message || `Error in booking step: ${step}`
  
  logger.bookingError(step, error, {
    originalError: error,
  })

  return new BookingError(message, step, {
    originalError: error,
  })
}

/**
 * User-friendly error messages
 * Maps technical API errors to user-friendly messages
 */

// Common error patterns and their user-friendly messages
const ERROR_PATTERNS: Array<{ pattern: RegExp | string; message: string }> = [
  // Network errors
  { pattern: /network|fetch|connection|offline/i, message: 'Connection error. Please check your internet connection and try again.' },
  { pattern: /timeout|timed out/i, message: 'Request timed out. Please try again.' },
  { pattern: /failed to fetch/i, message: 'Unable to connect to the server. Please check your internet connection.' },
  
  // Database errors
  { pattern: /duplicate|already exists|unique constraint/i, message: 'This item already exists. Please check for duplicates.' },
  { pattern: /foreign key|constraint|reference/i, message: 'Cannot complete this action due to related data. Please contact support.' },
  { pattern: /not found|does not exist/i, message: 'The requested item was not found. It may have been deleted.' },
  
  // Validation errors
  { pattern: /required|missing|empty/i, message: 'Please fill in all required fields.' },
  { pattern: /invalid|format|malformed/i, message: 'Invalid format. Please check your input and try again.' },
  { pattern: /email|e-mail/i, message: 'Please enter a valid email address.' },
  { pattern: /phone|telephone/i, message: 'Please enter a valid phone number.' },
  { pattern: /date|calendar/i, message: 'Please select a valid date.' },
  
  // Booking-specific errors
  { pattern: /availability|available|booked|reserved/i, message: 'This room or date is no longer available. Please select different dates or options.' },
  { pattern: /capacity|guests|occupancy/i, message: 'The number of guests exceeds the room capacity. Please adjust your selection.' },
  { pattern: /payment|stripe|card/i, message: 'Payment processing failed. Please check your payment details and try again.' },
  
  // Authentication errors
  { pattern: /unauthorized|authentication|login/i, message: 'Please log in to continue.' },
  { pattern: /forbidden|permission|access denied/i, message: 'You don\'t have permission to perform this action.' },
  { pattern: /session|expired|token/i, message: 'Your session has expired. Please log in again.' },
  
  // Server errors
  { pattern: /server|internal|500/i, message: 'A server error occurred. Our team has been notified. Please try again later.' },
  { pattern: /service unavailable|503/i, message: 'Service temporarily unavailable. Please try again in a few moments.' },
  { pattern: /bad gateway|502/i, message: 'Service temporarily unavailable. Please try again later.' },
  
  // Rate limiting
  { pattern: /too many|rate limit|429/i, message: 'Too many requests. Please wait a moment and try again.' },
]

export function getUserFriendlyMessage(error: Error | string | unknown): string {
  // Handle string errors
  if (typeof error === 'string') {
    return mapErrorString(error)
  }
  
  // Handle Error objects
  if (error instanceof Error) {
    // Check for APIError first
    if (error instanceof APIError) {
      // Try to extract more specific message from error message
      const specificMessage = mapErrorString(error.message)
      if (specificMessage !== error.message) {
        return specificMessage
      }
      
      // Fall back to status code mapping
      switch (error.statusCode) {
        case 400:
          return 'Invalid request. Please check your input and try again.'
        case 401:
          return 'Please log in to continue.'
        case 403:
          return 'You don\'t have permission to perform this action.'
        case 404:
          return 'The requested item was not found.'
        case 409:
          return 'This action conflicts with existing data. Please refresh and try again.'
        case 422:
          return 'Invalid data provided. Please check your input.'
        case 429:
          return 'Too many requests. Please wait a moment and try again.'
        case 500:
          return 'A server error occurred. Our team has been notified. Please try again later.'
        case 502:
          return 'Service temporarily unavailable. Please try again later.'
        case 503:
          return 'Service temporarily unavailable. Please try again in a few moments.'
        default:
          return mapErrorString(error.message) || 'An error occurred. Please try again.'
      }
    }

    if (error instanceof ValidationError) {
      return error.message
    }

    if (error instanceof BookingError) {
      return mapErrorString(error.message) || 'An error occurred during the booking process. Please try again or contact support.'
    }

    // Check error name for network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return 'Connection error. Please check your internet connection and try again.'
    }

    // Try to map the error message
    return mapErrorString(error.message) || 'An unexpected error occurred. Please try again.'
  }

  // Handle unknown error types
  if (error && typeof error === 'object' && 'message' in error) {
    return mapErrorString(String(error.message)) || 'An error occurred. Please try again.'
  }

  return 'An unexpected error occurred. Please try again.'
}

/**
 * Map error string to user-friendly message using patterns
 */
function mapErrorString(errorMessage: string): string {
  if (!errorMessage) return ''
  
  const lowerMessage = errorMessage.toLowerCase()
  
  // Check against patterns
  for (const { pattern, message } of ERROR_PATTERNS) {
    if (typeof pattern === 'string') {
      if (lowerMessage.includes(pattern.toLowerCase())) {
        return message
      }
    } else {
      if (pattern.test(errorMessage)) {
        return message
      }
    }
  }
  
  // Return original message if no pattern matches
  return errorMessage
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    // Check error name
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return true
    }
    
    // Check error message for network-related keywords
    const networkKeywords = ['network', 'fetch', 'connection', 'offline', 'timeout', 'failed to fetch']
    const lowerMessage = error.message.toLowerCase()
    return networkKeywords.some(keyword => lowerMessage.includes(keyword))
  }
  
  if (typeof error === 'string') {
    const networkKeywords = ['network', 'fetch', 'connection', 'offline', 'timeout', 'failed to fetch']
    return networkKeywords.some(keyword => error.toLowerCase().includes(keyword))
  }
  
  return false
}

/**
 * Retry logic for failed requests
 */

export async function retryRequest<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    delay?: number
    backoff?: boolean
  } = {}
): Promise<T> {
  const { maxRetries = 3, delay = 1000, backoff = true } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt < maxRetries - 1) {
        const waitTime = backoff ? delay * Math.pow(2, attempt) : delay
        logger.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${waitTime}ms`, {
          error: lastError.message,
        })
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }

  throw lastError || new Error('Max retries exceeded')
}

/**
 * Safe async wrapper for components
 */

export async function safeAsync<T>(
  fn: () => Promise<T>,
  errorHandler?: (error: Error) => void
): Promise<T | null> {
  try {
    return await fn()
  } catch (error) {
    const err = error as Error
    logger.error('Async operation failed', err)
    
    if (errorHandler) {
      errorHandler(err)
    }
    
    return null
  }
}

