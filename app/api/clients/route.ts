import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET all clients
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const includeDeleted = searchParams.get('include_deleted') === 'true'

    let query = supabaseAdmin
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    // Filter out deleted clients unless explicitly requested
    if (!includeDeleted) {
      query = query.is('deleted_at', null)
    }

    const { data: clients, error } = await query

    if (error) {
      console.error('Error fetching clients:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch clients' },
        { status: 500 }
      )
    }

    // Apply search filter if provided
    let filteredClients = clients || []
    if (search) {
      const searchLower = search.toLowerCase()
      filteredClients = filteredClients.filter(
        (client: any) =>
          client.name?.toLowerCase().includes(searchLower) ||
          client.email?.toLowerCase().includes(searchLower) ||
          client.phone?.toLowerCase().includes(searchLower)
      )
    }

    // Calculate statistics for each client
    const clientsWithStats = await Promise.all(
      filteredClients.map(async (client: any) => {
        // Get booking count using count query (more efficient)
        const { count: totalBookings } = await supabaseAdmin
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .contains('client_ids', [client.id])

        // Get total spent from paid bookings only
        const { data: paidBookings } = await supabaseAdmin
          .from('bookings')
          .select('total_amount')
          .contains('client_ids', [client.id])
          .eq('payment_status', 'paid')

        const totalSpent =
          paidBookings
            ?.reduce((sum: number, b: any) => sum + (parseFloat(b.total_amount) || 0), 0) || 0

        return {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          company: client.brand || null,
          totalBookings,
          totalSpent,
          joinDate: client.registration_date || client.created_at,
          lastBooking: client.last_booking_date || null,
          notes: client.notes || '',
          vip: client.vip || false,
          created_at: client.created_at,
          updated_at: client.updated_at,
        }
      })
    )

    return NextResponse.json({
      success: true,
      clients: clientsWithStats,
    })
  } catch (error) {
    console.error('Error in clients GET API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new client
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, company, notes, vip } = body

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      )
    }

    const { data: client, error } = await supabaseAdmin
      .from('clients')
      .insert([
        {
          name,
          email,
          phone: phone || '',
          brand: company || 'Heiwa House',
          notes: notes || '',
          vip: vip || false,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating client:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create client' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      client,
    })
  } catch (error) {
    console.error('Error in clients POST API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

