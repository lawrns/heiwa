-- Migration: Fix pages_meta RLS policies to allow service role access
-- Date: 2025-12-29
-- Issue: SEO settings fail to save because RLS policies block service role writes

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow admin write" ON pages_meta;
DROP POLICY IF EXISTS "Allow admin update" ON pages_meta;
DROP POLICY IF EXISTS "Allow admin delete" ON pages_meta;

-- Create policy that allows all operations (service role bypasses RLS anyway,
-- but this ensures consistency and allows authenticated users to also write)
CREATE POLICY "pages_meta_full_access" ON pages_meta
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled but permissive
ALTER TABLE pages_meta ENABLE ROW LEVEL SECURITY;
