#!/bin/bash

# Migrate surf_camps from old database to new database
# Handles schema differences between old and new databases

set -e

OLD_DB="postgresql://postgres:Hennie%40%4012Hennie%40%4012@db.zejrhceuuujzgyukdwnb.supabase.co:5432/postgres"
NEW_DB="postgresql://postgres:cqv_kmb-WEP.vez6xze@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres"

echo "🔄 Migrating surf_camps from old database to new database..."
echo ""

# First, get all surf camps from old database
echo "📥 Fetching surf camps from old database..."
psql "$OLD_DB" -t -A -F"|" -c "
SELECT 
    id::text,
    name,
    start_date::date::text,
    end_date::date::text,
    price::numeric::text,
    max_participants::text,
    COALESCE(level, 'all') as level,
    COALESCE(description, '') as description,
    COALESCE(is_active::text, 'true') as is_active
FROM surf_camps 
ORDER BY start_date;
" > /tmp/surf_camps_data.txt

echo "Found $(wc -l < /tmp/surf_camps_data.txt | tr -d ' ') surf camps"
echo ""

# Clear existing data in new database (optional - comment out if you want to keep existing)
echo "🗑️  Clearing existing surf_camps in new database..."
psql "$NEW_DB" -c "TRUNCATE TABLE surf_camps CASCADE;" || echo "  (Table might be empty or have foreign key constraints)"

echo ""
echo "📤 Inserting surf camps into new database..."

# Read each line and insert
while IFS='|' read -r id name start_date end_date price max_participants level description is_active; do
    # Skip empty lines
    [ -z "$id" ] && continue
    
    # Calculate available_spots (we'll use max_participants as total_spots and assume all spots available initially)
    total_spots="$max_participants"
    available_spots="$max_participants"
    
    echo "  Inserting: $name ($start_date to $end_date)"
    
    psql "$NEW_DB" -c "
    INSERT INTO surf_camps (
        id, name, start_date, end_date, price, 
        available_spots, total_spots, description, is_active
    ) VALUES (
        '$id'::uuid,
        $(psql "$NEW_DB" -t -A -c "SELECT quote_literal('$name');"),
        '$start_date'::date,
        '$end_date'::date,
        $price::numeric,
        $available_spots::integer,
        $total_spots::integer,
        $(psql "$NEW_DB" -t -A -c "SELECT quote_literal('$description');"),
        $is_active::boolean
    ) ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        start_date = EXCLUDED.start_date,
        end_date = EXCLUDED.end_date,
        price = EXCLUDED.price,
        available_spots = EXCLUDED.available_spots,
        total_spots = EXCLUDED.total_spots,
        description = EXCLUDED.description,
        is_active = EXCLUDED.is_active;
    " 2>&1 | grep -v WARNING || echo "    ✓ Inserted/Updated"
    
done < /tmp/surf_camps_data.txt

echo ""
echo "✅ Migration complete!"
echo ""
echo "📊 Verifying migration..."
psql "$NEW_DB" -c "SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_active = true) as active FROM surf_camps;"

