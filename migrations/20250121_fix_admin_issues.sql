-- Comprehensive fix for admin panel issues
-- Date: 2025-01-21

-- 1. Fix RLS policies for page_content table
-- Allow admin read access (service_role bypasses RLS, but this ensures consistency)
DROP POLICY IF EXISTS "Allow admin read" ON page_content;
CREATE POLICY "Allow admin read" ON page_content 
  FOR SELECT 
  USING (true);

-- Ensure write policies allow all operations
DROP POLICY IF EXISTS "Allow admin write" ON page_content;
DROP POLICY IF EXISTS "Allow admin update" ON page_content;
DROP POLICY IF EXISTS "Allow admin delete" ON page_content;

CREATE POLICY "Allow admin write" ON page_content 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow admin update" ON page_content 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Allow admin delete" ON page_content 
  FOR DELETE 
  USING (true);

-- 2. Verify surf_camps table has correct columns
DO $$ 
BEGIN
  -- Add total_spots if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'surf_camps' AND column_name = 'total_spots'
  ) THEN
    ALTER TABLE surf_camps ADD COLUMN total_spots INTEGER;
    -- Set total_spots = max_participants for existing records
    UPDATE surf_camps SET total_spots = max_participants WHERE total_spots IS NULL;
  END IF;

  -- Add available_spots if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'surf_camps' AND column_name = 'available_spots'
  ) THEN
    ALTER TABLE surf_camps ADD COLUMN available_spots INTEGER;
  END IF;
END $$;

-- 3. Ensure bookings table has proper indexes
CREATE INDEX IF NOT EXISTS idx_bookings_client_ids ON bookings USING GIN(client_ids);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

-- 4. Ensure clients table has proper indexes
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);

-- 5. Verify homepage_content table exists and has proper structure
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'homepage_content'
  ) THEN
    CREATE TABLE homepage_content (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      section TEXT NOT NULL,
      content JSONB,
      is_active BOOLEAN DEFAULT true,
      order_index INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_homepage_content_section ON homepage_content(section);
    CREATE INDEX IF NOT EXISTS idx_homepage_content_active ON homepage_content(is_active);
    
    ALTER TABLE homepage_content ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Allow public read" ON homepage_content 
      FOR SELECT 
      USING (is_active = true);
    
    CREATE POLICY "Allow admin read" ON homepage_content 
      FOR SELECT 
      USING (true);
    
    CREATE POLICY "Allow admin write" ON homepage_content 
      FOR INSERT 
      WITH CHECK (true);
    
    CREATE POLICY "Allow admin update" ON homepage_content 
      FOR UPDATE 
      USING (true);
    
    CREATE POLICY "Allow admin delete" ON homepage_content 
      FOR DELETE 
      USING (true);
  END IF;
END $$;

-- 6. Update surf_camps available_spots based on enrollments
DO $$
DECLARE
  camp_record RECORD;
  enrolled_count INTEGER;
BEGIN
  FOR camp_record IN SELECT id, total_spots, max_participants FROM surf_camps LOOP
    SELECT COUNT(*) INTO enrolled_count
    FROM surf_camp_enrollments
    WHERE surf_camp_id = camp_record.id AND status = 'confirmed';
    
    UPDATE surf_camps
    SET available_spots = COALESCE(camp_record.total_spots, camp_record.max_participants, 18) - enrolled_count
    WHERE id = camp_record.id;
  END LOOP;
END $$;

SELECT 'Admin panel fixes applied successfully' as status;

