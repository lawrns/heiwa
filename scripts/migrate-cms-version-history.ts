/**
 * Migration script: Create CMS version history tables
 * Run with: npx tsx scripts/migrate-cms-version-history.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pguipwhrxdzzrndbluxb.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('Running CMS version history migration...')

  // Check if page_section_versions exists
  const { error: checkVersions } = await supabase
    .from('page_section_versions')
    .select('id')
    .limit(1)

  if (checkVersions?.code === '42P01') {
    console.log('page_section_versions table does not exist')
    console.log('\nPlease run the following SQL in Supabase SQL Editor:\n')
    console.log(`
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
    `)
  } else {
    console.log('✓ page_section_versions table exists')
  }

  // Check if page_section_defaults exists
  const { error: checkDefaults } = await supabase
    .from('page_section_defaults')
    .select('id')
    .limit(1)

  if (checkDefaults?.code === '42P01') {
    console.log('page_section_defaults table does not exist')
  } else {
    console.log('✓ page_section_defaults table exists')
  }

  console.log('\nMigration check complete.')
}

runMigration().catch(console.error)
