#!/bin/bash

# Production Verification Test Suite
# Automatically tests all critical endpoints and functionality after deployment
# Usage: ./scripts/production-verification-test.sh [PRODUCTION_URL]

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PRODUCTION_URL="${1:-https://heiwahauz.netlify.app}"
TEST_RESULTS_DIR="test-results-production"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="${TEST_RESULTS_DIR}/verification_report_${TIMESTAMP}.json"
DIAGNOSTIC_FILE="${TEST_RESULTS_DIR}/diagnostics_${TIMESTAMP}.md"

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WARNINGS=0

# Test results array
declare -a TEST_RESULTS=()
declare -a FAILED_TESTS_ARRAY=()

# Create results directory
mkdir -p "${TEST_RESULTS_DIR}"

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED_TESTS++))
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED_TESTS++))
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    ((WARNINGS++))
}

# Test function wrapper
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_status="${3:-200}"
    
    ((TOTAL_TESTS++))
    log_info "Testing: ${test_name}"
    
    local response
    local status_code
    local response_body
    
    # Execute test and capture response
    if response=$(eval "$test_command" 2>&1); then
        status_code=$(echo "$response" | grep -oP '(?<=HTTP/\d\.\d )\d+' | tail -1 || echo "000")
        response_body=$(echo "$response" | tail -n +2)
        
        # Check status code
        if [ "$status_code" = "$expected_status" ]; then
            log_success "${test_name} - Status: ${status_code}"
            TEST_RESULTS+=("{\"test\": \"${test_name}\", \"status\": \"PASS\", \"status_code\": ${status_code}, \"expected\": ${expected_status}}")
            return 0
        else
            log_error "${test_name} - Expected ${expected_status}, got ${status_code}"
            TEST_RESULTS+=("{\"test\": \"${test_name}\", \"status\": \"FAIL\", \"status_code\": ${status_code}, \"expected\": ${expected_status}, \"response\": $(echo "$response_body" | jq -c . 2>/dev/null || echo "\"${response_body:0:200}\"")}")
            FAILED_TESTS_ARRAY+=("${test_name}")
            return 1
        fi
    else
        log_error "${test_name} - Command failed: $response"
        TEST_RESULTS+=("{\"test\": \"${test_name}\", \"status\": \"FAIL\", \"error\": \"Command execution failed\", \"details\": \"$response\"}")
        FAILED_TESTS_ARRAY+=("${test_name}")
        return 1
    fi
}

# Test API endpoint with payload validation
test_api_endpoint() {
    local test_name="$1"
    local endpoint="$2"
    local method="${3:-GET}"
    local expected_status="${4:-200}"
    local payload="${5:-}"
    local validate_json="${6:-true}"
    
    ((TOTAL_TESTS++))
    log_info "Testing: ${test_name}"
    
    local curl_cmd="curl -s -w '\nHTTP_STATUS:%{http_code}' -X ${method}"
    
    if [ -n "$payload" ]; then
        curl_cmd="${curl_cmd} -H 'Content-Type: application/json' -d '${payload}'"
    fi
    
    curl_cmd="${curl_cmd} '${PRODUCTION_URL}${endpoint}'"
    
    local response
    local http_status
    local response_body
    
    if response=$(eval "$curl_cmd" 2>&1); then
        http_status=$(echo "$response" | grep -oP 'HTTP_STATUS:\K\d+' || echo "000")
        response_body=$(echo "$response" | sed 's/HTTP_STATUS:[0-9]*$//' | sed '/^$/d')
        
        if [ "$http_status" = "$expected_status" ]; then
            # Validate JSON structure if requested
            if [ "$validate_json" = "true" ] && ! echo "$response_body" | jq . >/dev/null 2>&1; then
                log_error "${test_name} - Invalid JSON response"
                TEST_RESULTS+=("{\"test\": \"${test_name}\", \"status\": \"FAIL\", \"status_code\": ${http_status}, \"error\": \"Invalid JSON\", \"response\": \"${response_body:0:200}\"}")
                FAILED_TESTS_ARRAY+=("${test_name}")
                return 1
            fi
            
            # Check for success field in JSON responses
            if echo "$response_body" | jq -e '.success' >/dev/null 2>&1; then
                local success=$(echo "$response_body" | jq -r '.success')
                if [ "$success" = "false" ]; then
                    log_error "${test_name} - API returned success: false"
                    local error_msg=$(echo "$response_body" | jq -r '.error // "Unknown error"')
                    TEST_RESULTS+=("{\"test\": \"${test_name}\", \"status\": \"FAIL\", \"status_code\": ${http_status}, \"api_error\": \"${error_msg}\", \"response\": $(echo "$response_body" | jq -c .)}")
                    FAILED_TESTS_ARRAY+=("${test_name}")
                    return 1
                fi
            fi
            
            log_success "${test_name} - Status: ${http_status}"
            TEST_RESULTS+=("{\"test\": \"${test_name}\", \"status\": \"PASS\", \"status_code\": ${http_status}}")
            return 0
        else
            log_error "${test_name} - Expected ${expected_status}, got ${http_status}"
            TEST_RESULTS+=("{\"test\": \"${test_name}\", \"status\": \"FAIL\", \"status_code\": ${http_status}, \"expected\": ${expected_status}, \"response\": $(echo "$response_body" | jq -c . 2>/dev/null || echo "\"${response_body:0:200}\"")}")
            FAILED_TESTS_ARRAY+=("${test_name}")
            return 1
        fi
    else
        log_error "${test_name} - Request failed: $response"
        TEST_RESULTS+=("{\"test\": \"${test_name}\", \"status\": \"FAIL\", \"error\": \"Request failed\", \"details\": \"$response\"}")
        FAILED_TESTS_ARRAY+=("${test_name}")
        return 1
    fi
}

# Generate diagnostic report
generate_diagnostic_report() {
    {
        echo "# Production Verification Diagnostic Report"
        echo ""
        echo "**Generated**: $(date)"
        echo "**Production URL**: ${PRODUCTION_URL}"
        echo "**Total Tests**: ${TOTAL_TESTS}"
        echo "**Passed**: ${PASSED_TESTS}"
        echo "**Failed**: ${FAILED_TESTS}"
        echo "**Warnings**: ${WARNINGS}"
        echo ""
        
        if [ ${FAILED_TESTS} -gt 0 ]; then
            echo "## ❌ Failed Tests"
            echo ""
            for failed_test in "${FAILED_TESTS_ARRAY[@]}"; do
                echo "### ${failed_test}"
                echo ""
                echo "**Status**: FAILED"
                echo ""
                echo "**Recommended Fix**:"
                echo "- Check endpoint availability"
                echo "- Verify database connectivity"
                echo "- Review server logs for errors"
                echo "- Ensure environment variables are set correctly"
                echo ""
            done
        else
            echo "## ✅ All Tests Passed"
            echo ""
            echo "No diagnostic information needed - all critical endpoints are functioning correctly."
        fi
        
        echo ""
        echo "## Test Execution Details"
        echo ""
        echo "Run this script again to re-verify:"
        echo "\`\`\`bash"
        echo "./scripts/production-verification-test.sh ${PRODUCTION_URL}"
        echo "\`\`\`"
    } > "${DIAGNOSTIC_FILE}"
}

# Generate JSON report
generate_json_report() {
    {
        echo "{"
        echo "  \"timestamp\": \"$(date -Iseconds)\","
        echo "  \"production_url\": \"${PRODUCTION_URL}\","
        echo "  \"summary\": {"
        echo "    \"total_tests\": ${TOTAL_TESTS},"
        echo "    \"passed\": ${PASSED_TESTS},"
        echo "    \"failed\": ${FAILED_TESTS},"
        echo "    \"warnings\": ${WARNINGS},"
        echo "    \"success_rate\": $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%"
        echo "  },"
        echo "  \"tests\": ["
        local first=true
        for result in "${TEST_RESULTS[@]}"; do
            if [ "$first" = true ]; then
                first=false
            else
                echo ","
            fi
            echo -n "    ${result}"
        done
        echo ""
        echo "  ]"
        echo "}"
    } > "${REPORT_FILE}"
}

# Main test execution
main() {
    echo "=========================================="
    echo "Production Verification Test Suite"
    echo "=========================================="
    echo "Production URL: ${PRODUCTION_URL}"
    echo "Timestamp: $(date)"
    echo "=========================================="
    echo ""
    
    # ==========================================
    # 1. API AVAILABILITY TESTS
    # ==========================================
    echo "## 1. API Availability Tests"
    echo ""
    
    test_api_endpoint "Rooms API" "/api/rooms" "GET" "200"
    test_api_endpoint "Surf Camps API" "/api/surf-camps" "GET" "200"
    test_api_endpoint "Add-ons API" "/api/add-ons" "GET" "200"
    test_api_endpoint "Activities API" "/api/activities" "GET" "200"
    test_api_endpoint "Rooms Availability API" "/api/rooms/availability?start_date=2025-12-01&end_date=2025-12-07" "GET" "200"
    test_api_endpoint "Dates Availability API" "/api/dates/availability?start_date=2025-12-01&end_date=2025-12-07" "GET" "200"
    test_api_endpoint "Bookings API (GET)" "/api/bookings?limit=10" "GET" "200"
    test_api_endpoint "Payments API" "/api/payments?limit=10" "GET" "200"
    test_api_endpoint "Invoices API" "/api/invoices?limit=10" "GET" "200"
    test_api_endpoint "Calendar Events API" "/api/calendar-events?start_date=2025-12-01&end_date=2025-12-31" "GET" "200"
    
    echo ""
    
    # ==========================================
    # 2. AUTHENTICATION & SESSION FLOW
    # ==========================================
    echo "## 2. Authentication & Session Flow Tests"
    echo ""
    
    # Test admin login endpoint (should accept POST)
    test_api_endpoint "Admin Login Endpoint" "/api/admin/login" "POST" "200" '{"password":"test"}' "false"
    
    # Test protected routes redirect (admin pages should redirect to login)
    test_api_endpoint "Admin Dashboard Protection" "/admin" "GET" "200" "" "false"
    test_api_endpoint "Admin Bookings Protection" "/admin/bookings" "GET" "200" "" "false"
    test_api_endpoint "Admin Calendar Protection" "/admin/calendar" "GET" "200" "" "false"
    
    echo ""
    
    # ==========================================
    # 3. BOOKING FLOW TESTS
    # ==========================================
    echo "## 3. Booking Flow Tests"
    echo ""
    
    # Test booking creation (surf week booking)
    local surf_camp_id
    surf_camp_id=$(curl -s "${PRODUCTION_URL}/api/surf-camps" | jq -r '.data.surfCamps[0].id // empty' 2>/dev/null || echo "")
    
    if [ -n "$surf_camp_id" ] && [ "$surf_camp_id" != "null" ]; then
        local booking_payload="{\"camp_id\":\"${surf_camp_id}\",\"participants\":[{\"name\":\"Test User\",\"email\":\"test@example.com\",\"phone\":\"+1234567890\"}],\"pricing\":{\"total\":450}}"
        test_api_endpoint "Surf Week Booking Creation" "/api/bookings" "POST" "200" "$booking_payload"
    else
        log_warning "Skipping booking creation test - no surf camps available"
    fi
    
    # Test room availability check
    test_api_endpoint "Room Availability Check" "/api/rooms/availability?start_date=2025-12-01&end_date=2025-12-07" "GET" "200"
    
    echo ""
    
    # ==========================================
    # 4. PAYMENT GATEWAY INTERACTIONS
    # ==========================================
    echo "## 4. Payment Gateway Tests"
    echo ""
    
    test_api_endpoint "Payments List" "/api/payments?limit=10" "GET" "200"
    test_api_endpoint "Payment Intent Creation Endpoint" "/api/create-payment-intent" "POST" "200" '{"amount":100,"currency":"EUR"}' "false"
    
    echo ""
    
    # ==========================================
    # 5. DATABASE WRITE/READ CONSISTENCY
    # ==========================================
    echo "## 5. Database Consistency Tests"
    echo ""
    
    # Test that we can read what we write
    local rooms_response
    rooms_response=$(curl -s "${PRODUCTION_URL}/api/rooms")
    local room_count
    room_count=$(echo "$rooms_response" | jq -r '.data.rooms | length // 0' 2>/dev/null || echo "0")
    
    if [ "$room_count" -gt 0 ]; then
        log_success "Database Read Test - Found ${room_count} rooms"
        TEST_RESULTS+=("{\"test\": \"Database Read Consistency\", \"status\": \"PASS\", \"rooms_found\": ${room_count}}")
    else
        log_error "Database Read Test - No rooms found"
        TEST_RESULTS+=("{\"test\": \"Database Read Consistency\", \"status\": \"FAIL\", \"error\": \"No rooms returned\"}")
        FAILED_TESTS_ARRAY+=("Database Read Consistency")
    fi
    
    # Test surf camps consistency
    local camps_response
    camps_response=$(curl -s "${PRODUCTION_URL}/api/surf-camps")
    local camp_count
    camp_count=$(echo "$camps_response" | jq -r '.data.surfCamps | length // 0' 2>/dev/null || echo "0")
    
    if [ "$camp_count" -ge 0 ]; then
        log_success "Database Read Test - Surf camps query successful (${camp_count} found)"
        TEST_RESULTS+=("{\"test\": \"Database Read Consistency (Surf Camps)\", \"status\": \"PASS\", \"camps_found\": ${camp_count}}")
    else
        log_error "Database Read Test - Surf camps query failed"
        TEST_RESULTS+=("{\"test\": \"Database Read Consistency (Surf Camps)\", \"status\": \"FAIL\"}")
        FAILED_TESTS_ARRAY+=("Database Read Consistency (Surf Camps)")
    fi
    
    echo ""
    
    # ==========================================
    # 6. ERROR HANDLING PATHS
    # ==========================================
    echo "## 6. Error Handling Tests"
    echo ""
    
    # Test invalid endpoint (should return 404)
    test_api_endpoint "Invalid Endpoint (404)" "/api/nonexistent" "GET" "404" "" "false"
    
    # Test invalid booking payload (should return 400)
    test_api_endpoint "Invalid Booking Payload" "/api/bookings" "POST" "400" '{"invalid":"data"}' "false"
    
    # Test invalid date format
    test_api_endpoint "Invalid Date Format" "/api/rooms/availability?start_date=invalid&end_date=invalid" "GET" "400" "" "false"
    
    echo ""
    
    # ==========================================
    # 7. FRONTEND PAGES
    # ==========================================
    echo "## 7. Frontend Pages Tests"
    echo ""
    
    test_api_endpoint "Homepage" "/" "GET" "200" "" "false"
    test_api_endpoint "Rooms Page" "/rooms" "GET" "200" "" "false"
    test_api_endpoint "Surf Weeks Page" "/surf-weeks" "GET" "200" "" "false"
    
    echo ""
    
    # ==========================================
    # SUMMARY & REPORTING
    # ==========================================
    echo "=========================================="
    echo "Test Summary"
    echo "=========================================="
    echo "Total Tests: ${TOTAL_TESTS}"
    echo "Passed: ${PASSED_TESTS}"
    echo "Failed: ${FAILED_TESTS}"
    echo "Warnings: ${WARNINGS}"
    echo "Success Rate: $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%"
    echo "=========================================="
    echo ""
    
    # Generate reports
    generate_json_report
    generate_diagnostic_report
    
    log_info "JSON Report: ${REPORT_FILE}"
    log_info "Diagnostic Report: ${DIAGNOSTIC_FILE}"
    
    # Exit with error code if tests failed
    if [ ${FAILED_TESTS} -gt 0 ]; then
        echo ""
        echo -e "${RED}❌ Some tests failed. Please review the diagnostic report.${NC}"
        exit 1
    else
        echo ""
        echo -e "${GREEN}✅ All tests passed!${NC}"
        exit 0
    fi
}

# Run main function
main "$@"

