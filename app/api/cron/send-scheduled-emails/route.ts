// Cron endpoint for sending scheduled emails
// This endpoint should be called daily (via Vercel Cron, Netlify Scheduled Functions, or external cron service)
// GET /api/cron/send-scheduled-emails?secret=YOUR_SECRET

import { NextRequest, NextResponse } from 'next/server'
import { scheduledEmailService } from '@/lib/scheduled-email-service'

// Secret key to protect this endpoint (set in environment variables)
const CRON_SECRET = process.env.CRON_SECRET || 'change-me-in-production'

export async function GET(request: NextRequest) {
  try {
    // Verify secret key
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    if (secret !== CRON_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('📧 Starting scheduled email job...')

    // Send pre-trip emails (default: 7 days before check-in)
    const preTripResult = await scheduledEmailService.sendPreTripEmails(7)
    console.log(`Pre-trip emails: ${preTripResult.sent} sent, ${preTripResult.errors} errors`)

    // Send post-trip feedback emails (default: 1 day after check-out)
    const postTripResult = await scheduledEmailService.sendPostTripFeedbackEmails(1)
    console.log(`Post-trip emails: ${postTripResult.sent} sent, ${postTripResult.errors} errors`)

    return NextResponse.json({
      success: true,
      results: {
        preTrip: preTripResult,
        postTrip: postTripResult,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: unknown) {
    console.error('Error in scheduled email cron job:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

// Also support POST for flexibility
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const secret = body.secret || request.headers.get('x-cron-secret')

    if (secret !== CRON_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('📧 Starting scheduled email job (POST)...')

    // Send pre-trip emails
    const preTripResult = await scheduledEmailService.sendPreTripEmails(7)
    console.log(`Pre-trip emails: ${preTripResult.sent} sent, ${preTripResult.errors} errors`)

    // Send post-trip feedback emails
    const postTripResult = await scheduledEmailService.sendPostTripFeedbackEmails(1)
    console.log(`Post-trip emails: ${postTripResult.sent} sent, ${postTripResult.errors} errors`)

    return NextResponse.json({
      success: true,
      results: {
        preTrip: preTripResult,
        postTrip: postTripResult,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: unknown) {
    console.error('Error in scheduled email cron job:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

