import { NextRequest, NextResponse } from 'next/server'
import { requireRateLimit } from '@/lib/rate-limit'
import { withErrorHandler, ErrorResponses } from '@/lib/error-handler'

// Get admin password from environment only - NO FALLBACK
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

// Validate admin password is set
if (!ADMIN_PASSWORD) {
  throw new Error('CRITICAL: ADMIN_PASSWORD environment variable is not set. Login will be inaccessible.')
}

// Check authentication status
export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const adminAuth = request.cookies.get('admin_auth')?.value

    if (adminAuth && adminAuth === ADMIN_PASSWORD) {
      return NextResponse.json(
        { authenticated: true },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    )
  })(request)
}

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    // Apply rate limiting: 5 attempts per 15 minutes
    const rateLimitResult = await requireRateLimit(request, {
      limit: 5,
      window: 15 * 60 * 1000, // 15 minutes
    })

    if (!rateLimitResult.success) {
      return rateLimitResult.error!
    }

    // Handle both JSON and form data
    let password: string
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      const body = await request.json()
      password = body.password
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData()
      password = formData.get('password') as string
    } else {
      // Try JSON first, fallback to form data
      try {
        const body = await request.json()
        password = body.password
      } catch {
        const formData = await request.formData()
        password = formData.get('password') as string
      }
    }

    // Validate password
    if (!password || password !== ADMIN_PASSWORD) {
      return ErrorResponses.unauthorized()
    }

    // Set two cookies:
    // 1. HttpOnly cookie for server-side authentication
    // 2. Non-HttpOnly cookie for client-side admin toolbar detection
    const isProduction = process.env.NODE_ENV === 'production' || process.env.NETLIFY === 'true'
    const secureFlag = isProduction ? '; Secure' : ''
    
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        redirect: '/admin'
      },
      { status: 200 }
    )

    // Server-side auth cookie (HttpOnly)
    response.headers.set('Set-Cookie', `admin_auth=${password}; Path=/; Max-Age=${60 * 60 * 24 * 7}; HttpOnly; SameSite=Strict${secureFlag}`)
    
    // Client-side admin indicator cookie (NOT HttpOnly)
    response.headers.append('Set-Cookie', `admin_logged_in=true; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Strict${secureFlag}`)

    return response
  })(request)
}
