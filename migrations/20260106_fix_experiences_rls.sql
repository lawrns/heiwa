-- Fix RLS policies for experiences table to allow service role access
-- This ensures the admin API can create/update/delete activities

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access on experiences" ON experiences;
DROP POLICY IF EXISTS "Allow authenticated users to manage experiences" ON experiences;

-- Create new policies

-- 1. Public can read active experiences
CREATE POLICY "experiences_public_read" ON experiences
  FOR SELECT
  USING (active = true);

-- 2. Service role can do everything (bypasses RLS automatically, but this is a safety net)
-- Note: Service role key automatically bypasses RLS, but we add this for clarity
CREATE POLICY "experiences_service_role_all" ON experiences
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- 3. Authenticated users can also manage (for dashboard users)
CREATE POLICY "experiences_authenticated_manage" ON experiences
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Verify RLS is enabled
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON experiences TO authenticated;
GRANT SELECT ON experiences TO anon;

SELECT 'RLS policies for experiences table updated successfully' as status;
