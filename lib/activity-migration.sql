-- Activity Management Migration Script
-- Extends existing CMS system for activity management

-- First, let's enhance the existing experiences table to support activity management
ALTER TABLE experiences 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS icon TEXT,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS availability_tier TEXT DEFAULT 'always' CHECK (availability_tier IN ('always', 'on-request')),
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS hero_video_url TEXT,
ADD COLUMN IF NOT EXISTS hero_image_url TEXT;

-- Create activity_categories table for better organization
CREATE TABLE IF NOT EXISTS activity_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on activity_categories
ALTER TABLE activity_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for activity_categories
CREATE POLICY "Allow public read access on activity_categories" ON activity_categories
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage activity_categories" ON activity_categories
  FOR ALL USING (auth.role() = 'authenticated');

-- Update existing experiences policies to include new fields
DROP POLICY IF EXISTS "Allow public read access on experiences" ON experiences;
CREATE POLICY "Allow public read access on experiences" ON experiences
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Allow authenticated users to manage experiences" ON experiences;
CREATE POLICY "Allow authenticated users to manage experiences" ON experiences
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert initial activity categories
INSERT INTO activity_categories (name, slug, description, display_order) VALUES
('Play', 'play', 'Fun activities and recreational experiences at Heiwa House', 1),
('Flow', 'flow', 'Wellness, yoga, and mindful practices for inner balance', 2),
('Surf', 'surf', 'Surfing lessons and ocean adventures', 3)
ON CONFLICT (slug) DO NOTHING;

-- Update existing experiences with proper categories and data
UPDATE experiences SET 
  category = 'play',
  description = 'Explore beautiful coastal paths and beaches on our bicycles. Perfect for day trips and local exploration.',
  icon = 'bike',
  availability_tier = 'always',
  display_order = 5
WHERE title = 'Bicycle Ride';

UPDATE experiences SET 
  category = 'play',
  description = 'Challenge friends at our professional skatepark with ramps and obstacles for all skill levels.',
  icon = 'skateboard',
  availability_tier = 'always',
  display_order = 6
WHERE title = 'Skatepark';

UPDATE experiences SET 
  category = 'flow',
  description = 'Traditional sauna experience to detoxify, relax muscles, and promote overall wellness.',
  icon = 'thermometer',
  availability_tier = 'always',
  display_order = 4
WHERE title = 'Sauna';

UPDATE experiences SET 
  category = 'flow',
  description = 'Daily yoga and meditation sessions in our beautiful dome overlooking the Portuguese countryside.',
  icon = 'heart',
  availability_tier = 'always',
  display_order = 1
WHERE title = 'Yoga';

UPDATE experiences SET 
  category = 'surf',
  description = 'Professional surf instruction for all levels. Equipment provided, with video analysis included.',
  icon = 'waves',
  availability_tier = 'always',
  display_order = 1
WHERE title = 'Surfing';

UPDATE experiences SET 
  category = 'play',
  description = 'Guided hiking adventures through the beautiful Portuguese countryside and coastal trails.',
  icon = 'map-pin',
  availability_tier = 'on-request',
  display_order = 1
WHERE title = 'Hiking';

UPDATE experiences SET 
  category = 'play',
  description = 'Experience horseback riding along the beach and through scenic trails.',
  icon = 'heart',
  availability_tier = 'on-request',
  display_order = 2
WHERE title = 'Horseback Riding';

UPDATE experiences SET 
  category = 'play',
  description = 'Organized day trips to explore Portugal''s most beautiful destinations.',
  icon = 'map-pin',
  availability_tier = 'always',
  display_order = 3
WHERE title = 'Day Trips';

-- Insert new Flow activities that were missing
INSERT INTO experiences (title, description, image_url, category, icon, availability_tier, display_order) VALUES
('Massage', 'Professional massage therapy to soothe sore muscles after surfing or simply to relax and rejuvenate your body and mind.', 'https://heiwahouse.com/wp-content/uploads/2024/12/portrait_sauna3.jpg', 'flow', 'wind', 'always', 2),
('Ice Bath', 'Experience the power of cold therapy for recovery, circulation, and mental clarity. Perfect complement to our active lifestyle.', 'https://heiwahouse.com/wp-content/uploads/2024/12/pool333.jpg', 'flow', 'droplets', 'always', 3),
('Breathwork', 'Guided breathing techniques to reduce stress, increase energy, and enhance mental clarity.', 'https://heiwahouse.com/wp-content/uploads/2024/12/yoga_dome2.jpg', 'flow', 'wind', 'on-request', 5),
('Gong and Sound Healing', 'Therapeutic sound sessions using gongs and other instruments to promote deep relaxation and healing.', 'https://heiwahouse.com/wp-content/uploads/2024/12/yoga_dome1.jpg', 'flow', 'heart', 'on-request', 6),
('Reiki', 'Energy healing therapy to balance your body''s energy centers and promote deep relaxation.', 'https://heiwahouse.com/wp-content/uploads/2024/12/yoga_dome3.jpg', 'flow', 'wind', 'on-request', 7),
('Meditation', 'Guided meditation sessions for stress reduction, focus, and inner peace.', 'https://heiwahouse.com/wp-content/uploads/2024/12/yoga_dome1.jpg', 'flow', 'droplets', 'on-request', 8)
ON CONFLICT DO NOTHING;

-- Insert new Play activities that were missing
INSERT INTO experiences (title, description, image_url, category, icon, availability_tier, display_order) VALUES
('Table Games', 'Challenge friends to table tennis, darts, table football, or basketball. Perfect for friendly competition and making memories.', 'https://heiwahouse.com/wp-content/uploads/2025/01/games.jpg', 'play', 'users', 'always', 4),
('Giant Pool', 'Relax and unwind in our beautiful swimming pool. Perfect for cooling off on hot Portuguese days or just lounging in the sun.', 'https://heiwahouse.com/wp-content/uploads/2024/12/pool333.jpg', 'play', 'waves', 'always', 7),
('Gym', 'Stay fit and active with our gym facilities. Whether you want to maintain your workout routine or try something new, we have you covered.', 'https://heiwahouse.com/wp-content/uploads/2024/12/park333.jpg', 'play', 'dumbbell', 'always', 8)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_experiences_category ON experiences(category);
CREATE INDEX IF NOT EXISTS idx_experiences_availability_tier ON experiences(availability_tier);
CREATE INDEX IF NOT EXISTS idx_experiences_active ON experiences(active);
CREATE INDEX IF NOT EXISTS idx_experiences_display_order ON experiences(display_order);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_experiences_updated_at BEFORE UPDATE ON experiences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_categories_updated_at BEFORE UPDATE ON activity_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
