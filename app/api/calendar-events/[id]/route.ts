// Calendar Event API - Individual event operations

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/calendar-events/[id] - Get a specific event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Use calendar_events table for consistency with the main route
    const { data, error } = await supabaseAdmin
      .from('calendar_events')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Event not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching event:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch event' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { event: data }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/calendar-events/[id] - Update an event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Check if this is a generated event ID (booking-*, camp-*, booking-surf-*)
    // These events are derived from bookings/surf camps and shouldn't be updated directly
    if (id.startsWith('booking-') || id.startsWith('camp-')) {
      return NextResponse.json(
        { success: false, error: 'Cannot update booking/camp events directly. Use the bookings page instead.' },
        { status: 400 }
      )
    }

    // Use calendar_events table for consistency
    const { data, error } = await supabaseAdmin
      .from('calendar_events')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating event:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update event' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { event: data }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/calendar-events/[id] - Delete an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if this is a generated event ID (booking-*, camp-*, booking-surf-*)
    // These events are derived from bookings/surf camps and shouldn't be deleted directly
    if (id.startsWith('booking-') || id.startsWith('camp-')) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete booking/camp events directly. Use the bookings page instead.' },
        { status: 400 }
      )
    }

    // Use calendar_events table for consistency
    const { error } = await supabaseAdmin
      .from('calendar_events')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting event:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete event' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}











