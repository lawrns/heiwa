-- Image Migration to Supabase Storage
-- Date: 2025-01-23
-- Purpose: Update all image references from old Supabase URLs and local paths to new Supabase storage URLs
-- 
-- This migration updates image references that were already migrated via scripts.
-- It serves as a record and can be used for rollback if needed.

-- Note: Most updates are handled by the Node.js scripts (update-database-image-references.js)
-- This SQL file documents the changes and provides rollback queries

-- ============================================================================
-- ROLLBACK QUERIES (for reference - do not run unless rolling back)
-- ============================================================================

-- Rollback rooms table (if needed)
-- UPDATE rooms SET images = ARRAY['old_url_here'] WHERE id = 'room_id_here';

-- Rollback page_content table (if needed)
-- UPDATE page_content SET image_url = 'old_url_here', json_content = 'old_json_here'::jsonb WHERE id = 'record_id_here';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check for remaining old Supabase URLs
SELECT 
  'rooms' as table_name,
  id,
  name,
  images
FROM rooms
WHERE EXISTS (
  SELECT 1 FROM unnest(images) AS img
  WHERE img::text LIKE '%zejrhceuuujzgyukdwnb.supabase.co%'
);

SELECT 
  'page_content' as table_name,
  id,
  page_slug,
  section,
  image_url
FROM page_content
WHERE image_url LIKE '%zejrhceuuujzgyukdwnb.supabase.co%'
   OR image_url LIKE '%/images/%';

-- Check for local paths
SELECT 
  'rooms' as table_name,
  id,
  name,
  images
FROM rooms
WHERE EXISTS (
  SELECT 1 FROM unnest(images) AS img
  WHERE img::text LIKE '/images/%'
);

SELECT 
  'page_content' as table_name,
  id,
  page_slug,
  section,
  image_url,
  json_content
FROM page_content
WHERE image_url LIKE '/images/%'
   OR json_content::text LIKE '%/images/%';

-- ============================================================================
-- SUMMARY
-- ============================================================================

-- This migration was primarily executed via Node.js scripts:
-- 1. scripts/migrate-images-to-supabase.js - Uploaded all images to Supabase storage
-- 2. scripts/update-database-image-references.js - Updated database references
-- 
-- The following tables were updated:
-- - rooms.images (TEXT[]) - Updated 4 rooms with new Supabase URLs
-- - page_content.image_url (VARCHAR) - Updated image URLs
-- - page_content.json_content (JSONB) - Updated image URLs within JSON content
--
-- All image URLs now point to: pguipwhrxdzzrndbluxb.supabase.co
-- Storage buckets used:
-- - room-images
-- - surf-camp-images
-- - page-images
-- - cms-media

