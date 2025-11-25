import { NextRequest, NextResponse } from 'next/server'

/**
 * Error reporting endpoint
 * Receives client-side errors and logs them server-side
 */
export async function POST(request: NextRequest) {
  try {
    const errorData = await request.json()

    // Log error server-side
    console.error('[CLIENT ERROR]', {
      ...errorData,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    })

    // TODO: Store in database or send to error tracking service
    // Example:
    // await logErrorToDatabase(errorData)
    // await sendToSentry(errorData)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    // Silently fail - don't let error reporting break the app
    console.error('[ERROR REPORTING FAILED]', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

