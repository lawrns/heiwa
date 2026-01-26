const { chromium } = require('playwright');

async function testAdminUI() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('1. Navigating to admin login...');
    await page.goto('https://heiwahauz.netlify.app/admin');
    
    // Login
    await page.fill('input[type="password"]', 'heiwa_admin_2024');
    await page.click('button[type="submit"]');
    
    console.log('2. Waiting for login to complete...');
    await page.waitForURL('**/admin', { timeout: 10000 });
    
    // Navigate to surf camps
    console.log('3. Navigating to surf camps...');
    await page.goto('https://heiwahauz.netlify.app/admin/surf-camps');
    
    // Wait for page to fully load and hydrate
    await page.waitForTimeout(3000);
    
    // Look for filter buttons using multiple selectors
    const filterButtons = await page.locator('button').filter({ hasText: /All|Active|Inactive|Past/ }).count();
    console.log(`4. Filter buttons found: ${filterButtons}`);
    
    // Check for the explanation section
    const explanationSection = await page.locator('.bg-heiwaOrange-50').count();
    console.log(`5. Explanation section found: ${explanationSection > 0 ? 'Yes' : 'No'}`);
    
    // Take screenshot for visual verification
    await page.screenshot({ path: 'surf-camps-admin.png', fullPage: true });
    console.log('6. Screenshot saved as surf-camps-admin.png');
    
    // Navigate to rooms edit page
    console.log('7. Navigating to rooms...');
    await page.goto('https://heiwahauz.netlify.app/admin/rooms');
    await page.waitForTimeout(2000);
    
    // Click first room edit link
    const editLink = await page.locator('a[href*="/admin/rooms/"]').first();
    if (await editLink.isVisible()) {
      await editLink.click();
      await page.waitForTimeout(2000);
      
      // Check for image upload component
      const fileInput = await page.locator('input[type="file"]').count();
      const uploadSection = await page.locator('text=Upload Images').count();
      
      console.log(`8. File input found: ${fileInput > 0 ? 'Yes' : 'No'}`);
      console.log(`9. Upload section found: ${uploadSection > 0 ? 'Yes' : 'No'}`);
      
      await page.screenshot({ path: 'room-edit-admin.png', fullPage: true });
      console.log('10. Screenshot saved as room-edit-admin.png');
    }
    
    // Final assessment
    console.log('\n=== FINAL ASSESSMENT ===');
    if (filterButtons === 0 && explanationSection === 0) {
      console.log('❌ Admin UI changes are NOT deployed');
      console.log('The site is running an older version without the status filters');
    } else {
      console.log('✅ Admin UI changes ARE deployed');
      console.log('Status filters and explanation are visible');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

testAdminUI();
