-- Migration: Add Row Level Security policies to CMS tables
-- Critical security fix: Enable RLS on all CMS tables

-- Enable RLS on CMS tables
ALTER TABLE IF EXISTS homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cms_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for active homepage content" ON homepage_content;
DROP POLICY IF EXISTS "Service role full access to homepage content" ON homepage_content;
DROP POLICY IF EXISTS "Public read access for active page sections" ON page_sections;
DROP POLICY IF EXISTS "Service role full access to page sections" ON page_sections;
DROP POLICY IF EXISTS "Service role full access to page versions" ON page_versions;
DROP POLICY IF EXISTS "Public read access for active media" ON media_library;
DROP POLICY IF EXISTS "Service role full access to media library" ON media_library;
DROP POLICY IF EXISTS "Public read access to CMS settings" ON cms_settings;
DROP POLICY IF EXISTS "Service role full access to CMS settings" ON cms_settings;

-- Homepage Content Policies
CREATE POLICY "Public read access for active homepage content"
ON homepage_content FOR SELECT
USING (is_active = true);

CREATE POLICY "Service role full access to homepage content"
ON homepage_content FOR ALL
USING (auth.role() = 'service_role');

-- Page Sections Policies
CREATE POLICY "Public read access for active page sections"
ON page_sections FOR SELECT
USING (is_active = true);

CREATE POLICY "Service role full access to page sections"
ON page_sections FOR ALL
USING (auth.role() = 'service_role');

-- Page Versions Policies (admin only)
CREATE POLICY "Service role full access to page versions"
ON page_versions FOR ALL
USING (auth.role() = 'service_role');

-- Media Library Policies
CREATE POLICY "Public read access for active media"
ON media_library FOR SELECT
USING (is_active = true);

CREATE POLICY "Service role full access to media library"
ON media_library FOR ALL
USING (auth.role() = 'service_role');

-- CMS Settings Policies
CREATE POLICY "Public read access to CMS settings"
ON cms_settings FOR SELECT
USING (true);

CREATE POLICY "Service role full access to CMS settings"
ON cms_settings FOR ALL
USING (auth.role() = 'service_role');

-- Add helpful comments
COMMENT ON POLICY "Public read access for active homepage content" ON homepage_content IS 
'Allows public to read active homepage content only';

COMMENT ON POLICY "Service role full access to homepage content" ON homepage_content IS 
'Allows service role (API) full CRUD access to homepage content';

COMMENT ON POLICY "Public read access for active page sections" ON page_sections IS 
'Allows public to read active page sections only';

COMMENT ON POLICY "Service role full access to page sections" ON page_sections IS 
'Allows service role (API) full CRUD access to page sections';
