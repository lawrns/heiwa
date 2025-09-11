-- 006_rooms_bed_types.sql
-- Adds bed_types column to rooms table
-- Backwards compatible: default empty array; no NOT NULL constraint to avoid issues with legacy rows

BEGIN;

-- Add bed_types column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'rooms' 
      AND column_name = 'bed_types'
  ) THEN
    ALTER TABLE public.rooms 
      ADD COLUMN bed_types TEXT[] DEFAULT '{}'::text[];
  END IF;
END$$;

-- Optional: add a comment for documentation
COMMENT ON COLUMN public.rooms.bed_types IS 'Array of bed types available in the room (e.g., single, double, bunk)';

COMMIT;

