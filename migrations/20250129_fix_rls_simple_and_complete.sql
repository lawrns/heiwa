-- Simple and Complete RLS Fix
-- Ensures service_role can perform all operations by using simple policies
-- Date: 2025-01-29

-- ============================================
-- SURF_CAMPS TABLE - Simple Fix
-- ============================================

-- Drop and recreate service_role policy with simple USING (true)
DROP POLICY IF EXISTS "service_role_full_access_surf_camps" ON surf_camps;

CREATE POLICY "service_role_full_access_surf_camps" ON surf_camps
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- ROOMS TABLE
-- ============================================

DROP POLICY IF EXISTS "service_role_full_access_rooms" ON rooms;

CREATE POLICY "service_role_full_access_rooms" ON rooms
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- BOOKINGS TABLE
-- ============================================

DROP POLICY IF EXISTS "service_role_full_access_bookings" ON bookings;

CREATE POLICY "service_role_full_access_bookings" ON bookings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- CLIENTS TABLE
-- ============================================

DROP POLICY IF EXISTS "service_role_full_access_clients" ON clients;

CREATE POLICY "service_role_full_access_clients" ON clients
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- SURF_CAMP_ENROLLMENTS TABLE
-- ============================================

DROP POLICY IF EXISTS "service_role_full_access_enrollments" ON surf_camp_enrollments;

CREATE POLICY "service_role_full_access_enrollments" ON surf_camp_enrollments
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- PAYMENTS TABLE
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payments') THEN
    DROP POLICY IF EXISTS "service_role_full_access_payments" ON payments;
    
    CREATE POLICY "service_role_full_access_payments" ON payments
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================
-- ROOM_ASSIGNMENTS TABLE
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'room_assignments') THEN
    DROP POLICY IF EXISTS "service_role_full_access_room_assignments" ON room_assignments;
    
    CREATE POLICY "service_role_full_access_room_assignments" ON room_assignments
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================
-- CMS TABLES (if they exist)
-- ============================================

-- page_content
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'page_content') THEN
    DROP POLICY IF EXISTS "service_role_full_access_page_content" ON page_content;
    
    CREATE POLICY "service_role_full_access_page_content" ON page_content
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- homepage_sections
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'homepage_sections') THEN
    DROP POLICY IF EXISTS "service_role_full_access_homepage_sections" ON homepage_sections;
    
    CREATE POLICY "service_role_full_access_homepage_sections" ON homepage_sections
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- testimonials
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'testimonials') THEN
    DROP POLICY IF EXISTS "service_role_full_access_testimonials" ON testimonials;
    
    CREATE POLICY "service_role_full_access_testimonials" ON testimonials
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- faq_items
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'faq_items') THEN
    DROP POLICY IF EXISTS "service_role_full_access_faq_items" ON faq_items;
    
    CREATE POLICY "service_role_full_access_faq_items" ON faq_items
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- media_library
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'media_library') THEN
    DROP POLICY IF EXISTS "service_role_full_access_media_library" ON media_library;
    
    CREATE POLICY "service_role_full_access_media_library" ON media_library
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'RLS policies fixed - service_role now has full access to all tables' as status;

-- Show all service_role policies
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND policyname LIKE '%service_role%'
ORDER BY tablename, policyname;

