#!/bin/bash

# Migration script for missing data from old database to new database

set -e

OLD_DB_HOST="db.zejrhceuuujzgyukdwnb.supabase.co"
OLD_DB_USER="postgres"
OLD_DB_PASS="Hennie@@12Hennie@@12"
OLD_DB_NAME="postgres"

NEW_DB_HOST="db.pguipwhrxdzzrndbluxb.supabase.co"
NEW_DB_USER="postgres"
NEW_DB_PASS="cqv_kmb-WEP.vez6xze"
NEW_DB_NAME="postgres"

echo "🔄 Migrating missing data from old database to new database..."
echo ""

# Function to migrate a table
migrate_table() {
  local table_name=$1
  local columns=$2
  
  echo "📥 Migrating $table_name..."
  
  # Export data from old database
  export PGPASSWORD="$OLD_DB_PASS"
  local count=$(psql -h "$OLD_DB_HOST" -U "$OLD_DB_USER" -d "$OLD_DB_NAME" -t -c "SELECT COUNT(*) FROM $table_name;" 2>&1 | grep -v WARNING | tr -d ' ')
  
  if [ "$count" -eq "0" ]; then
    echo "  ⚠️  No data in old database for $table_name, skipping..."
    return
  fi
  
  echo "  Found $count rows in old database"
  
  # Export to CSV
  psql -h "$OLD_DB_HOST" -U "$OLD_DB_USER" -d "$OLD_DB_NAME" -c "COPY (SELECT $columns FROM $table_name) TO STDOUT WITH CSV HEADER;" > /tmp/${table_name}_export.csv 2>&1 | grep -v WARNING || true
  
  # Check if CSV was created and has data
  if [ ! -f "/tmp/${table_name}_export.csv" ] || [ ! -s "/tmp/${table_name}_export.csv" ]; then
    echo "  ⚠️  Failed to export $table_name, skipping..."
    return
  fi
  
  # Import to new database
  export PGPASSWORD="$NEW_DB_PASS"
  psql -h "$NEW_DB_HOST" -U "$NEW_DB_USER" -d "$NEW_DB_NAME" -c "\COPY $table_name($columns) FROM '/tmp/${table_name}_export.csv' WITH CSV HEADER;" 2>&1 | grep -v WARNING || true
  
  # Verify
  local new_count=$(psql -h "$NEW_DB_HOST" -U "$NEW_DB_USER" -d "$NEW_DB_NAME" -t -c "SELECT COUNT(*) FROM $table_name;" 2>&1 | grep -v WARNING | tr -d ' ')
  echo "  ✅ Migrated $table_name: $new_count rows in new database"
  echo ""
}

# Migrate testimonials
migrate_table "testimonials" "id, name, content, rating, image_url, location, is_featured, order_index, created_at, updated_at"

# Migrate page_content
migrate_table "page_content" "id, page_slug, section, title, content, video_url, image_url, json_content, is_active, order_index, created_at, updated_at"

# Migrate experiences
migrate_table "experiences" "id, name, description, category, image_url, price, duration, location, is_active, order_index, created_at, updated_at"

# Migrate homepage_content (only if we need more rows)
echo "📥 Checking homepage_content..."
export PGPASSWORD="$OLD_DB_PASS"
OLD_HOME_COUNT=$(psql -h "$OLD_DB_HOST" -U "$OLD_DB_USER" -d "$OLD_DB_NAME" -t -c "SELECT COUNT(*) FROM homepage_content;" 2>&1 | grep -v WARNING | tr -d ' ')

export PGPASSWORD="$NEW_DB_PASS"
NEW_HOME_COUNT=$(psql -h "$NEW_DB_HOST" -U "$NEW_DB_USER" -d "$NEW_DB_NAME" -t -c "SELECT COUNT(*) FROM homepage_content;" 2>&1 | grep -v WARNING | tr -d ' ')

if [ "$OLD_HOME_COUNT" -gt "$NEW_HOME_COUNT" ]; then
  echo "  Found $OLD_HOME_COUNT rows in old database, $NEW_HOME_COUNT in new database"
  migrate_table "homepage_content" "id, section, title, subtitle, description, content, cards, booking_data, testimonials, facilities, google_rating, video_id, is_active, order_index, created_at, updated_at"
else
  echo "  ✅ homepage_content already has sufficient data ($NEW_HOME_COUNT rows)"
fi

echo ""
echo "✅ Migration complete!"
unset PGPASSWORD

