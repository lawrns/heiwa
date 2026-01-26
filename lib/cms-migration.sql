-- Supabase CMS Migration Script
-- Run this in Supabase SQL Editor or via psql

-- Create navigation_items table
CREATE TABLE IF NOT EXISTS navigation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create experiences table
CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT,
  category TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Create policies for navigation_items
CREATE POLICY "Allow public read access on navigation_items" ON navigation_items
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage navigation_items" ON navigation_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for rooms
CREATE POLICY "Allow public read access on rooms" ON rooms
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage rooms" ON rooms
  FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for experiences
CREATE POLICY "Allow public read access on experiences" ON experiences
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage experiences" ON experiences
  FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for pages
CREATE POLICY "Allow public read access on published pages" ON pages
  FOR SELECT USING (published = true);

CREATE POLICY "Allow authenticated users to manage pages" ON pages
  FOR ALL USING (auth.role() = 'authenticated');

-- Create storage bucket for images (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('cms-images', 'cms-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Allow public read access on cms-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'cms-images');

CREATE POLICY "Allow authenticated users to manage cms-images" ON storage.objects
  FOR ALL USING (bucket_id = 'cms-images' AND auth.role() = 'authenticated');

-- Insert initial navigation data
INSERT INTO navigation_items (name, path, order_index) VALUES
('HOME', '/', 1),
('THE SPOT', '/the-spot', 2),
('ROOM RENTALS', '/rooms', 3),
('SURF CAMP', '/surf-weeks', 4)
ON CONFLICT (path) DO NOTHING;

-- Insert initial room data
INSERT INTO rooms (name, image_url) VALUES
('Room Nr 1', 'https://heiwahouse.com/wp-content/uploads/2024/12/Freedomroutes-rooms-52-scaled-570x600.jpg'),
('Room Nr 2', 'https://heiwahouse.com/wp-content/uploads/2024/12/Freedomroutes-rooms-29-scaled-570x600.webp'),
('Room Nr 3', 'https://heiwahouse.com/wp-content/uploads/2024/12/Freedomroutes-rooms-22-scaled-570x600.webp'),
('Dorm room', 'https://heiwahouse.com/wp-content/uploads/2024/12/Freedomroutes-rooms-1-scaled-570x600.webp')
ON CONFLICT DO NOTHING;

-- Insert initial experience data
INSERT INTO experiences (title, image_url) VALUES
('Hiking', 'https://heiwahouse.com/wp-content/uploads/2025/01/8B8BA276-6D91-419B-B8F4-7696042ED92F-01.jpeg'),
('Horseback Riding', 'https://heiwahouse.com/wp-content/uploads/2025/01/Freedomroutes_35mm-39-scaled.jpg'),
('Sauna', 'https://heiwahouse.com/wp-content/uploads/2024/12/portrait_sauna3.jpg'),
('Surfing', 'https://heiwahouse.com/wp-content/uploads/2025/01/Surf-Lessons.jpg'),
('Skatepark', 'https://heiwahouse.com/wp-content/uploads/2025/01/skatepark-1.jpg'),
('Yoga', 'https://heiwahouse.com/wp-content/uploads/2025/01/Yoga.jpg'),
('Bicycle Ride', 'https://heiwahouse.com/wp-content/uploads/2025/01/Freedomroutes_35mm-7-scaled.jpg'),
('Day Trips', 'https://heiwahouse.com/wp-content/uploads/2025/01/DSCF8628.jpg')
ON CONFLICT DO NOTHING;

-- Insert initial page data
INSERT INTO pages (slug, title, content, published) VALUES (
  'home',
  'Heiwa House - A Wave Away | Surf & Adventure Retreat',
  '{
    "hero": {
      "title": "Nestled on Portugal''s coast, Heiwa House is your sanctuary for rest and adventure.",
      "subtitle": "A WAVE AWAY",
      "backgroundImage": "/images/hero/heiwa-hero.jpg",
      "cta": [{"label": "EXPLORE", "href": "/rooms"}]
    },
    "featureCards": [
      {
        "title": "Heiwa Play",
        "image": "https://heiwahouse.com/wp-content/uploads/2025/01/play.jpg",
        "href": "/the-spot#play"
      },
      {
        "title": "Heiwa Surf",
        "image": "https://heiwahouse.com/wp-content/uploads/2025/01/surf4.jpg",
        "href": "/surf-weeks"
      },
      {
        "title": "Heiwa Flow",
        "image": "https://heiwahouse.com/wp-content/uploads/2024/12/image00023-722x1024.jpeg",
        "href": "/the-spot#flow"
      }
    ],
    "videoEmbed": {
      "provider": "youtube",
      "src": "https://youtu.be/9nhQiKGsgHg",
      "poster": "/images/posters/surfweeks.svg"
    }
  }'::jsonb,
  true
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO pages (slug, title, content, published) VALUES (
  'rooms',
  'Room Rentals - Heiwa House Accommodation',
  '{
    "bookingCta": {
      "label": "Check Availability",
      "href": "/rooms#booking"
    }
  }'::jsonb,
  true
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO pages (slug, title, content, published) VALUES (
  'experiences',
  'Experiences - Heiwa House Activities',
  '{}'::jsonb,
  true
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO pages (slug, title, content, published) VALUES (
  'surf-weeks',
  'Surf Weeks - Professional Surf Training Program',
  '{
    "videoEmbed": {
      "provider": "youtube",
      "src": "https://youtu.be/9nhQiKGsgHg",
      "poster": "/images/posters/surfweeks.svg"
    },
    "program": {
      "title": "Surf Weeks Program",
      "description": "Join our comprehensive surf training program designed for all skill levels.",
      "features": [
        "Professional surf instruction",
        "Equipment provided",
        "Small group sessions",
        "Beachside accommodation",
        "Video analysis and feedback",
        "Certification upon completion"
      ]
    }
  }'::jsonb,
  true
) ON CONFLICT (slug) DO NOTHING;