import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
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
      console.error('Error storing contact submission:', error)
      // If table doesn't exist, still return success (we can log/email instead)
      if (error.code === '42P01') {
        console.log('Contact submissions table does not exist, logging instead:', {
          name, email, phone, subject, message
        })
        // In production, you would send an email here
        return NextResponse.json({
          success: true,
          message: 'Message received! We will get back to you soon.'
        })
      }
      return NextResponse.json(
        { success: false, error: 'Failed to submit message. Please try again.' },
        { status: 500 }
      )
    }

    // TODO: Send email notification to admin
    // In production, integrate with email service (Resend, SendGrid, etc.)

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
