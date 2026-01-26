-- Schema Drift Fix Migration
-- Generated: 2025-12-01
-- Purpose: Fix all schema discrepancies between code expectations and database reality

-- =====================================================
-- 1. FIX page_content table
-- Code expects: section_type, created_by, updated_by
-- DB has: section, section_name (no created_by/updated_by)
-- =====================================================

-- Add section_type column if it doesn't exist (map from section)
ALTER TABLE page_content 
ADD COLUMN IF NOT EXISTS section_type VARCHAR(50);

-- Populate section_type from existing section column
UPDATE page_content 
SET section_type = section 
WHERE section_type IS NULL;

-- Add created_by and updated_by columns
ALTER TABLE page_content 
ADD COLUMN IF NOT EXISTS created_by TEXT;

ALTER TABLE page_content 
ADD COLUMN IF NOT EXISTS updated_by TEXT;

-- =====================================================
-- 2. FIX testimonials table  
-- Code expects: author_email, author_image, is_featured, content, created_by, updated_by
-- DB has: author_name, rating, text, image_url, verified, time_ago, is_active, order_index
-- =====================================================

-- Add author_email column
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS author_email VARCHAR(255);

-- Add author_image column (use image_url as source if exists)
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS author_image VARCHAR(500);

-- Populate author_image from image_url
UPDATE testimonials 
SET author_image = image_url 
WHERE author_image IS NULL AND image_url IS NOT NULL;

-- Add is_featured column (default to false, map verified if needed)
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Add content column (map from text)
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS content TEXT;

-- Populate content from text column
UPDATE testimonials 
SET content = text 
WHERE content IS NULL AND text IS NOT NULL;

-- Add created_by and updated_by columns
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS created_by TEXT;

ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS updated_by TEXT;

-- =====================================================
-- 3. FIX surf_camp_enrollments table
-- Code expects: booking_id
-- DB doesn't have this column
-- =====================================================

-- Add booking_id column for room assignments integration
ALTER TABLE surf_camp_enrollments 
ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id);

-- =====================================================
-- 4. FIX homepage_content table (if section_type needed)
-- Code may expect section_type but DB uses section
-- =====================================================

ALTER TABLE homepage_content 
ADD COLUMN IF NOT EXISTS section_type VARCHAR(50);

-- Populate section_type from existing section column
UPDATE homepage_content 
SET section_type = section 
WHERE section_type IS NULL;

-- =====================================================
-- 5. Verify and add any missing indexes for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_page_content_page_slug 
ON page_content(page_slug);

CREATE INDEX IF NOT EXISTS idx_page_content_section_type 
ON page_content(section_type);

CREATE INDEX IF NOT EXISTS idx_testimonials_is_featured 
ON testimonials(is_featured);

CREATE INDEX IF NOT EXISTS idx_surf_camp_enrollments_booking_id 
ON surf_camp_enrollments(booking_id);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
-- Migration completed. Schema drift fixes applied:
-- 1. page_content: Added section_type, created_by, updated_by
-- 2. testimonials: Added author_email, author_image, is_featured, content, created_by, updated_by
-- 3. surf_camp_enrollments: Added booking_id
-- 4. homepage_content: Added section_type
-- 5. Added performance indexes
