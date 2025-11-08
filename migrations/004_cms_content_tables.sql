-- CMS Content Management Tables
-- Created: 2025-11-08
-- Purpose: Store all CMS content for Heiwa House website

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Homepage Sections Table
CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_type VARCHAR(50) NOT NULL CHECK (section_type IN ('hero', 'activities_around', 'what_we_are_about', 'testimonials', 'cta')),
  title VARCHAR(255),
  subtitle VARCHAR(500),
  description TEXT,
  video_url VARCHAR(500),
  background_image VARCHAR(500),
  link_url VARCHAR(500),
  link_text VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(100),
  updated_by VARCHAR(100)
);

-- Page Content Table (for Flow, Play, Surf, The Spot pages)
CREATE TABLE IF NOT EXISTS page_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_slug VARCHAR(50) NOT NULL CHECK (page_slug IN ('flow', 'play', 'surf', 'the-spot', 'about', 'contact')),
  section_type VARCHAR(50) NOT NULL CHECK (section_type IN ('hero', 'intro', 'features', 'gallery', 'pricing', 'text', 'image_text', 'video', 'custom')),
  section_name VARCHAR(255),
  content JSONB NOT NULL,
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(100),
  updated_by VARCHAR(100)
);

-- Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_name VARCHAR(255) NOT NULL,
  author_title VARCHAR(255),
  author_image VARCHAR(500),
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(100),
  updated_by VARCHAR(100)
);

-- FAQ Items Table
CREATE TABLE IF NOT EXISTS faq_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question VARCHAR(500) NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(100),
  updated_by VARCHAR(100)
);

-- Media Library Table
CREATE TABLE IF NOT EXISTS media_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename VARCHAR(500) NOT NULL,
  original_name VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('image', 'video', 'document', 'other')),
  file_size INTEGER,
  category VARCHAR(100),
  url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  alt_text VARCHAR(500),
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(100),
  updated_by VARCHAR(100)
);

-- CTA Buttons Table
CREATE TABLE IF NOT EXISTS cta_buttons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text VARCHAR(100) NOT NULL,
  url VARCHAR(500) NOT NULL,
  button_type VARCHAR(50) DEFAULT 'primary' CHECK (button_type IN ('primary', 'secondary', 'outline', 'ghost')),
  section_id UUID,
  page_slug VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(100),
  updated_by VARCHAR(100)
);

-- Activity Log Table
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name VARCHAR(100) NOT NULL,
  record_id UUID,
  action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  old_values JSONB,
  new_values JSONB,
  user_id VARCHAR(100),
  ip_address VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Pages Meta Table (for page-level metadata)
CREATE TABLE IF NOT EXISTS pages_meta (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(50) NOT NULL UNIQUE CHECK (slug IN ('flow', 'play', 'surf', 'the-spot', 'about', 'contact', 'homepage')),
  title VARCHAR(255) NOT NULL,
  meta_description VARCHAR(500),
  meta_keywords VARCHAR(500),
  og_image VARCHAR(500),
  is_published BOOLEAN DEFAULT false,
  last_edited_by VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_homepage_sections_order ON homepage_sections(order_index);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_active ON homepage_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_page_content_slug ON page_content(page_slug);
CREATE INDEX IF NOT EXISTS idx_page_content_order ON page_content(order_index);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_active ON testimonials(is_active);
CREATE INDEX IF NOT EXISTS idx_faq_category ON faq_items(category);
CREATE INDEX IF NOT EXISTS idx_faq_active ON faq_items(is_active);
CREATE INDEX IF NOT EXISTS idx_media_category ON media_library(category);
CREATE INDEX IF NOT EXISTS idx_media_type ON media_library(file_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_table ON activity_log(table_name);
CREATE INDEX IF NOT EXISTS idx_activity_log_record ON activity_log(record_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE cta_buttons ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages_meta ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public read access
CREATE POLICY "Allow public read" ON homepage_sections FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read" ON page_content FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read" ON testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read" ON faq_items FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read" ON media_library FOR SELECT USING (is_public = true);
CREATE POLICY "Allow public read" ON cta_buttons FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read" ON pages_meta FOR SELECT USING (is_published = true);

-- RLS Policies - Admin write access (authenticated users)
CREATE POLICY "Allow admin write" ON homepage_sections FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow admin update" ON homepage_sections FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin delete" ON homepage_sections FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin write" ON page_content FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow admin update" ON page_content FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin delete" ON page_content FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin write" ON testimonials FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow admin update" ON testimonials FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin delete" ON testimonials FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin write" ON faq_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow admin update" ON faq_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin delete" ON faq_items FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin write" ON media_library FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow admin update" ON media_library FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin delete" ON media_library FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin write" ON cta_buttons FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow admin update" ON cta_buttons FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin delete" ON cta_buttons FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin write" ON pages_meta FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow admin update" ON pages_meta FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin delete" ON pages_meta FOR DELETE USING (auth.role() = 'authenticated');

-- Activity log is append-only for admins
CREATE POLICY "Allow admin write" ON activity_log FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow admin read" ON activity_log FOR SELECT USING (auth.role() = 'authenticated');

-- Insert initial pages metadata
INSERT INTO pages_meta (slug, title, meta_description, is_published) VALUES
  ('homepage', 'Heiwa House - A Wave Away', 'Experience the ultimate surf and lifestyle destination in Santa Cruz, Portugal.', true),
  ('flow', 'Flow - Heiwa House', 'Discover the flow of life at Heiwa House.', false),
  ('play', 'Play - Heiwa House', 'Play and explore activities around Heiwa House.', false),
  ('surf', 'Surf - Heiwa House', 'Join our surf camps and experience world-class surfing.', false),
  ('the-spot', 'The Spot - Heiwa House', 'Your perfect coastal retreat in Santa Cruz, Portugal.', false),
  ('about', 'About - Heiwa House', 'Learn about Heiwa House and our mission.', false),
  ('contact', 'Contact - Heiwa House', 'Get in touch with Heiwa House.', false)
ON CONFLICT (slug) DO NOTHING;
