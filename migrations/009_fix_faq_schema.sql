-- Fix FAQ Schema - Add created_by and updated_by columns if missing
-- This migration ensures FAQ items table has the required columns for admin tracking

-- Add created_by and updated_by columns if they don't exist
DO $$ 
BEGIN
  -- Check if created_by column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'faq_items' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE faq_items ADD COLUMN created_by VARCHAR(100);
  END IF;

  -- Check if updated_by column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'faq_items' AND column_name = 'updated_by'
  ) THEN
    ALTER TABLE faq_items ADD COLUMN updated_by VARCHAR(100);
  END IF;
END $$;

-- Update page_content table to support 'surf-weeks' page_slug
DO $$
BEGIN
  -- Check if 'surf-weeks' is in the CHECK constraint
  -- We need to drop and recreate the constraint to add 'surf-weeks'
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'page_content' 
    AND constraint_name LIKE '%page_slug%check%'
  ) THEN
    -- Drop existing constraint
    ALTER TABLE page_content DROP CONSTRAINT IF EXISTS page_content_page_slug_check;
    
    -- Add new constraint with 'surf-weeks' included
    ALTER TABLE page_content 
    ADD CONSTRAINT page_content_page_slug_check 
    CHECK (page_slug IN ('flow', 'play', 'surf', 'the-spot', 'privacy', 'terms', 'surf-weeks', 'about', 'contact'));
  END IF;
END $$;

