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

    // For minimal mode, just map the clients directly
    if (minimal) {
      const clientsWithStats = (clients || []).map((client: unknown) => {
        const c = client as {
          id: string
          name: string
          email: string
          phone: string
          created_at: string
          updated_at: string
        }
        return {
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          created_at: c.created_at,
          updated_at: c.updated_at,
        }
      })
      return NextResponse.json({
        success: true,
        clients: clientsWithStats,
      })
    }

    // For full mode, batch all booking queries in 2 queries instead of 2N queries
    // Batch query: Get all bookings at once and compute stats in memory
    const { data: allBookings } = await supabaseAdmin
      .from('bookings')
      .select('client_ids, total_amount, payment_status')

    // Build lookup maps from the single batch query
    const bookingCountMap = new Map<string, number>()
    const totalSpentMap = new Map<string, number>()

    for (const booking of allBookings || []) {
      const bookingClientIds = booking.client_ids || []
      for (const clientId of bookingClientIds) {
        // Count all bookings
        bookingCountMap.set(clientId, (bookingCountMap.get(clientId) || 0) + 1)
        // Sum paid bookings
        if (booking.payment_status === 'paid') {
          const amount = parseFloat(booking.total_amount) || 0
          totalSpentMap.set(clientId, (totalSpentMap.get(clientId) || 0) + amount)
        }
      }
    }

    // Map clients with stats from lookup maps (no additional queries)
    const clientsWithStats = (clients || []).map((client: unknown) => {
      const c = client as {
        id: string
        name: string
        email: string
        phone: string
        brand?: string
        registration_date?: string
        created_at: string
        last_booking_date?: string
        notes?: string
        vip?: boolean
        updated_at: string
      }
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        company: c.brand || null,
        totalBookings: bookingCountMap.get(c.id) || 0,
        totalSpent: totalSpentMap.get(c.id) || 0,
        joinDate: c.registration_date || c.created_at,
        lastBooking: c.last_booking_date || null,
        notes: c.notes || '',
        vip: c.vip || false,
        created_at: c.created_at,
        updated_at: c.updated_at,
      }
    })

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

