-- Blog System Tables Migration
-- Created: 2025-01-20
-- Purpose: Complete blog system with bilingual support (en/fr), SEO, and rich content

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Blog Categories Table
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Blog Tags Table
CREATE TABLE IF NOT EXISTS blog_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Blog Authors Table
CREATE TABLE IF NOT EXISTS blog_authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  bio TEXT,
  avatar_url VARCHAR(500),
  social_links JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Blog Posts Table (metadata)
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES blog_authors(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published')),
  featured BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  reading_minutes INTEGER,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Blog Post Tags (many-to-many relationship)
CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Blog Post Translations Table (localized content)
CREATE TABLE IF NOT EXISTS blog_post_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  locale VARCHAR(10) NOT NULL CHECK (locale IN ('en', 'fr')),
  slug_localized VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  excerpt TEXT,
  body_rich JSONB NOT NULL DEFAULT '{}',
  cover_image_url VARCHAR(500),
  cover_alt_text VARCHAR(500),
  seo_title VARCHAR(500),
  seo_description TEXT,
  canonical_url VARCHAR(500),
  noindex BOOLEAN DEFAULT false,
  faq_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, locale),
  UNIQUE(locale, slug_localized)
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_active ON blog_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON blog_tags(slug);
CREATE INDEX IF NOT EXISTS idx_blog_authors_active ON blog_authors(is_active);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_post ON blog_post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_tag ON blog_post_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_translations_post ON blog_post_translations(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_translations_locale ON blog_post_translations(locale);
CREATE INDEX IF NOT EXISTS idx_blog_post_translations_slug ON blog_post_translations(locale, slug_localized);
-- Note: Partial index for published posts would require a function-based approach
-- For now, we rely on the status index on blog_posts table

-- Enable Row Level Security (RLS)
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public read access for published content
CREATE POLICY "Allow public read active categories" ON blog_categories 
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read tags" ON blog_tags 
  FOR SELECT USING (true);

CREATE POLICY "Allow public read active authors" ON blog_authors 
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read published posts" ON blog_posts 
  FOR SELECT USING (status = 'published');

CREATE POLICY "Allow public read published post tags" ON blog_post_tags 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM blog_posts 
      WHERE blog_posts.id = blog_post_tags.post_id 
      AND blog_posts.status = 'published'
    )
  );

CREATE POLICY "Allow public read published translations" ON blog_post_translations 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM blog_posts 
      WHERE blog_posts.id = blog_post_translations.post_id 
      AND blog_posts.status = 'published'
    )
  );

-- RLS Policies - Admin write access (authenticated users)
CREATE POLICY "Allow admin manage categories" ON blog_categories 
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin manage tags" ON blog_tags 
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin manage authors" ON blog_authors 
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin manage posts" ON blog_posts 
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin manage post tags" ON blog_post_tags 
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin manage translations" ON blog_post_translations 
  FOR ALL USING (auth.role() = 'authenticated');

-- Create Storage Bucket for Blog Images
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for blog-images bucket
CREATE POLICY "Public read access for blog-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can upload to blog-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update blog-images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete from blog-images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog-images' AND
  auth.role() = 'authenticated'
);

-- Function to calculate reading minutes (approximate: 200 words per minute)
CREATE OR REPLACE FUNCTION calculate_reading_minutes(body_jsonb JSONB)
RETURNS INTEGER AS $$
DECLARE
  word_count INTEGER;
BEGIN
  -- Extract text from JSONB and count words
  -- This is a simplified version - TipTap JSONB structure may vary
  word_count := (
    SELECT COALESCE(
      (SELECT SUM(
        LENGTH(
          REGEXP_REPLACE(
            value::text, 
            '[^a-zA-Z0-9\s]', 
            '', 
            'g'
          )
        )
      ) FROM jsonb_each_text(body_jsonb)) / 5,
      0
    )
  );
  
  -- Return reading minutes (200 words per minute average)
  RETURN GREATEST(1, CEIL(word_count / 200.0));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to update reading_minutes when body_rich changes
CREATE OR REPLACE FUNCTION update_reading_minutes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE blog_posts
  SET reading_minutes = calculate_reading_minutes(NEW.body_rich)
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reading_minutes
AFTER INSERT OR UPDATE OF body_rich ON blog_post_translations
FOR EACH ROW
EXECUTE FUNCTION update_reading_minutes();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_blog_categories_updated_at
BEFORE UPDATE ON blog_categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_blog_tags_updated_at
BEFORE UPDATE ON blog_tags
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_blog_authors_updated_at
BEFORE UPDATE ON blog_authors
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_blog_posts_updated_at
BEFORE UPDATE ON blog_posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_blog_post_translations_updated_at
BEFORE UPDATE ON blog_post_translations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

