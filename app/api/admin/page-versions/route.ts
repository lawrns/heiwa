import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const pageSlug = searchParams.get('page_slug')

    if (!pageSlug) {
      return NextResponse.json({ success: false, error: 'page_slug is required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('page_versions' as any)
      .select('*')
      .eq('page_slug', pageSlug)
      .order('version', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, versions: data || [] })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const { page_slug, content, notes } = body || {}

    if (!page_slug || content === undefined) {
      return NextResponse.json({ success: false, error: 'page_slug and content are required' }, { status: 400 })
    }

    const { data: existingVersions, error: fetchError } = await supabaseAdmin
      .from('page_versions' as any)
      .select('version' as any)
      .eq('page_slug', page_slug)
      .order('version', { ascending: false })
      .limit(1)

    if (fetchError) {
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 })
    }

    const nextVersion = ((existingVersions as any[])?.[0]?.version || 0) + 1

    const { data, error } = await supabaseAdmin
      .from('page_versions' as any)
      .insert({
        page_slug,
        content,
        version: nextVersion,
        created_by: 'admin',
        notes: notes || `Version ${nextVersion}`,
      } as any)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, version: data })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('page_versions' as any)
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

