-- Create Storage Buckets for Image Uploads
-- Run this in Supabase SQL Editor

-- Create room-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('room-images', 'room-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create surf-camp-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('surf-camp-images', 'surf-camp-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create add-on-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('add-on-images', 'add-on-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create page-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('page-images', 'page-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for public read access
CREATE POLICY "Public read access for room-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'room-images');

CREATE POLICY "Public read access for surf-camp-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'surf-camp-images');

CREATE POLICY "Public read access for add-on-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'add-on-images');

CREATE POLICY "Public read access for page-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'page-images');

-- Allow authenticated users to upload (admin access)
CREATE POLICY "Authenticated users can upload to room-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'room-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can upload to surf-camp-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'surf-camp-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can upload to add-on-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'add-on-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can upload to page-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'page-images' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete from room-images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'room-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete from surf-camp-images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'surf-camp-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete from add-on-images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'add-on-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete from page-images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'page-images' AND
  auth.role() = 'authenticated'
);



