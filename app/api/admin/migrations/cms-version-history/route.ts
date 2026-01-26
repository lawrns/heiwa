// Migration: Add CMS version history and defaults tables
// Run once via POST /api/admin/migrations/cms-version-history

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

  try {
    // Create page_section_versions table for version history
    const { error: versionsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS page_section_versions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          section_id UUID NOT NULL REFERENCES page_sections(id) ON DELETE CASCADE,
          content JSONB NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          created_by TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_page_section_versions_section_id
        ON page_section_versions(section_id);

        CREATE INDEX IF NOT EXISTS idx_page_section_versions_created_at
        ON page_section_versions(created_at DESC);
      `
    })

    if (versionsError) {
      // Try alternative: direct SQL via raw query
      const { error: altError1 } = await supabaseAdmin
        .from('page_section_versions')
        .select('id')
        .limit(1)

      // If table doesn't exist, we need to create it via Supabase dashboard
      if (altError1?.code === '42P01') {
        return NextResponse.json({
          success: false,
          error: 'Table does not exist. Please run migration via Supabase SQL Editor.',
          sql: `
-- Run this in Supabase SQL Editor:

-- Version history table
CREATE TABLE IF NOT EXISTS page_section_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES page_sections(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_page_section_versions_section_id
ON page_section_versions(section_id);

CREATE INDEX IF NOT EXISTS idx_page_section_versions_created_at
ON page_section_versions(created_at DESC);

-- Defaults table for reset functionality
CREATE TABLE IF NOT EXISTS page_section_defaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug VARCHAR(100) NOT NULL,
  section_type VARCHAR(100) NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_slug, section_type)
);

CREATE INDEX IF NOT EXISTS idx_page_section_defaults_lookup
ON page_section_defaults(page_slug, section_type);
          `
        }, { status: 400 })
      }
    }

    // Create page_section_defaults table
    const { error: defaultsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS page_section_defaults (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          page_slug VARCHAR(100) NOT NULL,
          section_type VARCHAR(100) NOT NULL,
          content JSONB NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(page_slug, section_type)
        );

        CREATE INDEX IF NOT EXISTS idx_page_section_defaults_lookup
        ON page_section_defaults(page_slug, section_type);
      `
    })

    return NextResponse.json({
      success: true,
      message: 'CMS version history tables created successfully',
      versionsError: versionsError?.message,
      defaultsError: defaultsError?.message,
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { success: false, error: 'Migration failed', details: String(error) },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

  // Check if tables exist
  try {
    const { error: versionsCheck } = await supabaseAdmin
      .from('page_section_versions')
      .select('id')
      .limit(1)

    const { error: defaultsCheck } = await supabaseAdmin
      .from('page_section_defaults')
      .select('id')
      .limit(1)

    return NextResponse.json({
      success: true,
      tables: {
        page_section_versions: !versionsCheck || versionsCheck.code !== '42P01',
        page_section_defaults: !defaultsCheck || defaultsCheck.code !== '42P01',
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
