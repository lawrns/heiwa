import { NextRequest, NextResponse } from 'next/server'

// Mock Stripe webhook handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    console.log('Mock Stripe webhook received:', type)

    switch (type) {
      case 'checkout.session.completed':
        // Handle successful payment
        const session = data.object
        console.log('Payment completed for session:', session.id)

        // In a real implementation, you would:
        // 1. Update the booking status to 'paid'
        // 2. Send confirmation email
        // 3. Generate invoice
        // 4. Update room availability

        return NextResponse.json({ received: true })

      case 'payment_intent.succeeded':
        // Handle payment intent success
        const paymentIntent = data.object
        console.log('Payment intent succeeded:', paymentIntent.id)

        return NextResponse.json({ received: true })

      case 'charge.refunded':
        // Handle refunds
        const charge = data.object
        console.log('Charge refunded:', charge.id)

        return NextResponse.json({ received: true })

      default:
        console.log('Unhandled webhook event:', type)
        return NextResponse.json({ received: true })
    }

  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// Handle GET requests for webhook verification
export async function GET() {
  return NextResponse.json({ status: 'Stripe webhook endpoint active' })
}

