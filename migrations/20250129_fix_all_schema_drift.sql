-- Comprehensive schema drift fix for all tables
-- Fixes missing columns that are expected by the application

-- ============================================
-- SURF_CAMPS TABLE FIXES
-- ============================================

-- Add images column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'surf_camps' AND column_name = 'images'
  ) THEN
    ALTER TABLE surf_camps ADD COLUMN images TEXT[] DEFAULT '{}';
    RAISE NOTICE 'Added images column to surf_camps';
  END IF;
END $$;

-- Add includes column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'surf_camps' AND column_name = 'includes'
  ) THEN
    ALTER TABLE surf_camps ADD COLUMN includes TEXT[] DEFAULT '{}';
    RAISE NOTICE 'Added includes column to surf_camps';
  END IF;
END $$;

-- Add level column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'surf_camps' AND column_name = 'level'
  ) THEN
    ALTER TABLE surf_camps ADD COLUMN level VARCHAR(50) DEFAULT 'all';
    RAISE NOTICE 'Added level column to surf_camps';
  END IF;
END $$;

-- Add category column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'surf_camps' AND column_name = 'category'
  ) THEN
    ALTER TABLE surf_camps ADD COLUMN category VARCHAR(50) DEFAULT 'surf-week';
    RAISE NOTICE 'Added category column to surf_camps';
  END IF;
END $$;

-- Add location column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'surf_camps' AND column_name = 'location'
  ) THEN
    ALTER TABLE surf_camps ADD COLUMN location TEXT;
    RAISE NOTICE 'Added location column to surf_camps';
  END IF;
END $$;

-- Add max_participants column if it doesn't exist (for backward compatibility)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'surf_camps' AND column_name = 'max_participants'
  ) THEN
    ALTER TABLE surf_camps ADD COLUMN max_participants INTEGER;
    -- Use total_spots as default if it exists
    UPDATE surf_camps SET max_participants = total_spots WHERE max_participants IS NULL;
    RAISE NOTICE 'Added max_participants column to surf_camps';
  END IF;
END $$;

-- Ensure total_spots and available_spots exist (from newer schema)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'surf_camps' AND column_name = 'total_spots'
  ) THEN
    ALTER TABLE surf_camps ADD COLUMN total_spots INTEGER;
    -- Use max_participants as default if it exists
    UPDATE surf_camps SET total_spots = max_participants WHERE total_spots IS NULL;
    ALTER TABLE surf_camps ALTER COLUMN total_spots SET DEFAULT 18;
    RAISE NOTICE 'Added total_spots column to surf_camps';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'surf_camps' AND column_name = 'available_spots'
  ) THEN
    ALTER TABLE surf_camps ADD COLUMN available_spots INTEGER;
    -- Initialize available_spots to total_spots
    UPDATE surf_camps SET available_spots = COALESCE(total_spots, max_participants, 18) WHERE available_spots IS NULL;
    ALTER TABLE surf_camps ALTER COLUMN available_spots SET DEFAULT 18;
    RAISE NOTICE 'Added available_spots column to surf_camps';
  END IF;
END $$;

-- Add constraint for level if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'surf_camps' 
    AND constraint_name = 'surf_camps_level_check'
  ) THEN
    ALTER TABLE surf_camps ADD CONSTRAINT surf_camps_level_check 
      CHECK (level IN ('beginner', 'intermediate', 'advanced', 'all'));
    RAISE NOTICE 'Added level constraint to surf_camps';
  END IF;
END $$;

-- Create indexes on level and category if they don't exist
CREATE INDEX IF NOT EXISTS idx_surf_camps_level ON surf_camps(level);
CREATE INDEX IF NOT EXISTS idx_surf_camps_category ON surf_camps(category);

-- ============================================
-- ROOMS TABLE FIXES
-- ============================================

-- Add amenities column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rooms' AND column_name = 'amenities'
  ) THEN
    ALTER TABLE rooms ADD COLUMN amenities TEXT[] DEFAULT '{}';
    RAISE NOTICE 'Added amenities column to rooms';
  END IF;
END $$;

-- Add images column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rooms' AND column_name = 'images'
  ) THEN
    ALTER TABLE rooms ADD COLUMN images TEXT[] DEFAULT '{}';
    RAISE NOTICE 'Added images column to rooms';
  END IF;
END $$;

-- Add pricing column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rooms' AND column_name = 'pricing'
  ) THEN
    ALTER TABLE rooms ADD COLUMN pricing JSONB DEFAULT '{"standard": 80, "offSeason": 60}'::jsonb;
    RAISE NOTICE 'Added pricing column to rooms';
  END IF;
END $$;

-- Add bed_types column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rooms' AND column_name = 'bed_types'
  ) THEN
    ALTER TABLE rooms ADD COLUMN bed_types TEXT[] DEFAULT '{}';
    RAISE NOTICE 'Added bed_types column to rooms';
  END IF;
END $$;

-- Add booking_type column if it doesn't exist (might be bookingType)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rooms' AND column_name = 'booking_type'
  ) THEN
    ALTER TABLE rooms ADD COLUMN booking_type TEXT NOT NULL DEFAULT 'whole';
    ALTER TABLE rooms ADD CONSTRAINT rooms_booking_type_check 
      CHECK (booking_type = ANY (ARRAY['whole'::text, 'perBed'::text]));
    RAISE NOTICE 'Added booking_type column to rooms';
  END IF;
END $$;

-- Add capacity column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rooms' AND column_name = 'capacity'
  ) THEN
    ALTER TABLE rooms ADD COLUMN capacity INTEGER NOT NULL DEFAULT 2;
    RAISE NOTICE 'Added capacity column to rooms';
  END IF;
END $$;

-- Add is_active column if it doesn't exist (might be isActive)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rooms' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE rooms ADD COLUMN is_active BOOLEAN DEFAULT true;
    RAISE NOTICE 'Added is_active column to rooms';
  END IF;
END $$;

-- Add description column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rooms' AND column_name = 'description'
  ) THEN
    ALTER TABLE rooms ADD COLUMN description TEXT;
    RAISE NOTICE 'Added description column to rooms';
  END IF;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================

-- Show summary of columns added
SELECT 'Schema drift fix completed' as status;
SELECT 'surf_camps columns:' as info;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'surf_camps' ORDER BY ordinal_position;
SELECT 'rooms columns:' as info;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'rooms' ORDER BY ordinal_position;

