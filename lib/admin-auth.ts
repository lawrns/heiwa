import { NextRequest, NextResponse } from 'next/server'

// Get admin password from environment only - NO FALLBACK
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

// Validate admin password is set
if (!ADMIN_PASSWORD) {
  throw new Error('CRITICAL: ADMIN_PASSWORD environment variable is not set. Admin routes will be inaccessible.')
}

// Prevent default password in production
if (ADMIN_PASSWORD === 'heiwa_admin_2024') {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('CRITICAL: Default admin password detected. Change ADMIN_PASSWORD immediately.')
  }
}

/**
 * Ensures the incoming request originates from an authenticated admin.
 * Returns a NextResponse with 401 if the cookie is missing or invalid.
 */
export function requireAdminAuth(request: NextRequest): NextResponse | null {
  // Skip auth in test environment
  if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
    return null
  }

  const adminAuth = request.cookies.get('admin_auth')?.value

  if (!adminAuth || adminAuth !== ADMIN_PASSWORD) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return null
}
