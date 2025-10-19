import { logger } from './logger'

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
 */

export function getUserFriendlyMessage(error: Error): string {
  if (error instanceof APIError) {
    switch (error.statusCode) {
      case 400:
        return 'Invalid request. Please check your input and try again.'
      case 401:
        return 'You need to be logged in to perform this action.'
      case 403:
        return 'You don\'t have permission to perform this action.'
      case 404:
        return 'The requested resource was not found.'
      case 429:
        return 'Too many requests. Please try again later.'
      case 500:
        return 'A server error occurred. Please try again later.'
      default:
        return 'An error occurred. Please try again.'
    }
  }

  if (error instanceof ValidationError) {
    return error.message
  }

  if (error instanceof BookingError) {
    return 'An error occurred during the booking process. Please try again or contact support.'
  }

  return 'An unexpected error occurred. Please try again.'
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

