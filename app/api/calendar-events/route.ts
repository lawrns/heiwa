// Calendar Events API
// CRUD operations for calendar events

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/calendar-events - Get all calendar events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    let query = supabaseAdmin
      .from('external_calendar_events')
      .select('*')
      .order('start_date', { ascending: true })

    if (startDate) {
      query = query.gte('start_date', startDate)
    }
    if (endDate) {
      query = query.lte('end_date', endDate)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching calendar events:', error)
      // Check if table doesn't exist (common error code)
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return NextResponse.json({
          success: true,
          data: { events: [] },
          message: 'Calendar events table not configured'
        })
      }
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch calendar events',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { events: data || [] }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/calendar-events - Create a new calendar event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, start_date, end_date, event_type, location, color } = body

    if (!title || !start_date) {
      return NextResponse.json(
        { success: false, error: 'title and start_date are required' },
        { status: 400 }
      )
    }

    const event = {
      title,
      description: description || null,
      start_date,
      end_date: end_date || start_date,
      event_type: event_type || 'general',
      location: location || null,
      color: color || '#3B82F6',
    }

    const { data, error } = await supabaseAdmin
      .from('external_calendar_events')
      .insert(event)
      .select()
      .single()

    if (error) {
      console.error('Error creating calendar event:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create calendar event' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { event: data }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating calendar event:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create calendar event' },
      { status: 500 }
    )
  }
}


