import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD ||
  process.env.NEXT_PUBLIC_ADMIN_PASSWORD ||
  'heiwa_admin_2024'

/**
 * Ensures the incoming request originates from an authenticated admin.
 * Returns a NextResponse with 401 if the cookie is missing or invalid.
 */
export function requireAdminAuth(request: NextRequest): NextResponse | null {
  const adminAuth = request.cookies.get('admin_auth')?.value

  if (!adminAuth || adminAuth !== ADMIN_PASSWORD) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return null
}
