-- Fix rooms table schema to match expected structure
-- Migrate from old schema to new schema

-- First, check if we need to rename 'active' to 'is_active'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rooms' AND column_name = 'active'
  ) THEN
    ALTER TABLE rooms RENAME COLUMN active TO is_active;
  END IF;
END $$;

-- Add missing columns if they don't exist
DO $$
BEGIN
  -- Add capacity column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rooms' AND column_name = 'capacity'
  ) THEN
    ALTER TABLE rooms ADD COLUMN capacity INTEGER NOT NULL DEFAULT 2;
  END IF;

  -- Add booking_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rooms' AND column_name = 'booking_type'
  ) THEN
    ALTER TABLE rooms ADD COLUMN booking_type TEXT NOT NULL DEFAULT 'whole';
    ALTER TABLE rooms ADD CONSTRAINT rooms_booking_type_check 
      CHECK (booking_type = ANY (ARRAY['whole'::text, 'perBed'::text]));
  END IF;

  -- Add pricing column (jsonb)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rooms' AND column_name = 'pricing'
  ) THEN
    ALTER TABLE rooms ADD COLUMN pricing JSONB NOT NULL DEFAULT '{"standard": 80, "offSeason": 60}'::jsonb;
  END IF;

  -- Add amenities column (text array)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rooms' AND column_name = 'amenities'
  ) THEN
    ALTER TABLE rooms ADD COLUMN amenities TEXT[] DEFAULT '{}'::text[];
  END IF;

  -- Add images column (text array) - migrate from image_url if it exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rooms' AND column_name = 'images'
  ) THEN
    ALTER TABLE rooms ADD COLUMN images TEXT[] DEFAULT '{}'::text[];
    
    -- Migrate image_url to images array if image_url exists and has data
    UPDATE rooms 
    SET images = CASE 
      WHEN image_url IS NOT NULL AND image_url != '' THEN ARRAY[image_url]
      ELSE '{}'::text[]
    END
    WHERE images = '{}'::text[] OR images IS NULL;
  END IF;

  -- Add bed_types column (text array)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rooms' AND column_name = 'bed_types'
  ) THEN
    ALTER TABLE rooms ADD COLUMN bed_types TEXT[] DEFAULT '{}'::text[];
  END IF;

  -- Add capacity check constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'rooms_capacity_check'
  ) THEN
    ALTER TABLE rooms ADD CONSTRAINT rooms_capacity_check CHECK (capacity > 0);
  END IF;
END $$;

-- Ensure is_active has a default value
ALTER TABLE rooms ALTER COLUMN is_active SET DEFAULT true;

-- Create updated_at trigger if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_rooms_updated_at'
  ) THEN
    CREATE TRIGGER update_rooms_updated_at
      BEFORE UPDATE ON rooms
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

