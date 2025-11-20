// Booking API - Individual booking operations

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/bookings/[id] - Get a specific booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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
    const firstItem = existingBooking.items?.[0] || {}
    const updatedItems = [{
      ...firstItem,
      type: body.type || firstItem.type,
      itemId: body.item_name || firstItem.itemId,
      quantity: body.guests || firstItem.quantity,
      dates: {
        checkIn: body.check_in || firstItem.dates?.checkIn,
        checkOut: body.check_out || firstItem.dates?.checkOut
      }
    }]

    // Build update object
    const updateData: any = {
      status: body.status || existingBooking.status,
      payment_status: body.payment_status || existingBooking.payment_status,
      total_amount: body.total_price !== undefined ? body.total_price : existingBooking.total_amount,
      notes: body.special_requests !== undefined ? body.special_requests : existingBooking.notes,
      items: updatedItems,
      updated_at: new Date().toISOString()
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

    // Transform response back to admin UI format
    const updatedFirstItem = data.items?.[0]
    const transformedBooking = {
      id: data.id,
      guest_name: data.guest_name || 'Unknown',
      guest_email: data.guest_email || '',
      guest_phone: data.guest_phone || '',
      type: updatedFirstItem?.type || 'room',
      item_name: updatedFirstItem?.itemId || 'Unknown',
      check_in: updatedFirstItem?.dates?.checkIn || '',
      check_out: updatedFirstItem?.dates?.checkOut || '',
      guests: updatedFirstItem?.quantity || 1,
      total_price: data.total_amount || 0,
      status: data.status || 'pending',
      payment_status: data.payment_status || 'pending',
      created_at: data.created_at,
      special_requests: data.notes || ''
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

// DELETE /api/bookings/[id] - Delete a booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabaseAdmin
      .from('bookings')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting booking:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete booking' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

