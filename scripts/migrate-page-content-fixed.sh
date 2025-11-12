#!/bin/bash

# Migrate page_content with proper section mapping

set -e

OLD_DB_HOST="db.zejrhceuuujzgyukdwnb.supabase.co"
OLD_DB_USER="postgres"
OLD_DB_PASS="Hennie@@12Hennie@@12"
OLD_DB_NAME="postgres"

NEW_DB_HOST="db.pguipwhrxdzzrndbluxb.supabase.co"
NEW_DB_USER="postgres"
NEW_DB_PASS="cqv_kmb-WEP.vez6xze"
NEW_DB_NAME="postgres"

echo "📥 Migrating page_content with section mapping..."

export PGPASSWORD="$OLD_DB_PASS"

# Map section_type values:
# - hero -> hero
# - intro -> intro  
# - features -> features
# - text, image_text, video, custom -> intro (fallback)
# - faq -> faq
# - pricing -> features (fallback)

psql -h "$OLD_DB_HOST" -U "$OLD_DB_USER" -d "$OLD_DB_NAME" -c "
COPY (
  SELECT 
    id,
    page_slug,
    CASE 
      WHEN section_type = 'hero' THEN 'hero'
      WHEN section_type = 'intro' THEN 'intro'
      WHEN section_type = 'features' THEN 'features'
      WHEN section_type = 'faq' THEN 'faq'
      WHEN section_type = 'pricing' THEN 'features'
      ELSE 'intro'
    END as section,
    section_name as title,
    NULL as content,
    NULL as video_url,
    NULL as image_url,
    content as json_content,
    is_active,
    order_index,
    created_at,
    updated_at
  FROM page_content
) TO STDOUT WITH CSV HEADER;
" > /tmp/page_content_export.csv 2>&1 | grep -v WARNING || true

export PGPASSWORD="$NEW_DB_PASS"
psql -h "$NEW_DB_HOST" -U "$NEW_DB_USER" -d "$NEW_DB_NAME" -c "\COPY page_content(id, page_slug, section, title, content, video_url, image_url, json_content, is_active, order_index, created_at, updated_at) FROM '/tmp/page_content_export.csv' WITH CSV HEADER NULL '';" 2>&1 | grep -v WARNING || true

NEW_COUNT=$(psql -h "$NEW_DB_HOST" -U "$NEW_DB_USER" -d "$NEW_DB_NAME" -t -c "SELECT COUNT(*) FROM page_content;" 2>&1 | grep -v WARNING | grep -v DETAIL | tr -d ' ')
echo "✅ Migrated page_content: $NEW_COUNT rows"

unset PGPASSWORD

