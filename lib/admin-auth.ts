import { NextRequest, NextResponse } from 'next/server'

// Get admin password from environment only - NO FALLBACK
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

// Validate admin password is set (only if not in test environment)
if (!ADMIN_PASSWORD && process.env.NODE_ENV !== 'test' && !process.env.JEST_WORKER_ID) {
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
  const adminPassword = process.env.ADMIN_PASSWORD
  const adminAuth = request.cookies.get('admin_auth')?.value

  // Skip auth in test environment ONLY if ADMIN_PASSWORD is not set
  // This allows auth-specific tests to still run by providing a password
  if ((process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) && !adminPassword) {
    return null
  }

  if (!adminAuth || adminAuth !== adminPassword) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return null
}
