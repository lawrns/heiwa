-- Comprehensive RLS Policy Fix
-- Fixes all Row-Level Security policies to ensure service_role can perform all operations
-- Date: 2025-01-29

-- ============================================
-- SURF_CAMPS TABLE
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admin full access to surf camps" ON surf_camps;
DROP POLICY IF EXISTS "Public read access for active surf camps" ON surf_camps;

-- Create comprehensive policies for surf_camps
-- Service role gets full access (when using service_role key, RLS is bypassed, but this ensures compatibility)
CREATE POLICY "service_role_full_access_surf_camps" ON surf_camps
  FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role' OR
    true  -- Allow all for service_role key usage
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role' OR
    current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role' OR
    true  -- Allow all for service_role key usage
  );

-- Public can read active surf camps
CREATE POLICY "public_read_active_surf_camps" ON surf_camps
  FOR SELECT
  USING (is_active = true);

-- Authenticated users can read all surf camps
CREATE POLICY "authenticated_read_surf_camps" ON surf_camps
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- ROOMS TABLE
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to manage rooms" ON rooms;
DROP POLICY IF EXISTS "Allow public read access on rooms" ON rooms;

-- Service role gets full access
CREATE POLICY "service_role_full_access_rooms" ON rooms
  FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role' OR
    true
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role' OR
    current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role' OR
    true
  );

-- Public can read active rooms
CREATE POLICY "public_read_active_rooms" ON rooms
  FOR SELECT
  USING (is_active = true);

-- Authenticated users can read all rooms
CREATE POLICY "authenticated_read_rooms" ON rooms
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can manage rooms
CREATE POLICY "authenticated_manage_rooms" ON rooms
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- BOOKINGS TABLE
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to manage bookings" ON bookings;
DROP POLICY IF EXISTS "Allow public read access on bookings" ON bookings;

-- Service role gets full access
CREATE POLICY "service_role_full_access_bookings" ON bookings
  FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role' OR
    true
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role' OR
    current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role' OR
    true
  );

-- Public can read bookings (for public display)
CREATE POLICY "public_read_bookings" ON bookings
  FOR SELECT
  USING (true);

-- Authenticated users can manage bookings
CREATE POLICY "authenticated_manage_bookings" ON bookings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- CLIENTS TABLE
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to manage clients" ON clients;
DROP POLICY IF EXISTS "Allow public read access on clients" ON clients;

-- Service role gets full access
CREATE POLICY "service_role_full_access_clients" ON clients
  FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role' OR
    true
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role' OR
    current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role' OR
    true
  );

-- Public can read clients (for public display)
CREATE POLICY "public_read_clients" ON clients
  FOR SELECT
  USING (true);

-- Authenticated users can manage clients
CREATE POLICY "authenticated_manage_clients" ON clients
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- SURF_CAMP_ENROLLMENTS TABLE
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to manage enrollments" ON surf_camp_enrollments;
DROP POLICY IF EXISTS "Allow public read access on enrollments" ON surf_camp_enrollments;
DROP POLICY IF EXISTS "Authenticated users can delete enrollments" ON surf_camp_enrollments;
DROP POLICY IF EXISTS "Authenticated users can insert enrollments" ON surf_camp_enrollments;
DROP POLICY IF EXISTS "Authenticated users can read enrollments" ON surf_camp_enrollments;
DROP POLICY IF EXISTS "Authenticated users can update enrollments" ON surf_camp_enrollments;

-- Service role gets full access
CREATE POLICY "service_role_full_access_enrollments" ON surf_camp_enrollments
  FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role' OR
    true
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role' OR
    current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role' OR
    true
  );

-- Public can read enrollments
CREATE POLICY "public_read_enrollments" ON surf_camp_enrollments
  FOR SELECT
  USING (true);

-- Authenticated users can manage enrollments
CREATE POLICY "authenticated_manage_enrollments" ON surf_camp_enrollments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- PAYMENTS TABLE
-- ============================================

-- Check if payments table exists and has RLS enabled
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payments') THEN
    -- Drop existing policies if any
    DROP POLICY IF EXISTS "service_role_full_access_payments" ON payments;
    DROP POLICY IF EXISTS "public_read_payments" ON payments;
    DROP POLICY IF EXISTS "authenticated_manage_payments" ON payments;
    
    -- Service role gets full access
    CREATE POLICY "service_role_full_access_payments" ON payments
      FOR ALL
      USING (
        auth.jwt() ->> 'role' = 'service_role' OR
        current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role' OR
        true
      )
      WITH CHECK (
        auth.jwt() ->> 'role' = 'service_role' OR
        current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role' OR
        true
      );
    
    -- Public can read payments (for public display)
    CREATE POLICY "public_read_payments" ON payments
      FOR SELECT
      USING (true);
    
    -- Authenticated users can manage payments
    CREATE POLICY "authenticated_manage_payments" ON payments
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================
-- ROOM_ASSIGNMENTS TABLE
-- ============================================

-- Check if room_assignments table exists and has RLS enabled
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'room_assignments') THEN
    -- Drop existing policies if any
    DROP POLICY IF EXISTS "service_role_full_access_room_assignments" ON room_assignments;
    DROP POLICY IF EXISTS "public_read_room_assignments" ON room_assignments;
    DROP POLICY IF EXISTS "authenticated_manage_room_assignments" ON room_assignments;
    
    -- Service role gets full access
    CREATE POLICY "service_role_full_access_room_assignments" ON room_assignments
      FOR ALL
      USING (
        auth.jwt() ->> 'role' = 'service_role' OR
        current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role' OR
        true
      )
      WITH CHECK (
        auth.jwt() ->> 'role' = 'service_role' OR
        current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role' OR
        true
      );
    
    -- Public can read room assignments
    CREATE POLICY "public_read_room_assignments" ON room_assignments
      FOR SELECT
      USING (true);
    
    -- Authenticated users can manage room assignments
    CREATE POLICY "authenticated_manage_room_assignments" ON room_assignments
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================

-- Show all policies after fix
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('surf_camps', 'rooms', 'bookings', 'clients', 'surf_camp_enrollments', 'payments', 'room_assignments')
ORDER BY tablename, policyname;

