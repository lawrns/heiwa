import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET single client
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: client, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching client:', error)
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    // Get booking statistics
    const { data: bookings } = await supabaseAdmin
      .from('bookings')
      .select('id, total_amount, payment_status, created_at')
      .contains('client_ids', [id])
      .order('created_at', { ascending: false })

    const totalBookings = bookings?.length || 0
    const totalSpent =
      bookings
        ?.filter((b: any) => b.payment_status === 'paid')
        .reduce((sum: number, b: any) => sum + (parseFloat(b.total_amount) || 0), 0) || 0

    return NextResponse.json({
      success: true,
      client: {
        ...client,
        totalBookings,
        totalSpent,
        lastBooking: bookings?.[0]?.created_at || client.last_booking_date,
      },
    })
  } catch (error) {
    console.error('Error in client GET API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update client
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const { data: client, error } = await supabaseAdmin
      .from('clients')
      .update({
        name: body.name,
        email: body.email,
        phone: body.phone,
        brand: body.company || body.brand,
        notes: body.notes,
        vip: body.vip || false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating client:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update client' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      client,
    })
  } catch (error) {
    console.error('Error in client PUT API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Soft delete client
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabaseAdmin
      .from('clients')
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error('Error deleting client:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete client' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully',
    })
  } catch (error) {
    console.error('Error in client DELETE API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

