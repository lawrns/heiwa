// Individual Room API
// GET, PUT, DELETE operations for individual rooms

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/rooms/[id] - Get a specific room
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabaseAdmin
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching room:', error)
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { room: data }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/rooms/[id] - Update a specific room
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { 
      name, 
      capacity, 
      booking_type, 
      pricing, 
      amenities, 
      description, 
      images, 
      is_active, 
      bed_types,
      tax_category_id
    } = body

    // Validate required fields
    if (!name || !capacity || !booking_type || !pricing) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const updateData = {
      name,
      capacity,
      booking_type,
      pricing,
      amenities: amenities || [],
      description: description || '',
      images: images || [],
      is_active: is_active !== undefined ? is_active : true,
      bed_types: bed_types || [],
      tax_category_id: tax_category_id || null,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('rooms')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating room:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update room' },
        { status: 500 }
      )
    }

    // Revalidate rooms pages to reflect changes immediately
    revalidatePath('/rooms')
    revalidatePath(`/rooms/${id}`)
    revalidatePath('/admin/rooms')
    revalidatePath('/')  // Homepage may show rooms

    return NextResponse.json({
      success: true,
      data: { room: data }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/rooms/[id] - Delete a specific room
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await supabaseAdmin
      .from('rooms')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting room:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete room' },
        { status: 500 }
      )
    }

    // Revalidate rooms pages to reflect deletion immediately
    revalidatePath('/rooms')
    revalidatePath(`/rooms/${id}`)
    revalidatePath('/admin/rooms')
    revalidatePath('/')  // Homepage may show rooms

    return NextResponse.json({
      success: true,
      message: 'Room deleted successfully'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
