/**
 * Stripe Webhook Signature Verification
 * Ensures webhooks are genuinely from Stripe
 */

import crypto from 'crypto'

interface StripeWebhookEvent {
  id: string
  type: string
  data: {
    object: StripeEventObject
  }
}

interface StripeEventObject {
  id: string
  metadata?: Record<string, string>
  amount?: number
  currency?: string
  last_payment_error?: {
    message?: string
  }
  customer_details?: {
    email?: string
  }
  amount_paid?: number
  attempt_count?: number
  amount_refunded?: number
}

interface WebhookHandlerResponse {
  event: string
  bookingId?: string
  amount?: number
  currency?: string
  error?: string
  customerEmail?: string
  attemptCount?: number
}

/**
 * Verify Stripe webhook signature
 * @param payload Raw request body as string
 * @param signature Stripe signature from headers
 * @param secret Stripe webhook secret
 * @returns true if signature is valid, false otherwise
 */
export function verifyStripeWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    if (!payload || !signature || !secret) {
      console.error('Missing required parameters for webhook verification')
      return false
    }

    // Stripe sends timestamp and signature in format: t=...,v1=...,v2=...
    const elements = signature.split(',')
    if (elements.length < 2) {
      console.error('Invalid signature format')
      return false
    }

    // Extract timestamp and signature
    const timestampElement = elements.find(el => el.startsWith('t='))
    const signatureElement = elements.find(el => el.startsWith('v1='))

    if (!timestampElement || !signatureElement) {
      console.error('Missing timestamp or signature element')
      return false
    }

    const timestamp = timestampElement.substring(2)
    const signatureValue = signatureElement.substring(3)

    // Check timestamp is within tolerance (prevents replay attacks)
    const webhookTimestamp = parseInt(timestamp, 10)
    const tolerance = 300 // 5 minutes in seconds
    const now = Math.floor(Date.now() / 1000)

    if (now - webhookTimestamp > tolerance) {
      console.error('Webhook timestamp is too old')
      return false
    }

    // Construct signed payload
    const signedPayload = `${timestamp}.${payload}`

    // Generate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex')

    // Compare signatures using constant-time comparison
    return crypto.timingSafeEqual(
      Buffer.from(signatureValue, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    return false
  }
}

/**
 * Extract webhook event from request
 * @param request Next.js request object
 * @returns Parsed webhook event or null if invalid
 */
export async function extractWebhookEvent(request: Request): Promise<StripeWebhookEvent | null> {
  try {
    const signature = request.headers.get('stripe-signature')
    const secret = process.env.STRIPE_WEBHOOK_SECRET

    if (!signature || !secret) {
      console.error('Missing signature or webhook secret')
      return null
    }

    // Get raw body
    const payload = await request.text()

    // Verify signature
    const isValid = verifyStripeWebhookSignature(payload, signature, secret)

    if (!isValid) {
      console.error('Invalid webhook signature')
      return null
    }

    // Parse event
    const event = JSON.parse(payload)

    // Validate event structure
    if (!event.id || !event.type || !event.data) {
      console.error('Invalid webhook event structure')
      return null
    }

    return event
  } catch (error) {
    console.error('Error extracting webhook event:', error)
    return null
  }
}

/**
 * Handle different webhook event types
 * @param event Stripe webhook event
 * @returns Response object or null if unhandled
 */
export async function handleWebhookEvent(event: StripeWebhookEvent): Promise<WebhookHandlerResponse | null> {
  const eventType = event.type

  switch (eventType) {
    case 'payment_intent.succeeded':
      return handlePaymentSucceeded(event.data.object)
    case 'payment_intent.payment_failed':
      return handlePaymentFailed(event.data.object)
    case 'payment_intent.canceled':
      return handlePaymentCanceled(event.data.object)
    case 'checkout.session.completed':
      return handleCheckoutCompleted(event.data.object)
    case 'invoice.payment_succeeded':
      return handleInvoicePaymentSucceeded(event.data.object)
    case 'invoice.payment_failed':
      return handleInvoicePaymentFailed(event.data.object)
    case 'charge.refunded':
      return handleChargeRefunded(event.data.object)
    default:
      console.log(`Unhandled webhook event type: ${eventType}`)
      return null
  }
}

/**
 * Handle payment succeeded event
 */
async function handlePaymentSucceeded(paymentIntent: StripeEventObject): Promise<WebhookHandlerResponse> {
  console.log('Payment succeeded:', paymentIntent.id)

  // Update booking status in database
  const bookingId = paymentIntent.metadata?.booking_id

  if (bookingId) {
    // TODO: Update booking status to confirmed
    console.log(`Would update booking ${bookingId} to confirmed`)
  }

  return {
    event: 'payment_succeeded',
    bookingId,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
  }
}

/**
 * Handle payment failed event
 */
async function handlePaymentFailed(paymentIntent: StripeEventObject): Promise<WebhookHandlerResponse> {
  console.log('Payment failed:', paymentIntent.id)

  const bookingId = paymentIntent.metadata?.booking_id

  if (bookingId) {
    // TODO: Update booking status to payment_failed
    console.log(`Would update booking ${bookingId} to payment_failed`)
  }

  return {
    event: 'payment_failed',
    bookingId,
    error: paymentIntent.last_payment_error?.message,
  }
}

/**
 * Handle payment canceled event
 */
async function handlePaymentCanceled(paymentIntent: StripeEventObject): Promise<WebhookHandlerResponse> {
  console.log('Payment canceled:', paymentIntent.id)

  const bookingId = paymentIntent.metadata?.booking_id

  if (bookingId) {
    // TODO: Update booking status to canceled
    console.log(`Would update booking ${bookingId} to canceled`)
  }

  return {
    event: 'payment_canceled',
    bookingId,
  }
}

/**
 * Handle checkout session completed event
 */
async function handleCheckoutCompleted(session: StripeEventObject): Promise<WebhookHandlerResponse> {
  console.log('Checkout session completed:', session.id)

  const bookingId = session.metadata?.booking_id

  if (bookingId) {
    // TODO: Update booking status to confirmed
    console.log(`Would update booking ${bookingId} to confirmed`)
  }

  return {
    event: 'checkout_completed',
    bookingId,
    customerEmail: session.customer_details?.email,
  }
}

/**
 * Handle invoice payment succeeded event
 */
async function handleInvoicePaymentSucceeded(invoice: StripeEventObject): Promise<WebhookHandlerResponse> {
  console.log('Invoice payment succeeded:', invoice.id)

  const bookingId = invoice.metadata?.booking_id

  if (bookingId) {
    // TODO: Update booking payment status
    console.log(`Would update booking ${bookingId} payment status`)
  }

  return {
    event: 'invoice_payment_succeeded',
    bookingId,
    amount: invoice.amount_paid,
  }
}

/**
 * Handle invoice payment failed event
 */
async function handleInvoicePaymentFailed(invoice: StripeEventObject): Promise<WebhookHandlerResponse> {
  console.log('Invoice payment failed:', invoice.id)

  const bookingId = invoice.metadata?.booking_id

  if (bookingId) {
    // TODO: Update booking payment status
    console.log(`Would update booking ${bookingId} payment status to failed`)
  }

  return {
    event: 'invoice_payment_failed',
    bookingId,
    attemptCount: invoice.attempt_count,
  }
}

/**
 * Handle charge refunded event
 */
async function handleChargeRefunded(charge: StripeEventObject): Promise<WebhookHandlerResponse> {
  console.log('Charge refunded:', charge.id)

  const bookingId = charge.metadata?.booking_id

  if (bookingId) {
    // TODO: Update booking status to refunded
    console.log(`Would update booking ${bookingId} to refunded`)
  }

  return {
    event: 'charge_refunded',
    bookingId,
    amount: charge.amount_refunded,
  }
}
