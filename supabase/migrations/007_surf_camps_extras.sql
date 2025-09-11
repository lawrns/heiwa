-- 007_surf_camps_extras.sql
-- Adds category, food_preferences, and allergies_info to surf_camps
-- Backwards compatible: nullable/text with safe defaults

BEGIN;

-- Add category column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'surf_camps' 
      AND column_name = 'category'
  ) THEN
    ALTER TABLE public.surf_camps 
      ADD COLUMN category TEXT;
    COMMENT ON COLUMN public.surf_camps.category IS 'Human-friendly category label (e.g., Freedom Routes, Heiwa House)';
  END IF;
END$$;

-- Add food_preferences column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'surf_camps' 
      AND column_name = 'food_preferences'
  ) THEN
    ALTER TABLE public.surf_camps 
      ADD COLUMN food_preferences JSONB DEFAULT '[]'::jsonb;
    COMMENT ON COLUMN public.surf_camps.food_preferences IS 'Array of dietary preferences (strings)';
  END IF;
END$$;

-- Add allergies_info column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'surf_camps' 
      AND column_name = 'allergies_info'
  ) THEN
    ALTER TABLE public.surf_camps 
      ADD COLUMN allergies_info JSONB DEFAULT '[]'::jsonb;
    COMMENT ON COLUMN public.surf_camps.allergies_info IS 'Array of allergy notes (strings)';
  END IF;
END$$;

COMMIT;

