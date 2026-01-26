import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/admin-auth'

interface PageVersion {
  id: string
  page_slug: string
  content: string
  version: number
  created_by: string
  notes?: string
  created_at: string
}

interface PageVersionCreateData {
  page_slug: string
  content: string
  version: number
  created_by: string
  notes?: string
}

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
      .from('page_versions')
      .select('*')
      .eq('page_slug', pageSlug)
      .order('version', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, versions: data || [] })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
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
      .from('page_versions')
      .select('version')
      .eq('page_slug', page_slug)
      .order('version', { ascending: false })
      .limit(1)

    if (fetchError) {
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 })
    }

    const nextVersion = ((existingVersions as PageVersion[])?.[0]?.version || 0) + 1

    const { data, error } = await supabaseAdmin
      .from('page_versions')
      .insert({
        page_slug,
        content,
        version: nextVersion,
        created_by: 'admin',
        notes: notes || `Version ${nextVersion}`,
      } as PageVersionCreateData)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, version: data })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
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
      .from('page_versions')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

