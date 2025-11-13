-- Fix experiences table schema to match API expectations
-- This ensures the activities API works correctly

-- Create experiences table if it doesn't exist
CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT DEFAULT 'general',
  icon TEXT,
  availability_tier TEXT DEFAULT 'always' CHECK (availability_tier IN ('always', 'on-request')),
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  hero_video_url TEXT,
  hero_image_url TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if table exists
ALTER TABLE experiences 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS icon TEXT,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS availability_tier TEXT DEFAULT 'always',
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS hero_video_url TEXT,
ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;

-- Add constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'experiences_availability_tier_check'
  ) THEN
    ALTER TABLE experiences 
    ADD CONSTRAINT experiences_availability_tier_check 
    CHECK (availability_tier IN ('always', 'on-request'));
  END IF;
END $$;

-- Enable RLS
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access on experiences" ON experiences;
DROP POLICY IF EXISTS "Allow authenticated users to manage experiences" ON experiences;

-- Create policies
CREATE POLICY "Allow public read access on experiences" ON experiences
  FOR SELECT USING (active = true);

CREATE POLICY "Allow authenticated users to manage experiences" ON experiences
  FOR ALL USING (auth.role() = 'authenticated');

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_experiences_category ON experiences(category);
CREATE INDEX IF NOT EXISTS idx_experiences_active ON experiences(active);
CREATE INDEX IF NOT EXISTS idx_experiences_display_order ON experiences(display_order);

-- Insert some sample data if table is empty
INSERT INTO experiences (title, description, image_url, category, availability_tier, display_order, active)
SELECT * FROM (VALUES
  ('Surf Lessons', 'Learn to ride the waves with professional instructors', '/images/surf-lessons.jpg', 'surf', 'always', 1, true),
  ('Yoga Sessions', 'Daily yoga and meditation sessions', '/images/yoga.jpg', 'flow', 'always', 2, true),
  ('Skateboarding', 'Master surfskate techniques', '/images/skatepark-1.jpg', 'play', 'always', 3, true)
) AS v(title, description, image_url, category, availability_tier, display_order, active)
WHERE NOT EXISTS (SELECT 1 FROM experiences LIMIT 1);

SELECT 'experiences table fixed successfully' as status;

