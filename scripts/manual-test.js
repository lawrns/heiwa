const { chromium } = require('playwright');

async function manualTest() {
  console.log('🚀 Starting manual testing of Heiwa House Admin Dashboard...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Test 1: Homepage
    console.log('1. Testing homepage...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    const title = await page.title();
    console.log(`   Title: ${title}`);

    const heading = await page.textContent('h1');
    console.log(`   Heading: ${heading}`);

    if (title.includes('Campfire') && heading?.includes('Campfire')) {
      console.log('   ✅ Homepage loads correctly');
    } else {
      console.log('   ❌ Homepage not loading as expected');
    }

    // Test 2: Admin Login Page
    console.log('\n2. Testing admin login page...');
    await page.goto('http://localhost:3000/admin/login');
    await page.waitForLoadState('networkidle');

    const loginTitle = await page.title();
    console.log(`   Title: ${loginTitle}`);

    const hasSignIn = await page.locator('text=Sign In').count() > 0;
    const hasEmailInput = await page.locator('input[type="email"]').count() > 0;
    const hasPasswordInput = await page.locator('input[type="password"]').count() > 0;

    console.log(`   Has Sign In text: ${hasSignIn}`);
    console.log(`   Has email input: ${hasEmailInput}`);
    console.log(`   Has password input: ${hasPasswordInput}`);

    if (hasSignIn && hasEmailInput && hasPasswordInput) {
      console.log('   ✅ Admin login page loads correctly');
    } else {
      console.log('   ❌ Admin login page missing elements');
    }

    // Test 3: Client Portal
    console.log('\n3. Testing client portal...');
    await page.goto('http://localhost:3000/client/auth');
    await page.waitForLoadState('networkidle');

    const clientTitle = await page.title();
    console.log(`   Title: ${clientTitle}`);

    const hasWelcome = await page.locator('text=Welcome to Heiwa House').count() > 0;
    const hasTabs = await page.locator('[role="tab"]').count() > 0;

    console.log(`   Has welcome text: ${hasWelcome}`);
    console.log(`   Has tabs: ${hasTabs}`);

    if (hasWelcome || hasTabs) {
      console.log('   ✅ Client portal loads correctly');
    } else {
      console.log('   ❌ Client portal not loading as expected');
    }

    // Test 4: Navigation links
    console.log('\n4. Testing navigation links...');
    await page.goto('http://localhost:3000');

    const dashboardLink = await page.locator('text=Go to Dashboard').count() > 0;
    const loginLink = await page.locator('text=Login').count() > 0;

    console.log(`   Has dashboard link: ${dashboardLink}`);
    console.log(`   Has login link: ${loginLink}`);

    if (dashboardLink && loginLink) {
      console.log('   ✅ Navigation links present');
    } else {
      console.log('   ❌ Navigation links missing');
    }

    console.log('\n📊 Manual testing completed!');
    console.log('Browser will remain open for manual inspection...');

    // Keep browser open for 30 seconds for manual inspection
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

manualTest().catch(console.error);

