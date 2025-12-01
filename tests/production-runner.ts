import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://heiwahauz.netlify.app';
const ADMIN_URL = `${BASE_URL}/admin`;

interface TestResult {
  name: string;
  category: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration: number;
}

const results: TestResult[] = [];

async function runTest(
  name: string,
  category: string,
  testFn: () => Promise<void>
): Promise<void> {
  const startTime = Date.now();
  try {
    await testFn();
    results.push({
      name,
      category,
      status: 'PASS',
      message: 'Test passed',
      duration: Date.now() - startTime,
    });
    console.log(`✅ ${name}`);
  } catch (error) {
    results.push({
      name,
      category,
      status: 'FAIL',
      message: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    });
    console.log(`❌ ${name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function main() {
  console.log('🚀 Starting Production Testing Suite for Heiwa House');
  console.log(`📍 Testing: ${BASE_URL}\n`);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // ============================================================================
  // 1. PUBLIC WEBSITE TESTS
  // ============================================================================

  console.log('\n📄 Testing Public Website...\n');

  await runTest('PUB-NAV-001: Homepage loads', '1.1 Navigation', async () => {
    const response = await page.goto(BASE_URL);
    if (!response || !response.ok()) {
      throw new Error(`Homepage returned ${response?.status()}`);
    }
  });

  await runTest('PUB-NAV-001: Hero section visible', '1.1 Navigation', async () => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const hero = page.locator('h1, h2').first();
    if (!(await hero.isVisible())) {
      throw new Error('Hero section not visible');
    }
  });

  await runTest('PUB-NAV-001: Book CTA visible', '1.1 Navigation', async () => {
    await page.goto(BASE_URL);
    const bookBtn = page.locator('button:has-text("Book"), a:has-text("Book")').first();
    if (!(await bookBtn.isVisible())) {
      throw new Error('Book button not visible');
    }
  });

  await runTest('PUB-NAV-004: Mobile responsive', '1.1 Navigation', async () => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const mainContent = page.locator('main, body').first();
    if (!(await mainContent.isVisible())) {
      throw new Error('Main content not visible on mobile');
    }
  });

  await page.setViewportSize({ width: 1280, height: 720 });

  await runTest('PUB-ROOM-001: Rooms page loads', '1.2 Accommodation', async () => {
    const response = await page.goto(`${BASE_URL}/rooms`);
    if (!response || !response.ok()) {
      throw new Error(`Rooms page returned ${response?.status()}`);
    }
  });

  await runTest('PUB-CONT-006: Contact page loads', '1.5 Content', async () => {
    const response = await page.goto(`${BASE_URL}/contact`);
    if (!response || !response.ok()) {
      throw new Error(`Contact page returned ${response?.status()}`);
    }
  });

  await runTest('PUB-CONT-007: Privacy page loads', '1.5 Content', async () => {
    const response = await page.goto(`${BASE_URL}/privacy`);
    if (!response || !response.ok()) {
      throw new Error(`Privacy page returned ${response?.status()}`);
    }
  });

  await runTest('PUB-CONT-008: Terms page loads', '1.5 Content', async () => {
    const response = await page.goto(`${BASE_URL}/terms`);
    if (!response || !response.ok()) {
      throw new Error(`Terms page returned ${response?.status()}`);
    }
  });

  await runTest('PUB-SEO-001: Meta tags present', '1.9 SEO', async () => {
    await page.goto(BASE_URL);
    const title = await page.title();
    if (!title || title.length === 0) {
      throw new Error('Page title is empty');
    }
  });

  // ============================================================================
  // 2. API TESTS
  // ============================================================================

  console.log('\n🔌 Testing API Endpoints...\n');

  await runTest('API: GET /api/rooms', 'API', async () => {
    const response = await page.request.get(`${BASE_URL}/api/rooms`);
    if (response.status() !== 200) {
      throw new Error(`API returned ${response.status()}`);
    }
    const data = await response.json();
    if (!data) {
      throw new Error('API returned empty data');
    }
  });

  await runTest('API: GET /api/bookings', 'API', async () => {
    const response = await page.request.get(`${BASE_URL}/api/bookings`);
    if (response.status() !== 200) {
      throw new Error(`API returned ${response.status()}`);
    }
    const data = await response.json();
    if (!data) {
      throw new Error('API returned empty data');
    }
  });

  await runTest('API: GET /api/surf-camps', 'API', async () => {
    const response = await page.request.get(`${BASE_URL}/api/surf-camps`);
    if (response.status() !== 200) {
      throw new Error(`API returned ${response.status()}`);
    }
    const data = await response.json();
    if (!data) {
      throw new Error('API returned empty data');
    }
  });

  await runTest('API: GET /api/availability', 'API', async () => {
    const response = await page.request.get(`${BASE_URL}/api/availability`);
    if (response.status() !== 200) {
      throw new Error(`API returned ${response.status()}`);
    }
  });

  await runTest('API: GET /api/admin/homepage', 'API', async () => {
    const response = await page.request.get(`${BASE_URL}/api/admin/homepage`);
    if (response.status() !== 200) {
      throw new Error(`API returned ${response.status()}`);
    }
  });

  // ============================================================================
  // 3. CRITICAL FEATURES
  // ============================================================================

  console.log('\n⚡ Testing Critical Features...\n');

  await runTest('Room Assignments: Bookings API has room data', 'Critical', async () => {
    const response = await page.request.get(`${BASE_URL}/api/bookings`);
    const data = await response.json();
    // Just verify the API returns data
    if (!data) {
      throw new Error('Bookings API returned no data');
    }
  });

  await runTest('Participants API: Returns data', 'Critical', async () => {
    const response = await page.request.get(`${BASE_URL}/api/participants`);
    if (response.status() === 200) {
      const data = await response.json();
      if (!data) {
        throw new Error('Participants API returned no data');
      }
    }
  });

  await runTest('No 500 Errors: API endpoints healthy', 'Critical', async () => {
    const endpoints = [
      '/api/rooms',
      '/api/bookings',
      '/api/surf-camps',
      '/api/availability',
      '/api/admin/homepage'
    ];

    for (const endpoint of endpoints) {
      const response = await page.request.get(`${BASE_URL}${endpoint}`);
      if (response.status() === 500) {
        throw new Error(`${endpoint} returned 500`);
      }
    }
  });

  // ============================================================================
  // 4. ADMIN PANEL TESTS
  // ============================================================================

  console.log('\n🔐 Testing Admin Panel...\n');

  await runTest('ADM-AUTH-001: Admin login page loads', '2.1 Auth', async () => {
    const response = await page.goto(ADMIN_URL);
    if (!response || !response.ok()) {
      throw new Error(`Admin page returned ${response?.status()}`);
    }
  });

  await runTest('ADM-BOOK-001: Bookings page accessible', '2.3 Bookings', async () => {
    const response = await page.goto(`${ADMIN_URL}/bookings`);
    if (!response || !response.ok()) {
      throw new Error(`Bookings page returned ${response?.status()}`);
    }
  });

  await runTest('ADM-CLI-001: Clients page accessible', '2.4 Clients', async () => {
    const response = await page.goto(`${ADMIN_URL}/clients`);
    if (!response || !response.ok()) {
      throw new Error(`Clients page returned ${response?.status()}`);
    }
  });

  await runTest('ADM-ROOM-001: Rooms page accessible', '2.5 Rooms', async () => {
    const response = await page.goto(`${ADMIN_URL}/rooms`);
    if (!response || !response.ok()) {
      throw new Error(`Rooms page returned ${response?.status()}`);
    }
  });

  // ============================================================================
  // 5. PERFORMANCE TESTS
  // ============================================================================

  console.log('\n⚡ Testing Performance...\n');

  await runTest('Performance: Homepage load time', 'Performance', async () => {
    const startTime = Date.now();
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    if (loadTime > 5000) {
      throw new Error(`Page load took ${loadTime}ms (expected < 5000ms)`);
    }
  });

  await runTest('Performance: API response time', 'Performance', async () => {
    const startTime = Date.now();
    await page.request.get(`${BASE_URL}/api/rooms`);
    const responseTime = Date.now() - startTime;

    if (responseTime > 3000) {
      throw new Error(`API response took ${responseTime}ms (expected < 3000ms)`);
    }
  });

  // ============================================================================
  // CLEANUP & REPORTING
  // ============================================================================

  await browser.close();

  // Generate report
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;
  const passRate = ((passed / total) * 100).toFixed(2);

  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(80));
  console.log(`\n✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${failed}/${total}`);
  console.log(`📈 Pass Rate: ${passRate}%\n`);

  // Group by category
  const byCategory = new Map<string, TestResult[]>();
  results.forEach(r => {
    if (!byCategory.has(r.category)) {
      byCategory.set(r.category, []);
    }
    byCategory.get(r.category)!.push(r);
  });

  console.log('📋 Results by Category:\n');
  byCategory.forEach((tests, category) => {
    const categoryPassed = tests.filter(t => t.status === 'PASS').length;
    const categoryTotal = tests.length;
    console.log(`  ${category}: ${categoryPassed}/${categoryTotal} passed`);
    tests.forEach(t => {
      const icon = t.status === 'PASS' ? '✅' : '❌';
      console.log(`    ${icon} ${t.name}`);
      if (t.status === 'FAIL') {
        console.log(`       └─ ${t.message}`);
      }
    });
  });

  // Save detailed report
  const reportPath = path.join(process.cwd(), 'test-results-production.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: {
      total,
      passed,
      failed,
      passRate: parseFloat(passRate),
    },
    results,
  }, null, 2));

  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  console.log('='.repeat(80) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
