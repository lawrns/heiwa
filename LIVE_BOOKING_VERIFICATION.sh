#!/bin/bash

# Heiwa House Live Booking Verification Script
# Tests the production deployment at https://heiwahauz.netlify.app

SITE="https://heiwahauz.netlify.app"
PASS=0
FAIL=0

echo "🏄‍♂️ Heiwa House Production Booking Verification"
echo "=================================================="
echo "Testing: $SITE"
echo ""

# Test 1: Homepage loads
echo "📋 Test 1: Homepage Load"
STATUS=$(curl -s -o /dev/null -w '%{http_code}' $SITE)
if [ "$STATUS" = "200" ]; then
  echo "✅ Homepage loads (HTTP $STATUS)"
  ((PASS++))
else
  echo "❌ Homepage failed (HTTP $STATUS)"
  ((FAIL++))
fi

# Test 2: Homepage contains booking widget
echo ""
echo "📋 Test 2: Booking Widget Present"
if curl -s $SITE | grep -q "Book Now\|booking"; then
  echo "✅ Booking widget found on homepage"
  ((PASS++))
else
  echo "❌ Booking widget not found"
  ((FAIL++))
fi

# Test 3: Rooms API
echo ""
echo "📋 Test 3: Rooms API"
ROOMS=$(curl -s $SITE/api/rooms)
if echo "$ROOMS" | grep -q '\['; then
  ROOM_COUNT=$(echo "$ROOMS" | grep -o '"id"' | wc -l)
  echo "✅ Rooms API working ($ROOM_COUNT rooms available)"
  ((PASS++))
else
  echo "❌ Rooms API failed"
  ((FAIL++))
fi

# Test 4: Surf Camps API
echo ""
echo "📋 Test 4: Surf Camps API"
CAMPS=$(curl -s $SITE/api/surf-camps)
if echo "$CAMPS" | grep -q '\['; then
  CAMP_COUNT=$(echo "$CAMPS" | grep -o '"id"' | wc -l)
  echo "✅ Surf Camps API working ($CAMP_COUNT camps available)"
  ((PASS++))
else
  echo "❌ Surf Camps API failed"
  ((FAIL++))
fi

# Test 5: Add-ons API
echo ""
echo "📋 Test 5: Add-ons API"
ADDONS=$(curl -s $SITE/api/add-ons)
if echo "$ADDONS" | grep -q '\['; then
  ADDON_COUNT=$(echo "$ADDONS" | grep -o '"id"' | wc -l)
  echo "✅ Add-ons API working ($ADDON_COUNT add-ons available)"
  ((PASS++))
else
  echo "❌ Add-ons API failed"
  ((FAIL++))
fi

# Test 6: Bookings API
echo ""
echo "📋 Test 6: Bookings API"
BOOKINGS=$(curl -s $SITE/api/bookings)
if echo "$BOOKINGS" | grep -q 'success\|data\|\['; then
  echo "✅ Bookings API working"
  ((PASS++))
else
  echo "❌ Bookings API failed"
  ((FAIL++))
fi

# Test 7: Admin panel accessible
echo ""
echo "📋 Test 7: Admin Panel"
ADMIN_STATUS=$(curl -s -o /dev/null -w '%{http_code}' $SITE/admin)
if [ "$ADMIN_STATUS" = "200" ] || [ "$ADMIN_STATUS" = "307" ]; then
  echo "✅ Admin panel accessible (HTTP $ADMIN_STATUS)"
  ((PASS++))
else
  echo "❌ Admin panel not accessible (HTTP $ADMIN_STATUS)"
  ((FAIL++))
fi

# Test 8: No 500 errors
echo ""
echo "📋 Test 8: Error Pages"
ERROR_STATUS=$(curl -s -o /dev/null -w '%{http_code}' $SITE/api/nonexistent)
if [ "$ERROR_STATUS" = "404" ]; then
  echo "✅ 404 handling works correctly"
  ((PASS++))
else
  echo "⚠️  Unexpected status for nonexistent endpoint: $ERROR_STATUS"
fi

# Summary
echo ""
echo "=================================================="
echo "📊 Test Summary"
echo "=================================================="
echo "✅ Passed: $PASS"
echo "❌ Failed: $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
  echo "🎉 All critical tests passed!"
  echo "✅ Production deployment is READY for booking testing"
  exit 0
else
  echo "⚠️  Some tests failed. Review above for details."
  exit 1
fi
