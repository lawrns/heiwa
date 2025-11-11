#!/bin/bash

# Database Migration Script
# Migrates all data from old database to new database

OLD_DB="postgresql://postgres:Hennie@@12Hennie@@12@db.zejrhceuuujzgyukdwnb.supabase.co:5432/postgres"
NEW_DB="postgresql://postgres:cqv_kmb-WEP.vez6xze@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres"

echo "🔄 Starting database migration..."
echo ""

# Get list of tables from old database
echo "📋 Getting list of tables from old database..."
TABLES=$(psql "$OLD_DB" -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;" 2>&1 | grep -v WARNING | grep -v "^$" | tr -d ' ')

# Tables to skip (system tables, etc.)
SKIP_TABLES="schema_migrations"

echo "📊 Found tables:"
echo "$TABLES"
echo ""

# Function to migrate a table
migrate_table() {
    local table=$1
    echo "🔄 Migrating table: $table"
    
    # Get column names
    COLUMNS=$(psql "$OLD_DB" -t -c "SELECT string_agg(column_name, ', ' ORDER BY ordinal_position) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '$table';" 2>&1 | grep -v WARNING | tr -d ' ')
    
    if [ -z "$COLUMNS" ]; then
        echo "⚠️  No columns found for $table, skipping..."
        return
    fi
    
    # Export data from old database
    echo "  📤 Exporting data from old database..."
    psql "$OLD_DB" -c "COPY (SELECT * FROM $table) TO STDOUT WITH CSV HEADER;" > /tmp/${table}_data.csv 2>&1
    
    # Check if table exists in new database, if not create it
    TABLE_EXISTS=$(psql "$NEW_DB" -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$table');" 2>&1 | grep -v WARNING | tr -d ' ')
    
    if [ "$TABLE_EXISTS" != "t" ]; then
        echo "  ⚠️  Table $table doesn't exist in new database, skipping data import..."
        echo "  💡 You may need to run migrations first"
        return
    fi
    
    # Import data into new database
    echo "  📥 Importing data into new database..."
    
    # First, check if there's data
    ROW_COUNT=$(wc -l < /tmp/${table}_data.csv)
    if [ "$ROW_COUNT" -le 1 ]; then
        echo "  ℹ️  No data to migrate for $table"
        rm -f /tmp/${table}_data.csv
        return
    fi
    
    # Disable triggers temporarily to avoid constraint issues
    psql "$NEW_DB" -c "ALTER TABLE $table DISABLE TRIGGER ALL;" 2>&1 | grep -v WARNING
    
    # Copy data
    psql "$NEW_DB" -c "\COPY $table FROM '/tmp/${table}_data.csv' WITH CSV HEADER;" 2>&1 | grep -v WARNING
    
    # Re-enable triggers
    psql "$NEW_DB" -c "ALTER TABLE $table ENABLE TRIGGER ALL;" 2>&1 | grep -v WARNING
    
    echo "  ✅ Migrated $table"
    rm -f /tmp/${table}_data.csv
}

# Migrate each table
for table in $TABLES; do
    # Skip system tables
    if echo "$SKIP_TABLES" | grep -q "$table"; then
        echo "⏭️  Skipping $table"
        continue
    fi
    
    migrate_table "$table"
    echo ""
done

echo "✅ Database migration complete!"

