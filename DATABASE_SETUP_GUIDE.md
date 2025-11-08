# Database Setup Guide - CMS Tables

**Date:** November 8, 2025  
**Status:** Ready for Deployment

---

## Quick Start

### Step 1: Connect to Supabase Database via psql

```bash
psql postgresql://postgres:Hennie@@12Hennie@@12@db.zejrhceuuujzgyukdwnb.supabase.co:5432/postgres
```

**Connection Details:**
- **Host:** db.zejrhceuuujzgyukdwnb.supabase.co
- **Port:** 5432
- **Database:** postgres
- **User:** postgres
- **Password:** Hennie@@12Hennie@@12

### Step 2: Create Tables

Once connected to psql, run the migration:

```sql
\i migrations/004_cms_content_tables.sql
```

Or copy and paste the entire SQL from `migrations/004_cms_content_tables.sql`

### Step 3: Verify Tables Created

```sql
\dt
```

You should see:
- `homepage_sections`
- `page_content`
- `testimonials`
- `faq_items`
- `media_library`
- `cta_buttons`
- `activity_log`
- `pages_meta`

---

## Tables Overview

### 1. homepage_sections
**Purpose:** Store homepage section content (hero, activities, testimonials, CTA)

**Columns:**
- `id` (UUID) - Primary key
- `section_type` - hero, activities_around, what_we_are_about, testimonials, cta
- `title` - Section title
- `subtitle` - Section subtitle
- `description` - Section description
- `video_url` - Optional video URL
- `background_image` - Optional background image URL
- `link_url` - Optional CTA link
- `link_text` - Optional CTA text
- `is_active` - Boolean flag
- `order_index` - Sort order
- `created_at`, `updated_at` - Timestamps
- `created_by`, `updated_by` - User tracking

---

### 2. page_content
**Purpose:** Store content for Flow, Play, Surf, The Spot, About, Contact pages

**Columns:**
- `id` (UUID) - Primary key
- `page_slug` - flow, play, surf, the-spot, about, contact
- `section_type` - hero, intro, features, gallery, pricing, text, image_text, video, custom
- `section_name` - Human-readable section name
- `content` (JSONB) - Flexible content structure
- `order_index` - Sort order
- `is_active` - Boolean flag
- `created_at`, `updated_at` - Timestamps
- `created_by`, `updated_by` - User tracking

---

### 3. testimonials
**Purpose:** Store guest testimonials and reviews

**Columns:**
- `id` (UUID) - Primary key
- `author_name` - Guest name
- `author_title` - Guest title/role
- `author_image` - Guest photo URL
- `content` - Testimonial text
- `rating` - 1-5 star rating
- `is_featured` - Featured on homepage
- `is_active` - Boolean flag
- `order_index` - Sort order
- `created_at`, `updated_at` - Timestamps
- `created_by`, `updated_by` - User tracking

---

### 4. faq_items
**Purpose:** Store FAQ questions and answers

**Columns:**
- `id` (UUID) - Primary key
- `question` - FAQ question
- `answer` - FAQ answer
- `category` - FAQ category
- `is_active` - Boolean flag
- `order_index` - Sort order
- `created_at`, `updated_at` - Timestamps
- `created_by`, `updated_by` - User tracking

---

### 5. media_library
**Purpose:** Store media files (images, videos, documents)

**Columns:**
- `id` (UUID) - Primary key
- `filename` - Stored filename
- `original_name` - Original filename
- `file_type` - image, video, document, other
- `file_size` - File size in bytes
- `category` - Media category
- `url` - Public URL
- `thumbnail_url` - Thumbnail URL
- `alt_text` - Alt text for images
- `description` - Media description
- `is_public` - Public access flag
- `created_at`, `updated_at` - Timestamps
- `created_by`, `updated_by` - User tracking

---

### 6. cta_buttons
**Purpose:** Store call-to-action buttons

**Columns:**
- `id` (UUID) - Primary key
- `text` - Button text
- `url` - Button link
- `button_type` - primary, secondary, outline, ghost
- `section_id` - Associated section
- `page_slug` - Associated page
- `is_active` - Boolean flag
- `order_index` - Sort order
- `created_at`, `updated_at` - Timestamps
- `created_by`, `updated_by` - User tracking

---

### 7. activity_log
**Purpose:** Audit trail for all CMS operations

**Columns:**
- `id` (UUID) - Primary key
- `table_name` - Table affected
- `record_id` - Record ID
- `action` - create, update, delete
- `old_values` (JSONB) - Previous values
- `new_values` (JSONB) - New values
- `user_id` - User who made change
- `ip_address` - IP address
- `created_at` - Timestamp

---

### 8. pages_meta
**Purpose:** Store page-level metadata (SEO, status)

**Columns:**
- `id` (UUID) - Primary key
- `slug` - Page slug (unique)
- `title` - Page title
- `meta_description` - SEO description
- `meta_keywords` - SEO keywords
- `og_image` - Open Graph image
- `is_published` - Publication status
- `last_edited_by` - Last editor
- `created_at`, `updated_at` - Timestamps

---

## Indexes Created

For optimal performance, the following indexes are created:

```sql
- idx_homepage_sections_order
- idx_homepage_sections_active
- idx_page_content_slug
- idx_page_content_order
- idx_testimonials_featured
- idx_testimonials_active
- idx_faq_category
- idx_faq_active
- idx_media_category
- idx_media_type
- idx_activity_log_table
- idx_activity_log_record
- idx_activity_log_created
```

---

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

### Public Read Access
- `homepage_sections` - Read active sections
- `page_content` - Read active content
- `testimonials` - Read active testimonials
- `faq_items` - Read active FAQ items
- `media_library` - Read public media
- `cta_buttons` - Read active buttons
- `pages_meta` - Read published pages

### Admin Write Access
- All tables allow authenticated users to INSERT, UPDATE, DELETE
- Activity log is append-only for audit trail

---

## Verification Queries

### Check all tables created:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Check indexes:
```sql
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY indexname;
```

### Check RLS policies:
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
```

### Check initial pages:
```sql
SELECT slug, title, is_published FROM pages_meta;
```

---

## Troubleshooting

### Connection Issues
If you can't connect, verify:
- Correct password: `Hennie@@12Hennie@@12`
- Correct host: `db.zejrhceuuujzgyukdwnb.supabase.co`
- Port is open: 5432
- Network access allowed

### SQL Errors
If you get SQL errors:
- Check for typos in table/column names
- Verify UUID extension is enabled
- Check RLS policies aren't blocking operations

### Permission Errors
If you get permission errors:
- Ensure you're using the postgres user
- Check that RLS policies allow the operation
- Verify authentication role is set correctly

---

## Next Steps

1. ✅ Run the SQL migration to create tables
2. ⏳ Test API endpoints with new tables
3. ⏳ Populate initial data
4. ⏳ Test admin CMS dashboard
5. ⏳ Deploy to production

---

**Status:** Ready for Database Setup  
**Estimated Time:** 5 minutes to run migration  
**Backup:** Supabase has automatic backups enabled
