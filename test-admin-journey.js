const { chromium } = require('playwright');

async function testAdminJourney() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('1. Navigating to admin page...');
    await page.goto('https://heiwahauz.netlify.app/admin');
    
    // Wait for login page
    await page.waitForSelector('input[type="password"]');
    console.log('2. Admin login page loaded');
    
    // Enter password
    await page.fill('input[type="password"]', 'heiwa_admin_2024');
    await page.click('button[type="submit"]');
    
    console.log('3. Logging in...');
    await page.waitForURL('**/admin');
    console.log('4. Successfully logged in');
    
    // Navigate to surf camps
    await page.goto('https://heiwahauz.netlify.app/admin/surf-camps');
    await page.waitForTimeout(2000);
    console.log('5. Navigated to surf camps page');
    
    // Check for status filters
    const statusFilters = await page.locator('button:has-text("All"), button:has-text("Active"), button:has-text("Inactive"), button:has-text("Past")').count();
    console.log(`6. Status filter buttons found: ${statusFilters}`);
    
    // Check for explanation text
    const explanationText = await page.locator('text=Public booking only shows surf weeks').count();
    console.log(`7. Explanation text found: ${explanationText > 0 ? 'Yes' : 'No'}`);
    
    // Navigate to rooms
    await page.click('a[href="/admin/rooms"]');
    await page.waitForLoadState('networkidle');
    console.log('8. Navigated to rooms page');
    
    // Click on first room to edit
    const firstRoomLink = await page.locator('a[href*="/admin/rooms/"]').first();
    await firstRoomLink.click();
    await page.waitForLoadState('networkidle');
    console.log('9. Opened room edit page');
    
    // Check for image upload component
    const imageUpload = await page.locator('input[type="file"]').count();
    console.log(`10. Image upload input found: ${imageUpload > 0 ? 'Yes' : 'No'}`);
    
    // Check for ImageUpload component label
    const uploadLabel = await page.locator('text=Upload Images').count();
    console.log(`11. Upload Images section found: ${uploadLabel > 0 ? 'Yes' : 'No'}`);
    
    // Take screenshot for verification
    await page.screenshot({ path: 'admin-surf-camps.png', fullPage: true });
    console.log('12. Screenshot saved as admin-surf-camps.png');
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
}

testAdminJourney();
