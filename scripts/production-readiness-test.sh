#!/bin/bash

# Production Readiness Test Script
# Tests critical aspects of the production site

BASE_URL="https://heiwahauz.netlify.app"
ADMIN_COOKIE="admin_auth=heiwa_admin_2024"

echo "🚀 Production Readiness Test Suite"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    local headers=$4
    
    response=$(curl -s -o /dev/null -w "%{http_code}" $headers "$url")
    
    if [ "$response" == "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $name (Status: $response)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}: $name (Expected: $expected_status, Got: $response)"
        ((FAILED++))
        return 1
    fi
}

test_performance() {
    local name=$1
    local url=$2
    local max_time=${3:-2.0}
    
    time=$(curl -s -o /dev/null -w "%{time_total}" "$url")
    
    if (( $(echo "$time < $max_time" | bc -l) )); then
        echo -e "${GREEN}✅ PASS${NC}: $name (${time}s < ${max_time}s)"
        ((PASSED++))
        return 0
    else
        echo -e "${YELLOW}⚠️  SLOW${NC}: $name (${time}s > ${max_time}s)"
        ((FAILED++))
        return 1
    fi
}

echo "📊 Performance Tests"
echo "--------------------"
test_performance "Homepage" "$BASE_URL/" 1.0
test_performance "Rooms API" "$BASE_URL/api/rooms" 1.5
test_performance "Surf Camps API" "$BASE_URL/api/surf-camps" 1.5
test_performance "Add-ons API" "$BASE_URL/api/add-ons" 1.0
echo ""

echo "🔒 Security Tests"
echo "-----------------"
test_endpoint "Admin route protection (no auth)" "$BASE_URL/admin" 307
test_endpoint "Admin route (with auth)" "$BASE_URL/admin" 200 "-H 'Cookie: $ADMIN_COOKIE'"
test_endpoint "Admin login endpoint" "$BASE_URL/api/admin/login" 405  # Method not allowed for GET
echo ""

echo "🌐 API Endpoint Tests"
echo "---------------------"
test_endpoint "Rooms API" "$BASE_URL/api/rooms" 200
test_endpoint "Surf Camps API" "$BASE_URL/api/surf-camps" 200
test_endpoint "Add-ons API" "$BASE_URL/api/add-ons" 200
test_endpoint "Availability API" "$BASE_URL/api/availability" 200
test_endpoint "Google Reviews API" "$BASE_URL/api/google-reviews" 200
test_endpoint "Contact API" "$BASE_URL/api/contact" 405  # POST only
test_endpoint "CMS Homepage API" "$BASE_URL/api/admin/homepage" 200 "-H 'Cookie: $ADMIN_COOKIE'"
test_endpoint "CMS Settings API" "$BASE_URL/api/admin/cms/settings" 200 "-H 'Cookie: $ADMIN_COOKIE'"
echo ""

echo "📄 Page Tests"
echo "-------------"
test_endpoint "Homepage" "$BASE_URL/" 200
test_endpoint "Rooms Page" "$BASE_URL/rooms" 200
test_endpoint "Surf Weeks Page" "$BASE_URL/surf-weeks" 200
test_endpoint "Play Page" "$BASE_URL/play" 200
test_endpoint "Flow Page" "$BASE_URL/flow" 200
test_endpoint "Surf Page" "$BASE_URL/surf" 200
test_endpoint "Contact Page" "$BASE_URL/contact" 200
test_endpoint "The Spot Page" "$BASE_URL/the-spot" 200
echo ""

echo "🔍 SEO Tests"
echo "------------"
test_endpoint "Robots.txt" "$BASE_URL/robots.txt" 200
test_endpoint "Sitemap.xml" "$BASE_URL/sitemap.xml" 200
echo ""

echo "📊 Test Results"
echo "==============="
echo -e "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️  Some tests failed. Review the output above.${NC}"
    exit 1
fi


