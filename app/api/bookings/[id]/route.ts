// Booking API - Individual booking operations

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import type { Booking, UpdateBooking } from '@/lib/database.types'
import type { Participant } from '@/lib/types/api.types'
import { requireAdminAuth } from '@/lib/admin-auth'

// GET /api/bookings/[id] - Get a specific booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authError = requireAdminAuth(request)
    if (authError) return authError

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Booking not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching booking:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch booking' },
        { status: 500 }
      )
    }

    // Fetch client details
    let guestName = 'Unknown'
    let guestEmail = ''
    let guestPhone = ''
    let clientNotes = ''

    if (data.client_ids && data.client_ids.length > 0) {
      const firstClientId = data.client_ids[0]
      const { data: client } = await supabaseAdmin
        .from('clients')
        .select('id, name, email, phone, notes')
        .eq('id', firstClientId)
        .single()

      if (client) {
        guestName = client.name || 'Unknown'
        guestEmail = client.email || ''
        guestPhone = client.phone || ''
        clientNotes = client.notes || ''
      }
    }

    // Parse notes to extract dietary preferences
    let dietaryPreferences = ''
    let specialRequests = data.notes || ''

    try {
      const notesData = data.notes ? JSON.parse(data.notes) : null
      if (notesData && typeof notesData === 'object') {
        dietaryPreferences = notesData.dietaryRequirements || notesData.dietary || notesData.diet || ''
        specialRequests = notesData.specialRequests || notesData.requests || notesData.message || data.notes || ''
      } else if (data.notes) {
        const notesLower = data.notes.toLowerCase()
        if (notesLower.includes('diet') || notesLower.includes('vegetarian') || notesLower.includes('vegan') || notesLower.includes('gluten')) {
          specialRequests = data.notes
        }
      }
    } catch {
      specialRequests = data.notes || ''
    }

    // Transform to admin UI format
    const transformedBooking = {
      id: data.id,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      type: data.room_type ? 'room' : 'surf_camp',
      item_name: data.room_type || 'Unknown',
      check_in: data.check_in || '',
      check_out: data.check_out || '',
      guests: data.guests || 1,
      total_price: data.total_amount || 0,
      status: data.status || 'pending',
      payment_status: data.payment_status || 'pending',
      created_at: data.created_at,
      special_requests: specialRequests,
      dietary_preferences: dietaryPreferences,
      client_notes: clientNotes,
      notes: data.notes || ''
    }

    return NextResponse.json({
      success: true,
      data: { booking: transformedBooking }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/bookings/[id] - Update a booking
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authError = requireAdminAuth(request)
    if (authError) return authError

    const body = await request.json()

    // Get the existing booking first
    const { data: existingBooking, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existingBooking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Transform admin UI format back to database format
    // The bookings table uses: room_type, check_in, check_out, guests, total_amount, status, payment_status, notes
    const updateData: UpdateBooking = {
      updated_at: new Date().toISOString()
    }

    // Update status if provided
    if (body.status !== undefined) {
      updateData.status = body.status
    }

    // Update payment_status if provided
    if (body.payment_status !== undefined) {
      updateData.payment_status = body.payment_status
    }

    // Update total_amount if provided
    if (body.total_price !== undefined) {
      updateData.total_amount = body.total_price
    }

    // Update notes if provided (preserve JSON structure if it exists)
    if (body.special_requests !== undefined) {
      // If existing notes are JSON, try to preserve structure
      try {
        const existingNotes = existingBooking.notes ? JSON.parse(existingBooking.notes) : null
        if (existingNotes && typeof existingNotes === 'object' && existingNotes.participants) {
          // Preserve JSON structure, only update if it's a simple string
          // Don't overwrite JSON notes with plain text
          console.log('Preserving JSON notes structure')
        } else {
          // Plain text notes, update normally
          updateData.notes = body.special_requests
        }
      } catch {
        // Not JSON, update as plain text
        updateData.notes = body.special_requests
      }
    }

    // Update room_type if provided (for room bookings)
    if (body.type === 'room' && body.item_name !== undefined) {
      updateData.room_type = body.item_name
    } else if (body.type === 'surf_camp') {
      // Surf camp bookings have room_type = null
      updateData.room_type = null
    }

    // Update check_in if provided
    if (body.check_in !== undefined) {
      updateData.check_in = body.check_in
    }

    // Update check_out if provided
    if (body.check_out !== undefined) {
      updateData.check_out = body.check_out
    }

    // Update guests if provided
    if (body.guests !== undefined) {
      updateData.guests = body.guests
    }

    // Update booking
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating booking:', error)
      console.error('Update data attempted:', updateData)
      return NextResponse.json(
        { success: false, error: 'Failed to update booking', details: error.message },
        { status: 500 }
      )
    }

    // Fetch client details for response transformation
    let guestName = 'Unknown'
    let guestEmail = ''
    let guestPhone = ''

    if (data.client_ids && data.client_ids.length > 0) {
      const firstClientId = data.client_ids[0]
      const { data: client } = await supabaseAdmin
        .from('clients')
        .select('id, name, email, phone')
        .eq('id', firstClientId)
        .single()

      if (client) {
        guestName = client.name || 'Unknown'
        guestEmail = client.email || ''
        guestPhone = client.phone || ''
      }
    }

    // Parse notes for special requests
    let specialRequests = data.notes || ''
    try {
      const notesData = data.notes ? JSON.parse(data.notes) : null
      if (notesData && typeof notesData === 'object' && notesData.participants) {
        // JSON format with participants - aggregate special requests
        specialRequests = notesData.participants
          .map((p: Participant) => p.specialRequests)
          .filter(Boolean)
          .join('\n\n')
      }
    } catch {
      // Not JSON, use as-is
      specialRequests = data.notes || ''
    }

    // Transform response back to admin UI format
    const transformedBooking = {
      id: data.id,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      type: data.room_type ? 'room' : 'surf_camp',
      item_name: data.room_type || 'Unknown',
      check_in: data.check_in || '',
      check_out: data.check_out || '',
      guests: data.guests || 1,
      total_price: data.total_amount || 0,
      status: data.status || 'pending',
      payment_status: data.payment_status || 'pending',
      created_at: data.created_at,
      special_requests: specialRequests,
      notes: data.notes || ''
    }

    return NextResponse.json({
      success: true,
      data: { booking: transformedBooking }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/bookings/[id] - Partial update of a booking (e.g., status change)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authError = requireAdminAuth(request)
    if (authError) return authError

    const body = await request.json()

    // Get the existing booking first
    const { data: existingBooking, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existingBooking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Build partial update object - only update provided fields
    const updateData: UpdateBooking = {
      updated_at: new Date().toISOString()
    }

    if (body.status !== undefined) {
      updateData.status = body.status
    }
    if (body.payment_status !== undefined) {
      updateData.payment_status = body.payment_status
    }
    if (body.notes !== undefined) {
      updateData.notes = body.notes
    }

    // Update booking
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating booking:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update booking' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { booking: data }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/bookings/[id] - Delete a booking (with cascade to related records)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authError = requireAdminAuth(request)
    if (authError) return authError

    // Step 1: Delete room_assignments related to this booking
    const { error: roomAssignmentError } = await supabaseAdmin
      .from('room_assignments')
      .delete()
      .eq('booking_id', id)

    if (roomAssignmentError) {
      console.error('Error deleting room assignments:', roomAssignmentError)
      // Continue anyway - room assignments might not exist
    }

    // Step 2: Delete surf_camp_enrollments related to this booking
    const { error: enrollmentError } = await supabaseAdmin
      .from('surf_camp_enrollments')
      .delete()
      .eq('booking_id', id)

    if (enrollmentError) {
      console.error('Error deleting enrollments:', enrollmentError)
      // Continue anyway - enrollments might not exist
    }

    // Step 3: Delete the booking itself
    const { error } = await supabaseAdmin
      .from('bookings')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting booking:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete booking: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Booking and related records deleted successfully'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
