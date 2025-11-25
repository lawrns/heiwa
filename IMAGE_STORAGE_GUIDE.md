# Image Storage Guide

## Overview

All images for the Heiwa House website are stored in Supabase Storage buckets. This guide explains the storage structure and how to manage images.

## Storage Buckets

### room-images
- **Purpose**: Room photos and images
- **Structure**: `{room_id}/{timestamp}_{filename}` or `general/{timestamp}_{filename}`
- **Example**: `f3f00cbb-c30e-4d84-9352-cfb6a76684d0/1763932928037_dorm.webp`

### surf-camp-images
- **Purpose**: Surf camp promotional images and posters
- **Structure**: `{timestamp}_{filename}`
- **Example**: `1763932926806_surf-weeks-front-page.jpg`

### page-images
- **Purpose**: Page-specific images (homepage, flow, play, surf, the-spot)
- **Structure**: `{page_slug}/{timestamp}_{filename}` or `homepage/{timestamp}_{filename}`
- **Example**: `flow/1763932922968_yoga_dome1.jpg`

### cms-media
- **Purpose**: General media files, videos, and gallery images
- **Structure**: `{category}/{timestamp}_{filename}` (e.g., `general/`, `videos/`)
- **Example**: `videos/1763932934179_Timeline-1.mp4`

## Image URL Format

All images are accessible via public URLs:
```
https://pguipwhrxdzzrndbluxb.supabase.co/storage/v1/object/public/{bucket}/{path}
```

## Uploading Images

### Via Admin Panel
1. Navigate to the admin panel
2. Use the ImageUpload component
3. Select the appropriate bucket
4. Upload images

### Via API
Use the `/api/upload` endpoint:
```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('bucket', 'room-images');
formData.append('path', roomId);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});
```

### Via Script
Use the migration scripts in `scripts/`:
- `scripts/migrate-images-to-supabase.js` - Upload images from local folder
- `scripts/update-database-image-references.js` - Update database references

## Database References

Images are referenced in the following database tables:
- `rooms.images` (TEXT[]) - Array of image URLs
- `page_content.image_url` (VARCHAR) - Single image URL
- `page_content.json_content` (JSONB) - May contain image URLs
- `homepage_sections.background_image` (VARCHAR)
- `testimonials.image_url` (VARCHAR)
- `media_library.public_url` (VARCHAR)
- `blog_post_translations.cover_image_url` (VARCHAR)
- `blog_authors.avatar_url` (VARCHAR)

## Code Usage

### Using Image URL Mapper
```typescript
import { getImageUrl } from '@/lib/image-url-mapper';

const supabaseUrl = getImageUrl('/images/rooms/dorm.webp');
// Returns: https://pguipwhrxdzzrndbluxb.supabase.co/storage/v1/object/public/room-images/...
```

### Direct Supabase URLs
If you have a Supabase URL, use it directly:
```typescript
const imageUrl = 'https://pguipwhrxdzzrndbluxb.supabase.co/storage/v1/object/public/room-images/...';
```

## Migration History

- **Date**: 2025-01-23
- **Total Images Migrated**: 76
- **Categories**: 
  - General: 46 images
  - Homepage: 6 images
  - Page Content: 12 images
  - Surf Camps: 4 images
  - Rooms: 4 images
  - Videos: 4 images

## Best Practices

1. **Always use Supabase Storage URLs** - Don't reference local `/images/` paths in production code
2. **Use appropriate buckets** - Organize images by purpose (rooms, surf camps, pages, etc.)
3. **Include timestamps** - Use timestamped filenames to avoid conflicts
4. **Update database references** - Always update database records when uploading new images
5. **Verify uploads** - Use the verification script to ensure images are accessible

## Troubleshooting

### Image Not Loading
1. Check if the URL is correct
2. Verify the bucket exists and is public
3. Check RLS policies allow public read access
4. Verify the file exists in storage

### Database Reference Not Updated
1. Run `scripts/update-database-image-references.js`
2. Check the database update log
3. Verify the image URL mapping file

### Migration Issues
1. Check `scripts/image-migration-log.json` for errors
2. Verify Supabase credentials are correct
3. Ensure storage buckets are created and configured

