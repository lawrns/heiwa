#!/bin/bash

# Database Migration Script - Migrates all data from old to new database
# Uses pg_dump and psql for reliable data transfer

set -e

OLD_DB_HOST="db.zejrhceuuujzgyukdwnb.supabase.co"
OLD_DB_USER="postgres"
OLD_DB_PASS="Hennie@@12Hennie@@12"
OLD_DB_NAME="postgres"

NEW_DB_HOST="db.pguipwhrxdzzrndbluxb.supabase.co"
NEW_DB_USER="postgres"
NEW_DB_PASS="cqv_kmb-WEP.vez6xze"
NEW_DB_NAME="postgres"

# Export PGPASSWORD to avoid password prompts
export PGPASSWORD="$OLD_DB_PASS"

echo "🔄 Starting database migration..."
echo ""

# Create temp directory for dumps
TEMP_DIR=$(mktemp -d)
echo "📁 Using temp directory: $TEMP_DIR"
echo ""

# Get list of tables
echo "📋 Getting list of tables from old database..."
TABLES=$(PGPASSWORD="$OLD_DB_PASS" psql -h "$OLD_DB_HOST" -U "$OLD_DB_USER" -d "$OLD_DB_NAME" -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;" 2>&1 | grep -v WARNING | grep -v "^$" | tr -d ' ' | grep -v "^$")

echo "Found tables:"
echo "$TABLES" | nl
echo ""

# Migrate each table
for TABLE in $TABLES; do
    echo "🔄 Migrating table: $TABLE"
    
    # Check if table exists in new database
    TABLE_EXISTS=$(PGPASSWORD="$NEW_DB_PASS" psql -h "$NEW_DB_HOST" -U "$NEW_DB_USER" -d "$NEW_DB_NAME" -t -A -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$TABLE');" 2>&1 | grep -v WARNING | grep -E "^t|^f" | head -1 | tr -d ' \n\r')
    
    if [ "$TABLE_EXISTS" != "t" ]; then
        echo "  ⚠️  Table $TABLE doesn't exist in new database (exists=$TABLE_EXISTS), skipping..."
        echo ""
        continue
    fi
    
    # Get row count from old database
    OLD_COUNT=$(PGPASSWORD="$OLD_DB_PASS" psql -h "$OLD_DB_HOST" -U "$OLD_DB_USER" -d "$OLD_DB_NAME" -t -c "SELECT COUNT(*) FROM $TABLE;" 2>&1 | grep -v WARNING | tr -d ' ')
    
    if [ "$OLD_COUNT" = "0" ] || [ -z "$OLD_COUNT" ]; then
        echo "  ℹ️  No data to migrate (0 rows)"
        echo ""
        continue
    fi
    
    echo "  📊 Found $OLD_COUNT rows in old database"
    
    # Export data to CSV
    echo "  📤 Exporting data..."
    PGPASSWORD="$OLD_DB_PASS" psql -h "$OLD_DB_HOST" -U "$OLD_DB_USER" -d "$OLD_DB_NAME" -c "\COPY (SELECT * FROM $TABLE) TO '$TEMP_DIR/${TABLE}_data.csv' WITH CSV HEADER;" 2>&1 | grep -v WARNING
    
    # Check if CSV was created and has data
    if [ ! -f "$TEMP_DIR/${TABLE}_data.csv" ] || [ ! -s "$TEMP_DIR/${TABLE}_data.csv" ]; then
        echo "  ⚠️  No data exported, skipping..."
        echo ""
        continue
    fi
    
    # Count rows in CSV (subtract 1 for header)
    CSV_ROWS=$(($(wc -l < "$TEMP_DIR/${TABLE}_data.csv") - 1))
    echo "  📥 Importing $CSV_ROWS rows..."
    
    # Disable triggers
    PGPASSWORD="$NEW_DB_PASS" psql -h "$NEW_DB_HOST" -U "$NEW_DB_USER" -d "$NEW_DB_NAME" -c "ALTER TABLE $TABLE DISABLE TRIGGER ALL;" 2>&1 | grep -v WARNING || true
    
    # Truncate existing data (optional - comment out if you want to merge)
    echo "  🗑️  Clearing existing data..."
    PGPASSWORD="$NEW_DB_PASS" psql -h "$NEW_DB_HOST" -U "$NEW_DB_USER" -d "$NEW_DB_NAME" -c "TRUNCATE TABLE $TABLE CASCADE;" 2>&1 | grep -v WARNING || true
    
    # Import data
    PGPASSWORD="$NEW_DB_PASS" psql -h "$NEW_DB_HOST" -U "$NEW_DB_USER" -d "$NEW_DB_NAME" -c "\COPY $TABLE FROM '$TEMP_DIR/${TABLE}_data.csv' WITH CSV HEADER;" 2>&1 | grep -v WARNING
    
    # Re-enable triggers
    PGPASSWORD="$NEW_DB_PASS" psql -h "$NEW_DB_HOST" -U "$NEW_DB_USER" -d "$NEW_DB_NAME" -c "ALTER TABLE $TABLE ENABLE TRIGGER ALL;" 2>&1 | grep -v WARNING || true
    
    # Verify
    NEW_COUNT=$(PGPASSWORD="$NEW_DB_PASS" psql -h "$NEW_DB_HOST" -U "$NEW_DB_USER" -d "$NEW_DB_NAME" -t -c "SELECT COUNT(*) FROM $TABLE;" 2>&1 | grep -v WARNING | tr -d ' ')
    echo "  ✅ Migrated $NEW_COUNT rows"
    echo ""
done

# Cleanup
echo "🧹 Cleaning up temp files..."
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Migration complete!"

