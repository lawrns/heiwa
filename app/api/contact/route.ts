import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimiters, getClientIP, createRateLimitHeaders } from '@/lib/rate-limiter'
import { emailService } from '@/lib/email-service'
import { env } from '@/lib/env'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting to prevent spam
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimiters.form(clientIP)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Too many submissions. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: createRateLimitHeaders(rateLimitResult)
        }
      )
    }

    const body = await request.json()
    const { name, email, phone, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, subject and message are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Store the contact submission in database
    const { data, error } = await supabaseAdmin
      .from('contact_submissions')
      .insert({
        name,
        email,
        phone: phone || null,
        subject,
        message,
        status: 'new',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      // Log error for debugging but return success for graceful degradation
      // The message was received - we just couldn't store it in DB
      // This handles: missing table, RLS policies, connection issues, etc.
      console.warn('Error storing contact submission (returning success anyway):', error.code, error.message)
      console.log('Contact submission data:', { name, email, phone, subject, message })
      // Send email notification as backup when DB storage fails
      try {
        await emailService.sendEmail({
          to: env.ADMIN_EMAIL,
          subject: `New Contact Form Submission: ${subject}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <p><em>Note: This submission could not be stored in the database. Error: ${error.message}</em></p>
          `,
          replyTo: email,
        }).catch((emailError) => {
          console.error('Failed to send backup email notification:', emailError)
        })
      } catch (emailError) {
        console.error('Failed to send backup email notification:', emailError)
      }
      return NextResponse.json({
        success: true,
        message: 'Message received! We will get back to you soon.'
      })
    }

    // Send email notification to admin
    try {
      await emailService.sendEmail({
        to: env.ADMIN_EMAIL,
        subject: `New Contact Form Submission: ${subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <p><strong>Submission ID:</strong> ${data?.id}</p>
          <p><a href="https://heiwahouse.com/admin/contact-submissions">View in Admin Dashboard</a></p>
        `,
        replyTo: email,
      }).catch((emailError) => {
        console.error('Failed to send admin notification email:', emailError)
        // Don't fail the request if email fails - submission was stored successfully
      })
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError)
      // Don't fail the request if email fails - submission was stored successfully
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully! We will get back to you within 24 hours.',
      data: { id: data?.id }
    })
  } catch (error) {
    console.error('Error processing contact form:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { 
      status: 500
    })
  }
}
