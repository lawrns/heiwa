import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/admin-auth'

// GET all clients
export async function GET(request: NextRequest) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const includeDeleted = searchParams.get('include_deleted') === 'true'
    const minimal = searchParams.get('minimal') === 'true'
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? Math.min(500, Math.max(1, parseInt(limitParam))) : undefined

    let query = supabaseAdmin
      .from('clients')
      .select(minimal ? 'id,name,email,phone,created_at,updated_at' : '*')
      .order('created_at', { ascending: false })

    // Filter out deleted clients unless explicitly requested
    if (!includeDeleted) {
      query = query.is('deleted_at', null)
    }

    // Apply server-side search when provided
    if (search && search.trim()) {
      const s = search.trim()
      query = query.or(`name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%`)
    }

    if (limit) {
      query = query.limit(limit)
    }

    const { data: clients, error } = await query

    if (error) {
      console.error('Error fetching clients:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch clients' },
        { status: 500 }
      )
    }

    const clientsWithStats = minimal
      ? (clients || []).map((client: any) => ({
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          created_at: client.created_at,
          updated_at: client.updated_at,
        }))
      : await Promise.all(
          (clients || []).map(async (client: any) => {
            const { count: totalBookings } = await supabaseAdmin
              .from('bookings')
              .select('*', { count: 'exact', head: true })
              .contains('client_ids', [client.id])

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
  const authError = requireAdminAuth(request)
  if (authError) return authError

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

