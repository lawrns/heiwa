/**
 * CSRF Protection for Admin Routes
 * Prevents Cross-Site Request Forgery attacks
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * Generate a random CSRF token
 */
function generateToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(request: NextRequest): boolean {
  // Get token from header
  const headerToken = request.headers.get('x-csrf-token')

  // Get token from cookie
  const cookieToken = request.cookies.get('csrf_token')?.value

  if (!headerToken || !cookieToken) {
    return false
  }

  // Compare tokens (constant-time comparison to prevent timing attacks)
  if (headerToken.length !== cookieToken.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < headerToken.length; i++) {
    result |= headerToken.charCodeAt(i) ^ cookieToken.charCodeAt(i)
  }

  return result === 0
}

/**
 * Generate and set CSRF token
 */
export function generateCSRFToken(response: NextResponse): string {
  const token = generateToken()

  // Set token in cookie (HttpOnly, Secure, SameSite=Strict)
  response.cookies.set('csrf_token', token, {
    httpOnly: false, // Allow JavaScript to read for AJAX requests
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })

  return token
}

/**
 * CSRF protection middleware for admin routes
 */
export function withCSRFProtection(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async function csrfProtectedHandler(request: NextRequest) {
    const method = request.method

    // Skip CSRF check for GET, HEAD, OPTIONS (safe methods)
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      const response = await handler(request)

      // Add CSRF token to response
      const token = generateCSRFToken(response)
      response.headers.set('x-csrf-token', token)

      return response
    }

    // Validate CSRF token for state-changing methods
    if (!validateCSRFToken(request)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid CSRF token',
          code: 'CSRF_TOKEN_INVALID',
        },
        { status: 403 }
      )
    }

    // Token is valid, proceed with request
    return handler(request)
  }
}

/**
 * Get CSRF token from request (for client-side use)
 */
export function getCSRFToken(request: NextRequest): string | null {
  return request.cookies.get('csrf_token')?.value || null
}
