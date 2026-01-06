/**
 * Email Delivery Queue with Retry Logic
 * Ensures reliable email delivery with automatic retries
 */

import { logger } from './logger'

export interface EmailMessage {
  id: string
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  replyTo?: string
  metadata?: Record<string, any>
  priority?: 'low' | 'normal' | 'high'
  attempts?: number
  lastAttempt?: string
  nextAttempt?: string
  status?: 'pending' | 'sending' | 'sent' | 'failed' | 'cancelled'
}

export interface EmailDeliveryResult {
  success: boolean
  messageId?: string
  error?: string
  attempts: number
}

// In-memory queue (for production, use Redis or database)
const emailQueue = new Map<string, EmailMessage>()

// Queue configuration
const QUEUE_CONFIG = {
  maxAttempts: 3,
  retryDelays: [5 * 60 * 1000, 15 * 60 * 1000, 60 * 60 * 1000], // 5min, 15min, 1hr
  batchSize: 10,
  batchInterval: 5000, // 5 seconds
}

/**
 * Generate unique email ID
 */
function generateEmailId(): string {
  return `email_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
}

/**
 * Add email to queue
 */
export function queueEmail(message: Omit<EmailMessage, 'id' | 'status' | 'attempts'>): string {
  const id = generateEmailId()
  const email: EmailMessage = {
    ...message,
    id,
    status: 'pending',
    attempts: 0,
    nextAttempt: new Date().toISOString(),
  }

  emailQueue.set(id, email)

  logger.info('Email queued', {
    emailId: id,
    to: message.to,
    subject: message.subject,
    priority: message.priority,
  })

  return id
}

/**
 * Send email using Resend API
 */
async function sendEmail(message: EmailMessage): Promise<EmailDeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from = message.from || process.env.RESEND_FROM_EMAIL || 'noreply@heiwahouse.com'

  if (!apiKey) {
    return {
      success: false,
      error: 'RESEND_API_KEY not configured',
      attempts: message.attempts || 0,
    }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(message.to) ? message.to : [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
        replyTo: message.replyTo,
        tags: message.metadata ? Object.entries(message.metadata).map(([key, value]) => ({ name: key, value: String(value) })) : undefined,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to send email',
        attempts: message.attempts || 0,
      }
    }

    logger.info('Email sent successfully', {
      emailId: message.id,
      messageId: data.id,
      to: message.to,
      subject: message.subject,
    })

    return {
      success: true,
      messageId: data.id,
      attempts: message.attempts || 0,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to send email', error instanceof Error ? error : new Error(errorMessage), {
      emailId: message.id,
      to: message.to,
      subject: message.subject,
    })

    return {
      success: false,
      error: errorMessage,
      attempts: message.attempts || 0,
    }
  }
}

/**
 * Process single email from queue
 */
export async function processEmail(emailId: string): Promise<EmailDeliveryResult> {
  const email = emailQueue.get(emailId)

  if (!email) {
    return {
      success: false,
      error: 'Email not found in queue',
      attempts: 0,
    }
  }

  if (email.status === 'sent' || email.status === 'cancelled') {
    return {
      success: email.status === 'sent',
      attempts: email.attempts || 0,
    }
  }

  // Update status to sending
  email.status = 'sending'
  email.lastAttempt = new Date().toISOString()
  email.attempts = (email.attempts || 0) + 1

  // Send email
  const result = await sendEmail(email)

  if (result.success) {
    // Mark as sent
    email.status = 'sent'
    emailQueue.set(emailId, email)
  } else {
    // Check if we should retry
    if (email.attempts! < QUEUE_CONFIG.maxAttempts) {
      // Schedule retry
      const retryDelay = QUEUE_CONFIG.retryDelays[email.attempts! - 1] || QUEUE_CONFIG.retryDelays[QUEUE_CONFIG.retryDelays.length - 1]
      email.status = 'pending'
      email.nextAttempt = new Date(Date.now() + retryDelay).toISOString()

      logger.warn('Email queued for retry', {
        emailId,
        attempt: email.attempts,
        maxAttempts: QUEUE_CONFIG.maxAttempts,
        nextAttempt: email.nextAttempt,
        error: result.error,
      })
    } else {
      // Mark as failed after max attempts
      email.status = 'failed'

      logger.error('Email failed after max attempts', new Error(result.error || 'Unknown error'), {
        emailId,
        attempts: email.attempts,
        maxAttempts: QUEUE_CONFIG.maxAttempts,
      })
    }

    emailQueue.set(emailId, email)
  }

  return result
}

/**
 * Process batch of emails from queue
 */
export async function processEmailBatch(): Promise<EmailDeliveryResult[]> {
  const results: EmailDeliveryResult[] = []
  const now = Date.now()

  // Get emails ready to send
  const readyEmails = Array.from(emailQueue.entries())
    .filter(([_, email]) => {
      if (email.status !== 'pending') return false
      if (!email.nextAttempt) return true
      return new Date(email.nextAttempt).getTime() <= now
    })
    .slice(0, QUEUE_CONFIG.batchSize)

  if (readyEmails.length === 0) {
    return results
  }

  logger.info(`Processing ${readyEmails.length} emails from queue`)

  // Process each email
  for (const [emailId, _] of readyEmails) {
    const result = await processEmail(emailId)
    results.push(result)
  }

  // Clean up sent/failed emails older than 24 hours
  cleanupQueue()

  return results
}

/**
 * Clean up old emails from queue
 */
function cleanupQueue(): void {
  const now = Date.now()
  const cleanupThreshold = 24 * 60 * 60 * 1000 // 24 hours

  for (const [emailId, email] of emailQueue.entries()) {
    if (
      (email.status === 'sent' || email.status === 'failed') &&
      email.lastAttempt &&
      new Date(email.lastAttempt).getTime() < now - cleanupThreshold
    ) {
      emailQueue.delete(emailId)
      logger.debug('Cleaned up email from queue', { emailId, status: email.status })
    }
  }
}

/**
 * Get queue status
 */
export function getQueueStatus(): {
  total: number
  pending: number
  sending: number
  sent: number
  failed: number
} {
  const status = {
    total: emailQueue.size,
    pending: 0,
    sending: 0,
    sent: 0,
    failed: 0,
  }

  for (const email of emailQueue.values()) {
    if (email.status === 'pending') status.pending++
    else if (email.status === 'sending') status.sending++
    else if (email.status === 'sent') status.sent++
    else if (email.status === 'failed') status.failed++
  }

  return status
}

/**
 * Cancel email
 */
export function cancelEmail(emailId: string): boolean {
  const email = emailQueue.get(emailId)

  if (!email) {
    return false
  }

  if (email.status === 'sent') {
    return false
  }

  email.status = 'cancelled'
  emailQueue.set(emailId, email)

  logger.info('Email cancelled', { emailId, to: email.to, subject: email.subject })

  return true
}

/**
 * Retry failed email
 */
export function retryEmail(emailId: string): boolean {
  const email = emailQueue.get(emailId)

  if (!email || email.status !== 'failed') {
    return false
  }

  email.status = 'pending'
  email.attempts = 0
  email.nextAttempt = new Date().toISOString()
  emailQueue.set(emailId, email)

  logger.info('Email queued for retry', { emailId, to: email.to, subject: email.subject })

  return true
}

/**
 * Start email queue processor
 */
export function startEmailQueueProcessor(): NodeJS.Timeout {
  return setInterval(() => {
    processEmailBatch().catch(error => {
      logger.error('Error processing email batch', error instanceof Error ? error : new Error(String(error)))
    })
  }, QUEUE_CONFIG.batchInterval)
}

/**
 * Send email immediately (bypass queue)
 */
export async function sendEmailImmediate(message: Omit<EmailMessage, 'id' | 'status' | 'attempts'>): Promise<EmailDeliveryResult> {
  const email: EmailMessage = {
    ...message,
    id: generateEmailId(),
    status: 'sending',
    attempts: 1,
    lastAttempt: new Date().toISOString(),
  }

  return await sendEmail(email)
}

/**
 * Convenience functions for common email types
 */
export const EmailTemplates = {
  bookingConfirmation: (data: { bookingId: string; clientName: string; clientEmail: string; checkIn: string; checkOut: string }) => ({
    to: data.clientEmail,
    subject: 'Booking Confirmation - Heiwa House',
    html: `
      <h1>Booking Confirmed!</h1>
      <p>Dear ${data.clientName},</p>
      <p>Your booking has been confirmed.</p>
      <p><strong>Booking ID:</strong> ${data.bookingId}</p>
      <p><strong>Check-in:</strong> ${data.checkIn}</p>
      <p><strong>Check-out:</strong> ${data.checkOut}</p>
      <p>We look forward to seeing you!</p>
    `,
    text: `Booking Confirmed!\n\nBooking ID: ${data.bookingId}\nCheck-in: ${data.checkIn}\nCheck-out: ${data.checkOut}\n\nWe look forward to seeing you!`,
    metadata: { bookingId: data.bookingId, type: 'booking_confirmation' },
  }),

  bookingReminder: (data: { bookingId: string; clientName: string; clientEmail: string; checkIn: string }) => ({
    to: data.clientEmail,
    subject: 'Upcoming Stay Reminder - Heiwa House',
    html: `
      <h1>Reminder: Your Stay is Coming Up!</h1>
      <p>Dear ${data.clientName},</p>
      <p>This is a reminder that your stay at Heiwa House starts on ${data.checkIn}.</p>
      <p>We're excited to welcome you!</p>
    `,
    text: `Reminder: Your Stay is Coming Up!\n\nDear ${data.clientName},\n\nYour stay at Heiwa House starts on ${data.checkIn}.\n\nWe're excited to welcome you!`,
    metadata: { bookingId: data.bookingId, type: 'booking_reminder' },
  }),

  passwordReset: (data: { clientEmail: string; resetLink: string }) => ({
    to: data.clientEmail,
    subject: 'Password Reset - Heiwa House',
    html: `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <p><a href="${data.resetLink}">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
    `,
    text: `Password Reset Request\n\nClick the link below to reset your password:\n${data.resetLink}\n\nThis link will expire in 1 hour.`,
    metadata: { type: 'password_reset' },
  }),
}
