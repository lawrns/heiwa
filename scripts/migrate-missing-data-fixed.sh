#!/bin/bash

# Migration script for missing data with schema mapping

set -e

OLD_DB_HOST="db.zejrhceuuujzgyukdwnb.supabase.co"
OLD_DB_USER="postgres"
OLD_DB_PASS="Hennie@@12Hennie@@12"
OLD_DB_NAME="postgres"

NEW_DB_HOST="db.pguipwhrxdzzrndbluxb.supabase.co"
NEW_DB_USER="postgres"
NEW_DB_PASS="cqv_kmb-WEP.vez6xze"
NEW_DB_NAME="postgres"

echo "🔄 Migrating missing data with schema mapping..."
echo ""

export PGPASSWORD="$OLD_DB_PASS"

# Migrate testimonials (map old schema to new schema)
echo "📥 Migrating testimonials..."
OLD_COUNT=$(psql -h "$OLD_DB_HOST" -U "$OLD_DB_USER" -d "$OLD_DB_NAME" -t -c "SELECT COUNT(*) FROM testimonials;" 2>&1 | grep -v WARNING | grep -v DETAIL | tr -d ' ')

if [ "$OLD_COUNT" -gt "0" ]; then
  echo "  Found $OLD_COUNT rows in old database"
  
  # Export and transform testimonials
  psql -h "$OLD_DB_HOST" -U "$OLD_DB_USER" -d "$OLD_DB_NAME" -c "
    COPY (
      SELECT 
        id,
        author_name,
        rating,
        content as text,
        author_image as image_url,
        false as verified,
        '' as time_ago,
        is_active,
        order_index,
        created_at,
        updated_at
      FROM testimonials
    ) TO STDOUT WITH CSV HEADER;
  " > /tmp/testimonials_export.csv 2>&1 | grep -v WARNING || true
  
  export PGPASSWORD="$NEW_DB_PASS"
  psql -h "$NEW_DB_HOST" -U "$NEW_DB_USER" -d "$NEW_DB_NAME" -c "\COPY testimonials(id, author_name, rating, text, image_url, verified, time_ago, is_active, order_index, created_at, updated_at) FROM '/tmp/testimonials_export.csv' WITH CSV HEADER;" 2>&1 | grep -v WARNING || true
  
  NEW_COUNT=$(psql -h "$NEW_DB_HOST" -U "$NEW_DB_USER" -d "$NEW_DB_NAME" -t -c "SELECT COUNT(*) FROM testimonials;" 2>&1 | grep -v WARNING | grep -v DETAIL | tr -d ' ')
  echo "  ✅ Migrated testimonials: $NEW_COUNT rows"
else
  echo "  ⚠️  No testimonials to migrate"
fi
echo ""

# Migrate experiences (simplified - only basic fields)
echo "📥 Migrating experiences..."
export PGPASSWORD="$OLD_DB_PASS"
OLD_COUNT=$(psql -h "$OLD_DB_HOST" -U "$OLD_DB_USER" -d "$OLD_DB_NAME" -t -c "SELECT COUNT(*) FROM experiences;" 2>&1 | grep -v WARNING | grep -v DETAIL | tr -d ' ')

if [ "$OLD_COUNT" -gt "0" ]; then
  echo "  Found $OLD_COUNT rows in old database"
  
  psql -h "$OLD_DB_HOST" -U "$OLD_DB_USER" -d "$OLD_DB_NAME" -c "
    COPY (
      SELECT 
        id,
        title,
        image_url,
        category,
        active,
        created_at,
        updated_at
      FROM experiences
    ) TO STDOUT WITH CSV HEADER;
  " > /tmp/experiences_export.csv 2>&1 | grep -v WARNING || true
  
  export PGPASSWORD="$NEW_DB_PASS"
  psql -h "$NEW_DB_HOST" -U "$NEW_DB_USER" -d "$NEW_DB_NAME" -c "\COPY experiences(id, title, image_url, category, active, created_at, updated_at) FROM '/tmp/experiences_export.csv' WITH CSV HEADER;" 2>&1 | grep -v WARNING || true
  
  NEW_COUNT=$(psql -h "$NEW_DB_HOST" -U "$NEW_DB_USER" -d "$NEW_DB_NAME" -t -c "SELECT COUNT(*) FROM experiences;" 2>&1 | grep -v WARNING | grep -v DETAIL | tr -d ' ')
  echo "  ✅ Migrated experiences: $NEW_COUNT rows"
else
  echo "  ⚠️  No experiences to migrate"
fi
echo ""

# Migrate page_content (map old schema to new schema)
echo "📥 Migrating page_content..."
export PGPASSWORD="$OLD_DB_PASS"
OLD_COUNT=$(psql -h "$OLD_DB_HOST" -U "$OLD_DB_USER" -d "$OLD_DB_NAME" -t -c "SELECT COUNT(*) FROM page_content;" 2>&1 | grep -v WARNING | grep -v DETAIL | tr -d ' ')

if [ "$OLD_COUNT" -gt "0" ]; then
  echo "  Found $OLD_COUNT rows in old database"
  
  # Map section_type to section, content (jsonb) to json_content, section_name to title
  psql -h "$OLD_DB_HOST" -U "$OLD_DB_USER" -d "$OLD_DB_NAME" -c "
    COPY (
      SELECT 
        id,
        page_slug,
        section_type as section,
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
  echo "  ✅ Migrated page_content: $NEW_COUNT rows"
else
  echo "  ⚠️  No page_content to migrate"
fi
echo ""

unset PGPASSWORD
echo "✅ Migration complete!"

