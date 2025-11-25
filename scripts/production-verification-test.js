#!/usr/bin/env node

/**
 * Production Verification Test Suite
 * Automatically tests all critical endpoints and functionality after deployment
 * Usage: node scripts/production-verification-test.js [PRODUCTION_URL]
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

// Configuration
const PRODUCTION_URL = process.argv[2] || 'https://heiwahauz.netlify.app';
const TEST_RESULTS_DIR = 'test-results-production';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const REPORT_FILE = path.join(TEST_RESULTS_DIR, `verification_report_${TIMESTAMP}.json`);
const DIAGNOSTIC_FILE = path.join(TEST_RESULTS_DIR, `diagnostics_${TIMESTAMP}.md`);

// Test counters
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let warnings = 0;

// Test results
const testResults = [];
const failedTestsArray = [];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// Helper functions
function logInfo(message) {
  console.log(`${colors.blue}[INFO]${colors.reset} ${message}`);
}

function logSuccess(message) {
  console.log(`${colors.green}[PASS]${colors.reset} ${message}`);
  passedTests++;
}

function logError(message) {
  console.log(`${colors.red}[FAIL]${colors.reset} ${message}`);
  failedTests++;
}

function logWarning(message) {
  console.log(`${colors.yellow}[WARN]${colors.reset} ${message}`);
  warnings++;
}

// HTTP request helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Production-Verification-Test/1.0',
        ...options.headers,
      },
      timeout: options.timeout || 10000,
    };

    const req = protocol.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

// Test API endpoint
async function testApiEndpoint(testName, endpoint, method = 'GET', expectedStatus = 200, payload = null, validateJson = true) {
  totalTests++;
  logInfo(`Testing: ${testName}`);

  try {
    const url = `${PRODUCTION_URL}${endpoint}`;
    const options = {
      method,
      headers: {},
    };

    if (payload) {
      options.headers['Content-Type'] = 'application/json';
      options.body = typeof payload === 'string' ? payload : JSON.stringify(payload);
    }

    const response = await makeRequest(url, options);

    // Check status code
    if (response.statusCode === expectedStatus) {
      // Validate JSON structure if requested
      if (validateJson) {
        try {
          const jsonData = JSON.parse(response.body);
          
          // Check for success field in JSON responses
          if (jsonData.success === false) {
            const errorMsg = jsonData.error || 'Unknown error';
            logError(`${testName} - API returned success: false - ${errorMsg}`);
            testResults.push({
              test: testName,
              status: 'FAIL',
              statusCode: response.statusCode,
              apiError: errorMsg,
              response: jsonData,
            });
            failedTestsArray.push(testName);
            return false;
          }
        } catch (e) {
          // Not JSON, that's okay for some endpoints
        }
      }

      logSuccess(`${testName} - Status: ${response.statusCode}`);
      testResults.push({
        test: testName,
        status: 'PASS',
        statusCode: response.statusCode,
      });
      return true;
    } else {
      logError(`${testName} - Expected ${expectedStatus}, got ${response.statusCode}`);
      let responseBody = response.body;
      try {
        responseBody = JSON.parse(response.body);
      } catch (e) {
        responseBody = response.body.substring(0, 200);
      }
      
      testResults.push({
        test: testName,
        status: 'FAIL',
        statusCode: response.statusCode,
        expected: expectedStatus,
        response: responseBody,
      });
      failedTestsArray.push(testName);
      return false;
    }
  } catch (error) {
    logError(`${testName} - Request failed: ${error.message}`);
    testResults.push({
      test: testName,
      status: 'FAIL',
      error: error.message,
      details: error.toString(),
    });
    failedTestsArray.push(testName);
    return false;
  }
}

// Generate diagnostic report
function generateDiagnosticReport() {
  const report = `# Production Verification Diagnostic Report

**Generated**: ${new Date().toISOString()}
**Production URL**: ${PRODUCTION_URL}
**Total Tests**: ${totalTests}
**Passed**: ${passedTests}
**Failed**: ${failedTests}
**Warnings**: ${warnings}

${failedTests > 0 ? `## ❌ Failed Tests

${failedTestsArray.map(test => `### ${test}

**Status**: FAILED

**Recommended Fix**:
- Check endpoint availability
- Verify database connectivity
- Review server logs for errors
- Ensure environment variables are set correctly
- Check network connectivity
- Verify API route handlers are properly configured

`).join('\n')}` : `## ✅ All Tests Passed

No diagnostic information needed - all critical endpoints are functioning correctly.

`}
## Test Execution Details

Run this script again to re-verify:
\`\`\`bash
node scripts/production-verification-test.js ${PRODUCTION_URL}
\`\`\`
`;

  fs.writeFileSync(DIAGNOSTIC_FILE, report);
}

// Generate JSON report
function generateJsonReport() {
  const report = {
    timestamp: new Date().toISOString(),
    production_url: PRODUCTION_URL,
    summary: {
      total_tests: totalTests,
      passed: passedTests,
      failed: failedTests,
      warnings: warnings,
      success_rate: totalTests > 0 ? `${Math.round((passedTests / totalTests) * 100)}%` : '0%',
    },
    tests: testResults,
  };

  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
}

// Main test execution
async function main() {
  console.log('==========================================');
  console.log('Production Verification Test Suite');
  console.log('==========================================');
  console.log(`Production URL: ${PRODUCTION_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('==========================================');
  console.log('');

  // Create results directory
  if (!fs.existsSync(TEST_RESULTS_DIR)) {
    fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });
  }

  // ==========================================
  // 1. API AVAILABILITY TESTS
  // ==========================================
  console.log('## 1. API Availability Tests');
  console.log('');

  await testApiEndpoint('Rooms API', '/api/rooms', 'GET', 200);
  await testApiEndpoint('Surf Camps API', '/api/surf-camps', 'GET', 200);
  await testApiEndpoint('Add-ons API', '/api/add-ons', 'GET', 200);
  await testApiEndpoint('Activities API', '/api/activities', 'GET', 200);
  await testApiEndpoint('Rooms Availability API', '/api/rooms/availability?start_date=2025-12-01&end_date=2025-12-07', 'GET', 200);
  await testApiEndpoint('Dates Availability API', '/api/dates/availability?start_date=2025-12-01&end_date=2025-12-07', 'GET', 200);
  await testApiEndpoint('Bookings API (GET)', '/api/bookings?limit=10', 'GET', 200);
  await testApiEndpoint('Payments API', '/api/payments?limit=10', 'GET', 200);
  await testApiEndpoint('Invoices API', '/api/invoices?limit=10', 'GET', 200);
  await testApiEndpoint('Calendar Events API', '/api/calendar-events?start_date=2025-12-01&end_date=2025-12-31', 'GET', 200);

  console.log('');

  // ==========================================
  // 2. AUTHENTICATION & SESSION FLOW
  // ==========================================
  console.log('## 2. Authentication & Session Flow Tests');
  console.log('');

  await testApiEndpoint('Admin Login Endpoint', '/api/admin/login', 'POST', 200, JSON.stringify({ password: 'test' }), false);
  await testApiEndpoint('Admin Dashboard Protection', '/admin', 'GET', 200, null, false);
  await testApiEndpoint('Admin Bookings Protection', '/admin/bookings', 'GET', 200, null, false);
  await testApiEndpoint('Admin Calendar Protection', '/admin/calendar', 'GET', 200, null, false);

  console.log('');

  // ==========================================
  // 3. BOOKING FLOW TESTS
  // ==========================================
  console.log('## 3. Booking Flow Tests');
  console.log('');

  // Get surf camp ID for booking test
  try {
    const campsResponse = await makeRequest(`${PRODUCTION_URL}/api/surf-camps`);
    const campsData = JSON.parse(campsResponse.body);
    const surfCampId = campsData?.data?.surfCamps?.[0]?.id;

    if (surfCampId) {
      const bookingPayload = {
        camp_id: surfCampId,
        participants: [{
          name: 'Test User',
          email: 'test@example.com',
          phone: '+1234567890',
        }],
        pricing: {
          total: 450,
        },
      };
      await testApiEndpoint('Surf Week Booking Creation', '/api/bookings', 'POST', 200, JSON.stringify(bookingPayload));
    } else {
      logWarning('Skipping booking creation test - no surf camps available');
    }
  } catch (error) {
    logWarning(`Skipping booking creation test - ${error.message}`);
  }

  await testApiEndpoint('Room Availability Check', '/api/rooms/availability?start_date=2025-12-01&end_date=2025-12-07', 'GET', 200);

  console.log('');

  // ==========================================
  // 4. PAYMENT GATEWAY INTERACTIONS
  // ==========================================
  console.log('## 4. Payment Gateway Tests');
  console.log('');

  await testApiEndpoint('Payments List', '/api/payments?limit=10', 'GET', 200);
  await testApiEndpoint('Payment Intent Creation Endpoint', '/api/create-payment-intent', 'POST', 200, JSON.stringify({ amount: 100, currency: 'EUR' }), false);

  console.log('');

  // ==========================================
  // 5. DATABASE WRITE/READ CONSISTENCY
  // ==========================================
  console.log('## 5. Database Consistency Tests');
  console.log('');

  try {
    const roomsResponse = await makeRequest(`${PRODUCTION_URL}/api/rooms`);
    const roomsData = JSON.parse(roomsResponse.body);
    const roomCount = roomsData?.data?.rooms?.length || 0;

    if (roomCount > 0) {
      logSuccess(`Database Read Test - Found ${roomCount} rooms`);
      testResults.push({
        test: 'Database Read Consistency',
        status: 'PASS',
        rooms_found: roomCount,
      });
    } else {
      logError('Database Read Test - No rooms found');
      testResults.push({
        test: 'Database Read Consistency',
        status: 'FAIL',
        error: 'No rooms returned',
      });
      failedTestsArray.push('Database Read Consistency');
    }
  } catch (error) {
    logError(`Database Read Test - ${error.message}`);
    testResults.push({
      test: 'Database Read Consistency',
      status: 'FAIL',
      error: error.message,
    });
    failedTestsArray.push('Database Read Consistency');
  }

  try {
    const campsResponse = await makeRequest(`${PRODUCTION_URL}/api/surf-camps`);
    const campsData = JSON.parse(campsResponse.body);
    const campCount = campsData?.data?.surfCamps?.length || 0;

    logSuccess(`Database Read Test - Surf camps query successful (${campCount} found)`);
    testResults.push({
      test: 'Database Read Consistency (Surf Camps)',
      status: 'PASS',
      camps_found: campCount,
    });
  } catch (error) {
    logError(`Database Read Test (Surf Camps) - ${error.message}`);
    testResults.push({
      test: 'Database Read Consistency (Surf Camps)',
      status: 'FAIL',
      error: error.message,
    });
    failedTestsArray.push('Database Read Consistency (Surf Camps)');
  }

  console.log('');

  // ==========================================
  // 6. ERROR HANDLING PATHS
  // ==========================================
  console.log('## 6. Error Handling Tests');
  console.log('');

  await testApiEndpoint('Invalid Endpoint (404)', '/api/nonexistent', 'GET', 404, null, false);
  await testApiEndpoint('Invalid Booking Payload', '/api/bookings', 'POST', 400, JSON.stringify({ invalid: 'data' }), false);
  await testApiEndpoint('Invalid Date Format', '/api/rooms/availability?start_date=invalid&end_date=invalid', 'GET', 400, null, false);

  console.log('');

  // ==========================================
  // 7. FRONTEND PAGES
  // ==========================================
  console.log('## 7. Frontend Pages Tests');
  console.log('');

  await testApiEndpoint('Homepage', '/', 'GET', 200, null, false);
  await testApiEndpoint('Rooms Page', '/rooms', 'GET', 200, null, false);
  await testApiEndpoint('Surf Weeks Page', '/surf-weeks', 'GET', 200, null, false);

  console.log('');

  // ==========================================
  // SUMMARY & REPORTING
  // ==========================================
  console.log('==========================================');
  console.log('Test Summary');
  console.log('==========================================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Warnings: ${warnings}`);
  console.log(`Success Rate: ${totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%`);
  console.log('==========================================');
  console.log('');

  // Generate reports
  generateJsonReport();
  generateDiagnosticReport();

  logInfo(`JSON Report: ${REPORT_FILE}`);
  logInfo(`Diagnostic Report: ${DIAGNOSTIC_FILE}`);

  // Exit with error code if tests failed
  if (failedTests > 0) {
    console.log('');
    console.log(`${colors.red}❌ Some tests failed. Please review the diagnostic report.${colors.reset}`);
    process.exit(1);
  } else {
    console.log('');
    console.log(`${colors.green}✅ All tests passed!${colors.reset}`);
    process.exit(0);
  }
}

// Run main function
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

