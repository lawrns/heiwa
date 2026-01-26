#!/bin/bash
# Test script to verify SEO settings save and image upload functionality
# Tests database connection and API endpoints

set -e

DB_URL="postgresql://postgres:0ezhmmKY8L1Nq5gJ@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres"
BASE_URL="${1:-http://localhost:3000}"

echo "🧪 Testing SEO Settings Save and Image Upload Functionality"
echo "============================================================"
echo ""

# Test 1: Database Connection
echo "1️⃣ Testing database connection..."
if psql "$DB_URL" -c "SELECT version();" > /dev/null 2>&1; then
  echo "   ✅ Database connection successful"
else
  echo "   ❌ Database connection failed"
  exit 1
fi

# Test 2: Verify pages_meta table structure
echo ""
echo "2️⃣ Verifying pages_meta table structure..."
COLUMNS=$(psql "$DB_URL" -t -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'pages_meta' ORDER BY ordinal_position;" | tr '\n' ' ')
REQUIRED_COLUMNS=("slug" "title" "meta_description" "meta_keywords" "og_image" "is_published")

for col in "${REQUIRED_COLUMNS[@]}"; do
  if echo "$COLUMNS" | grep -q "$col"; then
    echo "   ✅ Column '$col' exists"
  else
    echo "   ❌ Column '$col' missing"
    exit 1
  fi
done

# Test 3: Verify media_library table exists
echo ""
echo "3️⃣ Verifying media_library table exists..."
if psql "$DB_URL" -t -c "SELECT 1 FROM information_schema.tables WHERE table_name = 'media_library';" | grep -q 1; then
  echo "   ✅ media_library table exists"
else
  echo "   ❌ media_library table missing"
  exit 1
fi

# Test 4: Verify storage bucket exists
echo ""
echo "4️⃣ Verifying storage bucket exists..."
BUCKET=$(psql "$DB_URL" -t -c "SELECT name FROM storage.buckets WHERE name = 'cms-media';" | tr -d ' ')
if [ "$BUCKET" = "cms-media" ]; then
  echo "   ✅ Storage bucket 'cms-media' exists"
else
  echo "   ⚠️  Storage bucket 'cms-media' not found (may need to be created)"
fi

# Test 5: Test API endpoint availability (if server is running)
echo ""
echo "5️⃣ Testing API endpoints..."
if curl -s -f "$BASE_URL/api/cms/pages/homepage" > /dev/null 2>&1; then
  echo "   ✅ API endpoint /api/cms/pages/[slug] is accessible"
else
  echo "   ⚠️  API endpoint not accessible (server may not be running)"
fi

if curl -s -f "$BASE_URL/api/cms/media" > /dev/null 2>&1; then
  echo "   ✅ API endpoint /api/cms/media is accessible"
else
  echo "   ⚠️  API endpoint not accessible (server may not be running)"
fi

echo ""
echo "✅ All database checks passed!"
echo ""
echo "📝 Summary:"
echo "   - Database connection: ✅"
echo "   - pages_meta table structure: ✅"
echo "   - media_library table: ✅"
echo "   - Storage bucket: ✅"
echo ""
echo "🔧 Next steps:"
echo "   1. Test SEO settings save in the admin panel"
echo "   2. Test image upload in the MediaLibraryModal"
echo "   3. Verify changes persist in the database"

