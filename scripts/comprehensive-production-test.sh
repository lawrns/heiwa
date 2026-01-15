#!/bin/bash

# Comprehensive Production Testing Script
# Tests all critical functionality with admin authentication

PROD_URL="https://heiwahauz.netlify.app"
ADMIN_PASSWORD="heiwa_secure_admin_2025"

echo "=========================================="
echo "Comprehensive Production Testing"
echo "URL: $PROD_URL"
echo "Date: $(date)"
echo "=========================================="
echo ""

# Test 1: Admin Login
echo "## Test 1: Admin Login"
LOGIN_RESPONSE=$(curl -s -X POST "$PROD_URL/api/admin/login" \
  -H "Content-Type: application/json" \
  -d "{\"password\":\"$ADMIN_PASSWORD\"}" \
  -c cookies.txt)

echo "Response: $LOGIN_RESPONSE"

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Admin login successful"
else
  echo "❌ Admin login failed"
fi
echo ""

# Test 2: Database Connectivity
echo "## Test 2: Database Connectivity"
psql "postgresql://postgres:0ezhmmKY8L1Nq5gJ@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres" \
  -c "SELECT COUNT(*) as total_rooms FROM rooms WHERE is_active = true;" 2>&1 | grep -v "WARNING"
echo ""

# Test 3: Rooms API
echo "## Test 3: Rooms API"
ROOMS_RESPONSE=$(curl -s "$PROD_URL/api/rooms")
ROOM_COUNT=$(echo "$ROOMS_RESPONSE" | jq '.data | length' 2>/dev/null)
echo "Active rooms: $ROOM_COUNT"
if [ "$ROOM_COUNT" -gt 0 ]; then
  echo "✅ Rooms API working"
else
  echo "❌ Rooms API issue"
fi
echo ""

# Test 4: Availability API
echo "## Test 4: Availability API"
AVAIL_RESPONSE=$(curl -s "$PROD_URL/api/availability?roomId=6a6e6bb0-d3e5-4fab-87d8-7e39174637e9&checkIn=2026-02-14&checkOut=2026-02-21")
echo "$AVAIL_RESPONSE" | jq '.'
if echo "$AVAIL_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Availability API working"
else
  echo "❌ Availability API issue"
fi
echo ""

# Test 5: Bookings Count
echo "## Test 5: Bookings in Database"
psql "postgresql://postgres:0ezhmmKY8L1Nq5gJ@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres" \
  -c "SELECT COUNT(*) as total_bookings, COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed FROM bookings;" 2>&1 | grep -v "WARNING"
echo ""

# Test 6: Recent Bookings
echo "## Test 6: Recent Bookings"
psql "postgresql://postgres:0ezhmmKY8L1Nq5gJ@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres" \
  -c "SELECT id, status, booking_type, created_at FROM bookings ORDER BY created_at DESC LIMIT 5;" 2>&1 | grep -v "WARNING"
echo ""

# Test 7: Homepage Load
echo "## Test 7: Homepage Load"
HOMEPAGE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/")
echo "Status: $HOMEPAGE_STATUS"
if [ "$HOMEPAGE_STATUS" = "200" ]; then
  echo "✅ Homepage loads"
else
  echo "❌ Homepage issue"
fi
echo ""

# Test 8: Admin Dashboard (with auth)
echo "## Test 8: Admin Dashboard Access"
ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -b cookies.txt "$PROD_URL/admin")
echo "Status: $ADMIN_STATUS"
if [ "$ADMIN_STATUS" = "200" ]; then
  echo "✅ Admin dashboard accessible"
else
  echo "⚠️ Admin dashboard returns $ADMIN_STATUS (may need browser session)"
fi
echo ""

# Test 9: Surf Camps
echo "## Test 9: Surf Camps"
psql "postgresql://postgres:0ezhmmKY8L1Nq5gJ@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres" \
  -c "SELECT COUNT(*) as total_surf_camps FROM surf_camps WHERE is_active = true;" 2>&1 | grep -v "WARNING"
echo ""

# Test 10: Activities
echo "## Test 10: Activities"
psql "postgresql://postgres:0ezhmmKY8L1Nq5gJ@db.pguipwhrxdzzrndbluxb.supabase.co:5432/postgres" \
  -c "SELECT COUNT(*) as total_activities FROM experiences WHERE is_active = true;" 2>&1 | grep -v "WARNING"
echo ""

# Cleanup
rm -f cookies.txt

echo "=========================================="
echo "Testing Complete"
echo "=========================================="
