/**
 * Test Helper Utilities
 * Common utilities for writing tests
 */

import { NextRequest } from 'next/server'

/**
 * Create a mock NextRequest for API route testing
 */
export function createMockRequest(
  url: string,
  options: {
    method?: string
    body?: any
    headers?: Record<string, string>
    cookies?: Record<string, string>
  } = {}
): NextRequest {
  const { method = 'GET', body, headers = {}, cookies = {} } = options

  const request = new NextRequest(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })

  // Add cookies
  Object.entries(cookies).forEach(([name, value]) => {
    request.cookies.set(name, value)
  })

  // Add body if provided
  if (body) {
    // Note: NextRequest doesn't have a direct body setter in tests
    // You'll need to mock the json() method
    ;(request as any).json = async () => body
  }

  return request
}

/**
 * Wait for async operations to complete
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Create a mock response with JSON body
 */
export function createMockResponse(data: any, status: number = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers(),
  } as Response
}

/**
 * Assert that an error is of a specific type
 */
export function expectError(error: any, expectedType: string): void {
  expect(error).toBeInstanceOf(Error)
  expect(error.name).toBe(expectedType)
}

/**
 * Create a date string for testing
 */
export function createTestDate(daysFromNow: number = 0): string {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date.toISOString().split('T')[0]
}

/**
 * Create a date range for testing
 */
export function createTestDateRange(
  checkInDays: number = 7,
  checkOutDays: number = 10
): { checkIn: string; checkOut: string } {
  return {
    checkIn: createTestDate(checkInDays),
    checkOut: createTestDate(checkOutDays),
  }
}

/**
 * Mock console methods for testing
 */
export function mockConsole() {
  const originalError = console.error
  const originalWarn = console.warn
  const originalLog = console.log

  const errors: string[] = []
  const warnings: string[] = []
  const logs: string[] = []

  console.error = (...args: any[]) => {
    errors.push(args.join(' '))
    originalError(...args)
  }

  console.warn = (...args: any[]) => {
    warnings.push(args.join(' '))
    originalWarn(...args)
  }

  console.log = (...args: any[]) => {
    logs.push(args.join(' '))
    originalLog(...args)
  }

  return {
    errors,
    warnings,
    logs,
    restore: () => {
      console.error = originalError
      console.warn = originalWarn
      console.log = originalLog
    },
  }
}

