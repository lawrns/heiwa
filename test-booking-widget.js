// Test script to verify booking widget fixes
const { chromium } = require('playwright');

async function testBookingWidget() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Listen for console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  try {
    // Set viewport size and navigate
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('http://localhost:3000');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Scroll to find the Book Now button
    await page.evaluate(() => window.scrollTo(0, 0));
    
    // Try multiple selectors for "Book Now" button
    const bookNowButton = page.locator('button:has-text("Book Now")').first();
    
    // Ensure button is in viewport
    await bookNowButton.scrollIntoViewIfNeeded();
    
    // Click "Book Now" button
    await bookNowButton.click();
    
    // Wait for booking widget to open
    await page.waitForSelector('.heiwa-modal-overlay', { timeout: 5000 });
    
    // Test 1: Check for hydration errors
    console.log('\n=== Checking for hydration errors ===');
    if (consoleErrors.length > 0) {
      console.log('❌ Console errors found:');
      consoleErrors.forEach(error => console.log('  -', error));
    } else {
      console.log('✅ No console errors detected');
    }
    
    // Test 2: Select surf week flow
    console.log('\n=== Testing surf week selection flow ===');
    
    // Select "Surf Week" experience
    await page.click('button:has-text("Surf Week")');
    
    // Wait for surf weeks to load
    await page.waitForSelector('[data-testid="surf-week-option"], .text-gray-500:has-text("No surf weeks available")', { timeout: 5000 });
    
    // Check if surf weeks are displayed
    const surfWeeksAvailable = await page.locator('[data-testid="surf-week-option"]').count() > 0;
    
    if (surfWeeksAvailable) {
      console.log('✅ Surf weeks are available');
      
      // Select first surf week
      await page.click('[data-testid="surf-week-option"] button');
      
      // Fill participant name
      await page.fill('input[placeholder*="First name"]', 'Test');
      await page.fill('input[placeholder*="Last name"]', 'User');
      
      // Click Next to go to room assignment
      await page.click('button:has-text("Next")');
      
      // Wait for room assignment step
      await page.waitForSelector('text=Assign Guests to Rooms', { timeout: 5000 });
      
      // Test 3: Check Back button functionality
      console.log('\n=== Testing Back button ===');
      
      // Check if Back button is disabled at first step
      const backButton = page.locator('button:has-text("Back")');
      const isDisabled = await backButton.isDisabled();
      
      if (isDisabled) {
        console.log('✅ Back button is correctly disabled at first effective step');
      } else {
        console.log('❌ Back button should be disabled but it\'s enabled');
      }
      
      // Try to click Back button (should not navigate)
      await backButton.click({ timeout: 1000 });
      
      // Verify we're still on the same step
      const stillOnRoomAssignment = await page.locator('text=Assign Guests to Rooms').isVisible();
      if (stillOnRoomAssignment) {
        console.log('✅ Back button correctly prevented navigation');
      } else {
        console.log('❌ Back button allowed navigation when it shouldn\'t');
      }
      
    } else {
      console.log('⚠️ No surf weeks available for testing');
    }
    
    // Test 4: Check for flickering (visual test - manual verification needed)
    console.log('\n=== Flickering Test ===');
    console.log('⚠️ Flickering must be verified manually in the browser');
    console.log('   Look for: Initial render jumps, state restoration flashes');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testBookingWidget();
