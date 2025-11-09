import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Debug endpoint - testing deployment',
    timestamp: new Date().toISOString(),
    version: '2025-11-09-fixes-applied',
    booking_fields: ['client_ids', 'total_amount', 'payment_status', 'payment_method']
  })
}
