import { NextRequest, NextResponse } from 'next/server'

// Mock Stripe checkout session creation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, amount, currency = 'MXN' } = body

    // Validate required fields
    if (!bookingId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: bookingId, amount' },
        { status: 400 }
      )
    }

    // Mock Stripe checkout session
    const mockSession = {
      id: `cs_mock_${Date.now()}`,
      url: `http://localhost:3000/checkout/${bookingId}/payment`,
      payment_status: 'unpaid',
      amount_total: amount,
      currency: currency.toLowerCase(),
      bookingId: bookingId
    }

    console.log('Mock Stripe checkout session created:', mockSession)

    return NextResponse.json({
      sessionId: mockSession.id,
      url: mockSession.url,
      bookingId: bookingId
    })

  } catch (error) {
    console.error('Create checkout session error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
