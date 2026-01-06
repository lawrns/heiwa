/**
 * Centralized Error Handler
 * Provides consistent error handling across all API routes
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * Custom API Error class with status code and error code
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public endpoint: string,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'APIError'
  }
}

/**
 * Standard API Response interface
 */
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  code?: string
  details?: any
  timestamp: string
  requestId: string
}

/**
 * Error codes for different types of errors
 */
export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // Not Found
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',

  // Conflict
  CONFLICT = 'CONFLICT',
  DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',
  ALREADY_BOOKED = 'ALREADY_BOOKED',

  // Rate Limiting
  RATE_LIMITED = 'RATE_LIMITED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',

  // Server Errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  TIMEOUT = 'TIMEOUT',
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  statusCode: number,
  code: string,
  message: string,
  details?: any,
  requestId?: string
): NextResponse {
  const response: APIResponse = {
    success: false,
    error: message,
    code,
    details,
    timestamp: new Date().toISOString(),
    requestId: requestId || 'unknown',
  }

  const nextResponse = NextResponse.json(response, { status: statusCode })
  if (requestId) {
    nextResponse.headers.set('x-request-id', requestId)
  }
  return nextResponse
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  requestId?: string,
  statusCode: number = 200
): NextResponse {
  const response: APIResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId: requestId || 'unknown',
  }

  const nextResponse = NextResponse.json(response, { status: statusCode })
  if (requestId) {
    nextResponse.headers.set('x-request-id', requestId)
  }
  return nextResponse
}

/**
 * Wrap API handler with error handling
 */
export type APIHandler = (request: NextRequest, context?: any) => Promise<NextResponse>

export function withErrorHandler(handler: APIHandler): APIHandler {
  return async (request: NextRequest, context?: any) => {
    const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

    try {
      const response = await handler(request, context)

      // Add request ID to response headers if not already present
      if (!response.headers.get('x-request-id')) {
        response.headers.set('x-request-id', requestId)
      }

      return response
    } catch (error) {
      // Log the error
      await logError(error as Error, {
        ...context,
        url: request.url,
        method: request.method,
        requestId,
      })

      // Handle APIError instances
      if (error instanceof APIError) {
        return createErrorResponse(
          error.statusCode,
          error.code,
          error.message,
          error.context,
          requestId
        )
      }

      // Handle Supabase errors
      if (error && typeof error === 'object' && 'code' in error) {
        const supabaseError = error as { code: string; message: string; details?: any }

        // Map common Supabase error codes
        switch (supabaseError.code) {
          case 'PGRST116':
            return createErrorResponse(
              404,
              ErrorCode.NOT_FOUND,
              'Resource not found',
              supabaseError.details,
              requestId
            )
          case '23505':
            return createErrorResponse(
              409,
              ErrorCode.DUPLICATE_RESOURCE,
              'Resource already exists',
              supabaseError.details,
              requestId
            )
          case '23503':
            return createErrorResponse(
              400,
              ErrorCode.VALIDATION_ERROR,
              'Referenced resource does not exist',
              supabaseError.details,
              requestId
            )
          default:
            return createErrorResponse(
              500,
              ErrorCode.DATABASE_ERROR,
              'Database error occurred',
              process.env.NODE_ENV === 'development' ? supabaseError.details : undefined,
              requestId
            )
        }
      }

      // Handle validation errors (Zod)
      if (error && typeof error === 'object' && 'issues' in error) {
        return createErrorResponse(
          400,
          ErrorCode.VALIDATION_ERROR,
          'Validation failed',
          (error as { issues: any[] }).issues,
          requestId
        )
      }

      // Handle generic errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

      // Don't expose internal errors in production
      const userMessage =
        process.env.NODE_ENV === 'production'
          ? 'An internal server error occurred'
          : errorMessage

      return createErrorResponse(
        500,
        ErrorCode.INTERNAL_ERROR,
        userMessage,
        process.env.NODE_ENV === 'development' ? { originalError: errorMessage } : undefined,
        requestId
      )
    }
  }
}

/**
 * Helper functions for common error responses
 */
export const ErrorResponses = {
  unauthorized: (requestId?: string) =>
    createErrorResponse(401, ErrorCode.UNAUTHORIZED, 'Unauthorized', undefined, requestId),

  forbidden: (requestId?: string) =>
    createErrorResponse(403, ErrorCode.FORBIDDEN, 'Forbidden', undefined, requestId),

  notFound: (resource: string = 'Resource', requestId?: string) =>
    createErrorResponse(404, ErrorCode.NOT_FOUND, `${resource} not found`, undefined, requestId),

  validation: (message: string = 'Validation failed', details?: any, requestId?: string) =>
    createErrorResponse(400, ErrorCode.VALIDATION_ERROR, message, details, requestId),

  conflict: (message: string = 'Conflict', details?: any, requestId?: string) =>
    createErrorResponse(409, ErrorCode.CONFLICT, message, details, requestId),

  rateLimited: (retryAfter?: number, requestId?: string) =>
    createErrorResponse(
      429,
      ErrorCode.RATE_LIMITED,
      'Too many requests',
      { retryAfter },
      requestId
    ),

  internal: (message?: string, requestId?: string) =>
    createErrorResponse(
      500,
      ErrorCode.INTERNAL_ERROR,
      message || 'Internal server error',
      undefined,
      requestId
    ),
}

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
  const code = error?.code || 'API_ERROR'

  logger.apiError(endpoint, error, {
    statusCode,
    response: error?.response?.data,
  })

  return new APIError(message, statusCode, code, endpoint, {
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

