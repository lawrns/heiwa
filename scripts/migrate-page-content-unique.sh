#!/bin/bash

# Migrate page_content avoiding unique constraint violations

set -e

OLD_DB_HOST="db.zejrhceuuujzgyukdwnb.supabase.co"
OLD_DB_USER="postgres"
OLD_DB_PASS="Hennie@@12Hennie@@12"
OLD_DB_NAME="postgres"

NEW_DB_HOST="db.pguipwhrxdzzrndbluxb.supabase.co"
NEW_DB_USER="postgres"
NEW_DB_PASS="cqv_kmb-WEP.vez6xze"
NEW_DB_NAME="postgres"

echo "📥 Migrating page_content (skipping duplicates)..."

export PGPASSWORD="$OLD_DB_PASS"

# Use INSERT ... ON CONFLICT DO NOTHING to skip duplicates
psql -h "$OLD_DB_HOST" -U "$OLD_DB_USER" -d "$OLD_DB_NAME" -c "
DO \$\$
DECLARE
  rec RECORD;
  mapped_section TEXT;
BEGIN
  FOR rec IN SELECT * FROM page_content LOOP
    -- Map section_type to section
    mapped_section := CASE 
      WHEN rec.section_type = 'hero' THEN 'hero'
      WHEN rec.section_type = 'intro' THEN 'intro'
      WHEN rec.section_type = 'features' THEN 'features'
      WHEN rec.section_type = 'faq' THEN 'faq'
      WHEN rec.section_type = 'pricing' THEN 'features'
      ELSE 'intro'
    END;
    
    -- Insert only if not exists
    INSERT INTO page_content (
      id, page_slug, section, title, content, video_url, image_url, 
      json_content, is_active, order_index, created_at, updated_at
    )
    SELECT 
      rec.id,
      rec.page_slug,
      mapped_section,
      rec.section_name,
      NULL,
      NULL,
      NULL,
      rec.content,
      rec.is_active,
      rec.order_index,
      rec.created_at,
      rec.updated_at
    WHERE NOT EXISTS (
      SELECT 1 FROM page_content 
      WHERE page_slug = rec.page_slug AND section = mapped_section
    )
    ON CONFLICT (page_slug, section) DO NOTHING;
  END LOOP;
END \$\$;
" -h "$NEW_DB_HOST" -U "$NEW_DB_USER" -d "$NEW_DB_NAME" 2>&1 | grep -v WARNING || true

export PGPASSWORD="$NEW_DB_PASS"
NEW_COUNT=$(psql -h "$NEW_DB_HOST" -U "$NEW_DB_USER" -d "$NEW_DB_NAME" -t -c "SELECT COUNT(*) FROM page_content;" 2>&1 | grep -v WARNING | grep -v DETAIL | tr -d ' ')
echo "✅ Migrated page_content: $NEW_COUNT rows"

unset PGPASSWORD

