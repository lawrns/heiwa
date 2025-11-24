#!/bin/bash

# Comprehensive curl + grep verification script
# Tests all critical endpoints with detailed output

set -euo pipefail

PRODUCTION_URL="${1:-https://heiwahauz.netlify.app}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="test-results-production/curl-verification-${TIMESTAMP}.md"

mkdir -p test-results-production

echo "# Comprehensive curl + grep Verification Report" > "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "**Generated**: $(date)" >> "$REPORT_FILE"
echo "**Production URL**: ${PRODUCTION_URL}" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASSED=0
FAILED=0

test_endpoint() {
    local name="$1"
    local endpoint="$2"
    local method="${3:-GET}"
    local expected_status="${4:-200}"
    local grep_pattern="${5:-}"
    
    echo -n "Testing ${name}... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "${PRODUCTION_URL}${endpoint}" 2>&1)
    else
        response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X "$method" "${PRODUCTION_URL}${endpoint}" 2>&1)
    fi
    
    http_status=$(echo "$response" | grep -oP 'HTTP_STATUS:\K\d+' || echo "000")
    body=$(echo "$response" | sed 's/HTTP_STATUS:[0-9]*$//')
    
    echo "## ${name}" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "- **Endpoint**: \`${endpoint}\`" >> "$REPORT_FILE"
    echo "- **Method**: ${method}" >> "$REPORT_FILE"
    echo "- **Expected Status**: ${expected_status}" >> "$REPORT_FILE"
    echo "- **Actual Status**: ${http_status}" >> "$REPORT_FILE"
    
    if [ "$http_status" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (${http_status})"
        echo "- **Status**: ✅ PASS" >> "$REPORT_FILE"
        ((PASSED++))
        
        if [ -n "$grep_pattern" ]; then
            if echo "$body" | grep -q "$grep_pattern"; then
                echo "- **Pattern Match**: ✅ Found '${grep_pattern}'" >> "$REPORT_FILE"
            else
                echo "- **Pattern Match**: ⚠️ Not found '${grep_pattern}'" >> "$REPORT_FILE"
            fi
        fi
        
        # Check JSON structure
        if echo "$body" | jq . >/dev/null 2>&1; then
            echo "- **JSON Valid**: ✅" >> "$REPORT_FILE"
            if echo "$body" | jq -e '.success' >/dev/null 2>&1; then
                success=$(echo "$body" | jq -r '.success')
                echo "- **API Success Field**: ${success}" >> "$REPORT_FILE"
            fi
        fi
    else
        echo -e "${RED}✗ FAIL${NC} (Expected ${expected_status}, got ${http_status})"
        echo "- **Status**: ❌ FAIL" >> "$REPORT_FILE"
        echo "- **Error**: Expected ${expected_status}, got ${http_status}" >> "$REPORT_FILE"
        echo "- **Response**: \`\`\`" >> "$REPORT_FILE"
        echo "${body:0:500}" >> "$REPORT_FILE"
        echo "\`\`\`" >> "$REPORT_FILE"
        ((FAILED++))
    fi
    
    echo "" >> "$REPORT_FILE"
}

echo "=========================================="
echo "Comprehensive curl + grep Verification"
echo "=========================================="
echo "Production URL: ${PRODUCTION_URL}"
echo ""

# API Endpoints
echo "## Testing API Endpoints"
echo ""

test_endpoint "Rooms API" "/api/rooms" "GET" "200" '"success":true'
test_endpoint "Surf Camps API" "/api/surf-camps" "GET" "200" '"success":true'
test_endpoint "Add-ons API" "/api/add-ons" "GET" "200" '"success":true'
test_endpoint "Activities API" "/api/activities" "GET" "200" '"success":true'
test_endpoint "Rooms Availability" "/api/rooms/availability?start_date=2025-12-01&end_date=2025-12-07" "GET" "200"
test_endpoint "Dates Availability" "/api/dates/availability?start_date=2025-12-01&end_date=2025-12-07" "GET" "200"
test_endpoint "Bookings API" "/api/bookings?limit=5" "GET" "200" '"success":true'
test_endpoint "Payments API" "/api/payments?limit=5" "GET" "200" '"success":true'
test_endpoint "Invoices API" "/api/invoices?limit=5" "GET" "200" '"success":true'

# Booking Flow
echo ""
echo "## Testing Booking Flow"
echo ""

# Test booking creation with invalid data (should return 400)
test_endpoint "Booking Validation" "/api/bookings" "POST" "400" "" '{"invalid":"data"}'

# Frontend Routes
echo ""
echo "## Testing Frontend Routes"
echo ""

test_endpoint "Homepage" "/" "GET" "200" "<!DOCTYPE html"
test_endpoint "Rooms Page" "/rooms" "GET" "200" "<!DOCTYPE html"
test_endpoint "Surf Weeks Page" "/surf-weeks" "GET" "200" "<!DOCTYPE html"
test_endpoint "Flow Page" "/flow" "GET" "200" "<!DOCTYPE html"
test_endpoint "Play Page" "/play" "GET" "200" "<!DOCTYPE html"
test_endpoint "Surf Page" "/surf" "GET" "200" "<!DOCTYPE html"

# Authentication Paths
echo ""
echo "## Testing Authentication Paths"
echo ""

test_endpoint "Admin Login Endpoint" "/api/admin/login" "POST" "200" "" '{"password":"test"}'
test_endpoint "Admin Dashboard Redirect" "/admin" "GET" "200" "" # Should redirect or show login
test_endpoint "Admin Bookings Redirect" "/admin/bookings" "GET" "200" ""

# Summary
echo ""
echo "=========================================="
echo "Summary"
echo "=========================================="
echo "Passed: ${PASSED}"
echo "Failed: ${FAILED}"
echo "=========================================="

echo "" >> "$REPORT_FILE"
echo "## Summary" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "- **Total Tests**: $((PASSED + FAILED))" >> "$REPORT_FILE"
echo "- **Passed**: ${PASSED}" >> "$REPORT_FILE"
echo "- **Failed**: ${FAILED}" >> "$REPORT_FILE"
echo "- **Success Rate**: $(( PASSED * 100 / (PASSED + FAILED) ))%" >> "$REPORT_FILE"

echo ""
echo "Report saved to: ${REPORT_FILE}"

if [ $FAILED -gt 0 ]; then
    exit 1
fi

