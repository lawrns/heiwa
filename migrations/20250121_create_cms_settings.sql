-- CMS Settings Table
CREATE TABLE IF NOT EXISTS cms_settings (
  id SERIAL PRIMARY KEY,
  site_name VARCHAR(255) DEFAULT 'Heiwa House',
  site_description TEXT DEFAULT 'A Wave Away | Surf & Adventure Retreat',
  default_language VARCHAR(10) DEFAULT 'en',
  enable_cache BOOLEAN DEFAULT true,
  cache_duration INTEGER DEFAULT 3600,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE cms_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Allow public read" ON cms_settings FOR SELECT USING (true);

-- Allow admin write
CREATE POLICY "Allow admin write" ON cms_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow admin update" ON cms_settings FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert default settings if not exists
INSERT INTO cms_settings (id, site_name, site_description, default_language, enable_cache, cache_duration)
VALUES (1, 'Heiwa House', 'A Wave Away | Surf & Adventure Retreat', 'en', true, 3600)
ON CONFLICT (id) DO NOTHING;

