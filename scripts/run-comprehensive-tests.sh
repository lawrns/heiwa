#!/bin/bash

echo "🧪 Running Comprehensive Admin Testing Suite"
echo "==========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

run_test() {
    local test_name=$1
    local test_command=$2

    echo -e "${BLUE}[RUNNING]${NC} $test_name"
    ((TOTAL_TESTS++))

    if eval "$test_command"; then
        echo -e "${GREEN}[PASSED]${NC} $test_name"
        ((PASSED_TESTS++))
    else
        echo -e "${RED}[FAILED]${NC} $test_name"
        ((FAILED_TESTS++))
    fi
    echo
}

# Phase 1: Functional Tests
echo "Phase 1: Functional Testing"
echo "=========================="

run_test "Admin Dashboard Tests" "npx playwright test tests/admin/ --headed=false"
run_test "Booking Management Tests" "npx playwright test tests/booking-management.spec.ts --headed=false"
run_test "Client Management Tests" "npx playwright test tests/clients.spec.ts --headed=false"
run_test "Authentication Tests" "npx playwright test tests/auth.spec.ts --headed=false"

# Phase 2: Load Tests (if k6 is available)
echo "Phase 2: Load Testing"
echo "===================="

if command -v k6 &> /dev/null; then
    run_test "Baseline Load Test" "k6 run tests/load/load-test-baseline.js"
    run_test "Stress Load Test" "k6 run tests/load/load-test-stress.js"
else
    echo -e "${YELLOW}[SKIPPED]${NC} Load tests - k6 not available"
fi

# Phase 3: Security Tests
echo "Phase 3: Security Testing"
echo "========================"

run_test "Security Tests" "npx playwright test tests/security/ --headed=false"

# Generate Report
echo "Test Results Summary"
echo "==================="
echo "Total Tests: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS"
echo "Failed: $FAILED_TESTS"
echo "Success Rate: $((PASSED_TESTS * 100 / TOTAL_TESTS))%"

# Create summary report
cat > test-results-summary.json << SUMMARY_EOF
{
    "timestamp": "$(date -Iseconds)",
    "totalTests": $TOTAL_TESTS,
    "passedTests": $PASSED_TESTS,
    "failedTests": $FAILED_TESTS,
    "successRate": $((PASSED_TESTS * 100 / TOTAL_TESTS)),
    "phase": "comprehensive-admin-testing"
}
SUMMARY_EOF

echo -e "${GREEN}[COMPLETE]${NC} Comprehensive testing finished"
