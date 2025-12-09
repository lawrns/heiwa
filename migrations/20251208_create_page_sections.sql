-- Migration: Create page_sections table for WYSIWYG CMS
-- This replaces the messy page_content table with a cleaner schema

-- Create the new page_sections table
CREATE TABLE IF NOT EXISTS page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug VARCHAR(50) NOT NULL,
  section_type VARCHAR(50) NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE page_sections IS 'CMS page sections with structured JSON content';
COMMENT ON COLUMN page_sections.page_slug IS 'Page identifier (flow, play, surf, etc.)';
COMMENT ON COLUMN page_sections.section_type IS 'Section type (hero, intro, activity_highlight, etc.)';
COMMENT ON COLUMN page_sections.content IS 'Structured JSON content specific to section_type';
COMMENT ON COLUMN page_sections.order_index IS 'Display order within the page';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_page_sections_slug ON page_sections(page_slug);
CREATE INDEX IF NOT EXISTS idx_page_sections_active ON page_sections(page_slug, is_active);
CREATE INDEX IF NOT EXISTS idx_page_sections_order ON page_sections(page_slug, order_index);

-- Enable RLS
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read active sections" ON page_sections;
DROP POLICY IF EXISTS "Admin full access" ON page_sections;
DROP POLICY IF EXISTS "service_role_full_access" ON page_sections;

-- Create policies
CREATE POLICY "Public read active sections" ON page_sections
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin full access" ON page_sections
  FOR ALL USING (true);

CREATE POLICY "service_role_full_access" ON page_sections
  FOR ALL USING (true) WITH CHECK (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_page_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_page_sections_updated_at ON page_sections;
CREATE TRIGGER update_page_sections_updated_at
  BEFORE UPDATE ON page_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_page_sections_updated_at();
