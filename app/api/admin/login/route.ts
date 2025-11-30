import { NextRequest, NextResponse } from 'next/server'
import { rateLimiters, getClientIP, createRateLimitHeaders } from '@/lib/rate-limiter'

// Check authentication status
export async function GET(request: NextRequest) {
  try {
    const adminAuth = request.cookies.get('admin_auth')?.value
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'heiwa_admin_2024'

    if (adminAuth && adminAuth === adminPassword) {
      return NextResponse.json(
        { authenticated: true },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting to prevent brute force attacks
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimiters.auth(clientIP)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          message: 'Too many login attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: createRateLimitHeaders(rateLimitResult)
        }
      )
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
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'heiwa_admin_2024'

    if (!password || password !== adminPassword) {
      return NextResponse.json(
        { message: 'Invalid password' },
        { status: 401 }
      )
    }

    // Create response with success message
    // Set cookie using Response headers for better compatibility
    const isProduction = process.env.NODE_ENV === 'production' || process.env.NETLIFY === 'true'

    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        redirect: '/admin'
      },
      { status: 200 }
    )

    // Set cookie via headers - remove HttpOnly for better browser compatibility
    response.headers.set('Set-Cookie', `admin_auth=${password}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax${isProduction ? '; Secure' : ''}`)

    return response
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
