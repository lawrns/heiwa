#!/usr/bin/env node
/**
 * Production Health Check Script
 * Comprehensive verification of all critical production functionality
 */

const https = require('https');
const http = require('http');

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://heiwahauz.netlify.app';
const API_BASE = `${PRODUCTION_URL}/api`;

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Heiwa-Health-Check/1.0',
        ...options.headers,
      },
      timeout: options.timeout || 10000,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
          ok: res.statusCode >= 200 && res.statusCode < 300,
        });
      });
    });
    
    req.on('error', reject);
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

async function checkEndpoint(name, url, expectedStatus = 200, validator = null) {
  try {
    const start = Date.now();
    const response = await makeRequest(url);
    const duration = Date.now() - start;
    
    const statusOk = response.status === expectedStatus;
    const bodyOk = validator ? validator(response.body) : true;
    const performanceOk = duration < 5000; // 5 second threshold
    
    if (statusOk && bodyOk && performanceOk) {
      log(`✓ ${name} - ${response.status} (${duration}ms)`, 'green');
      return { success: true, duration, status: response.status };
    } else {
      const issues = [];
      if (!statusOk) issues.push(`Status ${response.status} (expected ${expectedStatus})`);
      if (!bodyOk) issues.push('Invalid response body');
      if (!performanceOk) issues.push(`Slow (${duration}ms)`);
      log(`✗ ${name} - ${issues.join(', ')}`, 'red');
      return { success: false, duration, status: response.status, issues };
    }
  } catch (error) {
    log(`✗ ${name} - ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function checkJSONEndpoint(name, url, expectedStatus = 200, bodyValidator = null) {
  return checkEndpoint(name, url, expectedStatus, (body) => {
    try {
      const json = JSON.parse(body);
      if (bodyValidator) {
        return bodyValidator(json);
      }
      return json.success !== false; // Most APIs return { success: true }
    } catch {
      return false;
    }
  });
}

async function runHealthChecks() {
  log('\n🏄‍♂️ Heiwa House Production Health Check', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`Target: ${PRODUCTION_URL}\n`, 'blue');
  
  const results = {
    critical: [],
    important: [],
    optional: [],
  };
  
  // Critical API Endpoints
  log('📡 Critical API Endpoints', 'yellow');
  log('-'.repeat(60));
  
  const criticalAPIs = [
    ['Homepage', `${PRODUCTION_URL}/`, 200, (body) => {
      // Homepage returns HTML, check for key content
      return body.includes('<!DOCTYPE') || body.includes('<html') || body.includes('Heiwa');
    }],
    ['Bookings API', `${API_BASE}/bookings`, 200],
    ['Rooms API', `${API_BASE}/rooms`, 200],
    ['Surf Camps API', `${API_BASE}/surf-camps`, 200],
    ['Availability API', `${API_BASE}/availability?roomId=room-1&checkIn=2026-02-01&checkOut=2026-02-03`, 200],
    ['Dates Availability', `${API_BASE}/dates/availability?start_date=2026-02-01&end_date=2026-02-07&participants=2`, 200],
  ];
  
  for (const apiConfig of criticalAPIs) {
    const [name, url, expectedStatus, validator] = apiConfig;
    const result = validator 
      ? await checkEndpoint(name, url, expectedStatus, validator)
      : await checkJSONEndpoint(name, url, expectedStatus);
    results.critical.push({ name, ...result });
    await new Promise(resolve => setTimeout(resolve, 200)); // Rate limiting
  }
  
  // Important API Endpoints
  log('\n📋 Important API Endpoints', 'yellow');
  log('-'.repeat(60));
  
  const importantAPIs = [
    ['Add-ons API', `${API_BASE}/add-ons`, 200],
    ['CMS Homepage', `${API_BASE}/cms/homepage`, 200],
    ['Page Content', `${API_BASE}/cms/page-content?page_slug=surf`, 200],
    ['Google Reviews', `${API_BASE}/google-reviews`, 200],
    ['Rooms Availability', `${API_BASE}/rooms/availability?start_date=2026-02-01&end_date=2026-02-03&guests=2`, 200],
  ];
  
  for (const apiConfig of importantAPIs) {
    const [name, url, expectedStatus, validator] = apiConfig;
    const result = validator 
      ? await checkEndpoint(name, url, expectedStatus, validator)
      : await checkJSONEndpoint(name, url, expectedStatus);
    results.important.push({ name, ...result });
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Optional/Admin Endpoints (may require auth)
  log('\n🔐 Admin/Protected Endpoints', 'yellow');
  log('-'.repeat(60));
  
  const adminAPIs = [
    ['Admin Homepage', `${API_BASE}/admin/homepage`],
    ['Admin Analytics', `${API_BASE}/admin/analytics`],
  ];
  
  for (const [name, url] of adminAPIs) {
    // Admin endpoints may return 200 (if accessible) or require auth (401/403)
    // Accept any of these as valid responses
    const result = await checkJSONEndpoint(name, url, 200, (json) => {
      // Accept 200 with data or 401/403 for auth required
      return true; // Always valid if we got a response
    });
    // Check actual status for reporting
    if ([200, 401, 403].includes(result.status || 0)) {
      result.success = true;
    }
    results.optional.push({ name, ...result });
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Static Assets
  log('\n🖼️  Static Assets', 'yellow');
  log('-'.repeat(60));
  
  const staticAssets = [
    ['Favicon', `${PRODUCTION_URL}/favicon.ico`],
    ['Robots.txt', `${PRODUCTION_URL}/robots.txt`],
    ['Sitemap', `${PRODUCTION_URL}/sitemap.xml`],
  ];
  
  for (const [name, url] of staticAssets) {
    // Static assets: 200 = exists, 404 = doesn't exist (both are OK)
    const result = await checkEndpoint(name, url, 200, (body) => {
      // Any response (200 or 404) is acceptable for static assets
      return true;
    });
    // Accept 200 or 404 as success
    if ([200, 404].includes(result.status || 0)) {
      result.success = true;
    }
    results.optional.push({ name, ...result });
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Summary
  log('\n📊 Health Check Summary', 'cyan');
  log('='.repeat(60));
  
  const criticalPassed = results.critical.filter(r => r.success).length;
  const criticalTotal = results.critical.length;
  const importantPassed = results.important.filter(r => r.success).length;
  const importantTotal = results.important.length;
  
  log(`\nCritical APIs: ${criticalPassed}/${criticalTotal} passing`, 
    criticalPassed === criticalTotal ? 'green' : 'red');
  log(`Important APIs: ${importantPassed}/${importantTotal} passing`,
    importantPassed === importantTotal ? 'green' : 'yellow');
  
  // Performance Summary
  const allDurations = [...results.critical, ...results.important]
    .filter(r => r.duration)
    .map(r => r.duration);
  
  if (allDurations.length > 0) {
    const avgDuration = allDurations.reduce((a, b) => a + b, 0) / allDurations.length;
    const maxDuration = Math.max(...allDurations);
    log(`\nAverage Response Time: ${avgDuration.toFixed(0)}ms`, 'blue');
    log(`Slowest Response: ${maxDuration}ms`, maxDuration > 3000 ? 'yellow' : 'blue');
  }
  
  // Failed Checks
  const failed = [...results.critical, ...results.important, ...results.optional]
    .filter(r => !r.success);
  
  if (failed.length > 0) {
    log('\n❌ Failed Checks:', 'red');
    failed.forEach(f => {
      log(`  - ${f.name}: ${f.error || f.issues?.join(', ') || 'Unknown error'}`, 'red');
    });
  } else {
    log('\n✅ All checks passed!', 'green');
  }
  
  // Recommendations
  log('\n💡 Recommendations:', 'cyan');
  if (failed.length > 0) {
    log('  - Review failed endpoints and check logs', 'yellow');
    log('  - Verify environment variables are set correctly', 'yellow');
    log('  - Check database connection status', 'yellow');
  }
  if (allDurations.some(d => d > 3000)) {
    log('  - Some endpoints are slow, consider optimization', 'yellow');
  }
  
  log('\n' + '='.repeat(60) + '\n', 'cyan');
  
  // Exit code based on critical failures
  const criticalFailed = results.critical.filter(r => !r.success).length;
  process.exit(criticalFailed > 0 ? 1 : 0);
}

// Run health checks
runHealthChecks().catch(error => {
  log(`\n❌ Health check failed: ${error.message}`, 'red');
  process.exit(1);
});

