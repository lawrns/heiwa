import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/admin-auth'

/**
 * Aggregated Booking Statistics Endpoint
 * 
 * Returns booking statistics without fetching all booking records.
 * Uses SQL aggregation for efficient calculation.
 */
export async function GET(request: NextRequest) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]
    
    // Calculate first day of current month
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const firstDayOfMonthStr = firstDayOfMonth.toISOString().split('T')[0]
    
    // Calculate first day of last month
    const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const firstDayOfLastMonthStr = firstDayOfLastMonth.toISOString().split('T')[0]
    
    // Calculate last day of last month
    const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
    const lastDayOfLastMonthStr = lastDayOfLastMonth.toISOString().split('T')[0]

    // Use manual aggregation (RPC function doesn't exist yet)
    // This is still much more efficient than fetching all bookings
    // Fallback: Use multiple queries for aggregation
      const [
        totalBookingsResult,
        confirmedBookingsResult,
        pendingBookingsResult,
        cancelledBookingsResult,
        totalRevenueResult,
        thisMonthBookingsResult,
        lastMonthBookingsResult,
        thisMonthRevenueResult,
        lastMonthRevenueResult,
        recentBookingsResult,
        clientsCountResult,
        roomsCountResult,
        activeCampsCountResult,
      ] = await Promise.all([
        // Total bookings count
        supabaseAdmin.from('bookings').select('id', { count: 'exact', head: true }),
        // Confirmed bookings count
        supabaseAdmin.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'confirmed'),
        // Pending bookings count
        supabaseAdmin.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        // Cancelled bookings count
        supabaseAdmin.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'cancelled'),
        // Total revenue (sum of all booking amounts)
        supabaseAdmin.from('bookings').select('total_amount'),
        // This month bookings
        supabaseAdmin.from('bookings').select('id', { count: 'exact', head: true })
          .gte('created_at', firstDayOfMonthStr),
        // Last month bookings
        supabaseAdmin.from('bookings').select('id', { count: 'exact', head: true })
          .gte('created_at', firstDayOfLastMonthStr)
          .lt('created_at', firstDayOfMonthStr),
        // This month revenue
        supabaseAdmin.from('bookings').select('total_amount')
          .gte('created_at', firstDayOfMonthStr),
        // Last month revenue
        supabaseAdmin.from('bookings').select('total_amount')
          .gte('created_at', firstDayOfLastMonthStr)
          .lt('created_at', firstDayOfMonthStr),
        // Recent bookings (last 5, ordered by created_at desc)
        // We'll need to transform these to get guest_name and item_name
        supabaseAdmin.from('bookings')
          .select('id, client_ids, room_type, check_in, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
        // Clients count
        supabaseAdmin.from('clients').select('*', { count: 'exact', head: true }).is('deleted_at', null),
        // Rooms count
        supabaseAdmin.from('rooms').select('*', { count: 'exact', head: true }).eq('is_active', true),
        // Active surf camps count
        supabaseAdmin.from('surf_camps').select('*', { count: 'exact', head: true })
          .eq('is_active', true)
          .gte('end_date', todayStr),
      ])

      // Calculate totals
      const totalBookings = totalBookingsResult.count || 0
      const confirmedCount = confirmedBookingsResult.count || 0
      const pendingCount = pendingBookingsResult.count || 0
      const cancelledCount = cancelledBookingsResult.count || 0
      
      // Calculate revenue
      const totalRevenue = (totalRevenueResult.data || []).reduce(
        (sum: number, b: any) => sum + (parseFloat(b.total_amount) || 0),
        0
      )
      
      // Calculate month-over-month growth
      const thisMonthBookings = thisMonthBookingsResult.count || 0
      const lastMonthBookings = lastMonthBookingsResult.count || 0
      const bookingGrowth = lastMonthBookings > 0
        ? Math.round(((thisMonthBookings - lastMonthBookings) / lastMonthBookings) * 100)
        : 0
      
      // Calculate revenue growth
      const thisMonthRevenue = (thisMonthRevenueResult.data || []).reduce(
        (sum: number, b: any) => sum + (parseFloat(b.total_amount) || 0),
        0
      )
      const lastMonthRevenue = (lastMonthRevenueResult.data || []).reduce(
        (sum: number, b: any) => sum + (parseFloat(b.total_amount) || 0),
        0
      )
      const revenueGrowth = lastMonthRevenue > 0
        ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
        : 0
      
      // Transform recent bookings - fetch client names
      const recentBookingsData = recentBookingsResult.data || []
      const recentBookingClientIds = new Set<string>()
      recentBookingsData.forEach((b: any) => {
        if (b.client_ids && Array.isArray(b.client_ids)) {
          b.client_ids.forEach((id: string) => recentBookingClientIds.add(id))
        }
      })
      
      // Fetch clients for recent bookings
      let clientMap = new Map<string, { name: string }>()
      if (recentBookingClientIds.size > 0) {
        const { data: clients } = await supabaseAdmin
          .from('clients')
          .select('id, name')
          .in('id', Array.from(recentBookingClientIds))
        
        if (clients) {
          clients.forEach((c: any) => {
            clientMap.set(c.id, { name: c.name || 'Unknown' })
          })
        }
      }
      
      // Transform recent bookings
      const recentBookings = recentBookingsData.map((b: any) => {
        const clientId = b.client_ids && Array.isArray(b.client_ids) && b.client_ids.length > 0 
          ? b.client_ids[0] 
          : null
        const client = clientId ? clientMap.get(clientId) : null
        
        return {
          id: b.id.substring(0, 8) + '...',
          guest: client?.name || 'Unknown',
          room: b.room_type || 'Surf Camp',
          checkIn: b.check_in ? new Date(b.check_in).toLocaleDateString() : 'N/A',
          status: b.status || 'pending'
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          stats: {
            totalBookings,
            confirmedCount,
            pendingCount,
            cancelledCount,
            totalRevenue,
            bookingGrowth,
            revenueGrowth,
            thisMonthBookings,
            lastMonthBookings,
            thisMonthRevenue,
            lastMonthRevenue,
          },
          recentBookings,
          counts: {
            clients: clientsCountResult.count || 0,
            rooms: roomsCountResult.count || 0,
            activeSurfCamps: activeCampsCountResult.count || 0,
          }
        }
      })
  } catch (error) {
    console.error('Error fetching aggregated stats:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

