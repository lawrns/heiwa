import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    const [
      clientsCountResult,
      roomsCountResult,
      activeCampsCountResult,
    ] = await Promise.all([
      supabaseAdmin.from('clients').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      supabaseAdmin.from('rooms').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabaseAdmin.from('surf_camps').select('*', { count: 'exact', head: true }).eq('is_active', true).gte('end_date', todayStr),
    ])

    if (clientsCountResult.error) {
      return NextResponse.json({ success: false, error: 'Failed to count clients' }, { status: 500 })
    }
    if (roomsCountResult.error) {
      return NextResponse.json({ success: false, error: 'Failed to count rooms' }, { status: 500 })
    }
    if (activeCampsCountResult.error) {
      return NextResponse.json({ success: false, error: 'Failed to count surf camps' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        clients: clientsCountResult.count || 0,
        rooms: roomsCountResult.count || 0,
        activeSurfCamps: activeCampsCountResult.count || 0,
      }
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

