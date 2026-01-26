-- Unified Page Sections Table
-- Single source of truth for all CMS content across all pages

-- Drop old tables if they exist (after data migration)
-- DROP TABLE IF EXISTS homepage_content CASCADE;
-- DROP TABLE IF EXISTS homepage_sections CASCADE;
-- DROP TABLE IF EXISTS page_content CASCADE;

-- Create the unified page_sections table
CREATE TABLE IF NOT EXISTS page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug VARCHAR(50) NOT NULL,
  section_key VARCHAR(50) NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(page_slug, section_key)
);

-- Create index for fast page lookups
CREATE INDEX IF NOT EXISTS idx_page_sections_page_slug ON page_sections(page_slug);
CREATE INDEX IF NOT EXISTS idx_page_sections_active ON page_sections(is_active) WHERE is_active = true;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_page_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS page_sections_updated_at ON page_sections;
CREATE TRIGGER page_sections_updated_at
  BEFORE UPDATE ON page_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_page_sections_updated_at();

-- Enable RLS
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active sections
CREATE POLICY "Anyone can read active sections" ON page_sections
  FOR SELECT USING (is_active = true);

-- Policy: Authenticated users can do everything
CREATE POLICY "Authenticated users have full access" ON page_sections
  FOR ALL USING (auth.role() = 'authenticated');
