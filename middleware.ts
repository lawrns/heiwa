import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Get admin password from environment only - NO FALLBACK
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

  // Validate admin password is set (only for admin routes)
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!ADMIN_PASSWORD) {
      console.error('CRITICAL: ADMIN_PASSWORD environment variable is not set. Admin routes will be inaccessible.')
      return NextResponse.json(
        { error: 'Server configuration error: Admin authentication not configured' },
        { status: 500 }
      )
    }

    // Prevent default password in production
    if (ADMIN_PASSWORD === 'heiwa_admin_2024') {
      if (process.env.NODE_ENV === 'production') {
        console.error('CRITICAL: Default admin password detected. Change ADMIN_PASSWORD immediately.')
        return NextResponse.json(
          { error: 'Server configuration error: Default password not allowed in production' },
          { status: 500 }
        )
      } else {
        console.warn('⚠️ WARNING: Using default admin password. Change ADMIN_PASSWORD before deploying to production.')
      }
    }

    // Validate password strength
    if (ADMIN_PASSWORD.length < 16) {
      console.warn('⚠️ WARNING: Admin password is weak (less than 16 characters). Use a stronger password.')
    }
  }

  // Generate or get existing request ID
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  // Clone the response to add headers
  const response = NextResponse.next()

  // Add request ID to response headers for tracing
  response.headers.set('x-request-id', requestId)

  // Only protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check for admin authentication cookie
    const adminAuth = request.cookies.get('admin_auth')?.value

    // If no auth cookie or invalid, redirect to login
    if (!adminAuth || adminAuth !== ADMIN_PASSWORD) {
      // Allow access to /admin/login
      if (request.nextUrl.pathname === '/admin/login' || request.nextUrl.pathname === '/admin/(auth)/login') {
        return response
      }

      // Redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}
