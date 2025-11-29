-- Fix schema drift for surf_camps table
-- Add missing columns that are expected by the application

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
    -- Use total_spots as default if it exists
    ALTER TABLE surf_camps ADD COLUMN max_participants INTEGER;
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

-- Create index on level if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_surf_camps_level ON surf_camps(level);

-- Create index on category if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_surf_camps_category ON surf_camps(category);

