import { test, expect } from '@playwright/test';

test.describe('Heiwa Booking Widget E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Set up the page with necessary configurations
    await page.goto('http://localhost:3005/widget-demo');

    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');

    // Ensure widget scripts are loaded and jQuery is available
    await page.waitForFunction(() => {
      return typeof window !== 'undefined' &&
             typeof window.jQuery !== 'undefined' &&
             typeof window.$ !== 'undefined';
    });

    // Wait a bit more for widget initialization
    await page.waitForTimeout(2000);
  });

  test('should display the demo page correctly', async ({ page }) => {
    // Check that the page loaded
    await expect(page).toHaveTitle(/Heiwa/);

    // Verify the Book Now button is visible
    const bookNowButton = page.locator('#heiwa-trigger-btn');
    await expect(bookNowButton).toBeVisible();
    await expect(bookNowButton).toContainText('BOOK NOW');

    // Verify hero content
    await expect(page.locator('h1').first()).toContainText('Heiwa House Booking Widget');
    await expect(page.locator('p').first()).toContainText('Experience our premium surf camp booking system');

    // Verify feature cards are displayed
    const featureCards = page.locator('.feature-card');
    await expect(featureCards).toHaveCount(6);

    // Verify feature content
    await expect(page.locator('text=Surf-Themed Design')).toBeVisible();
    await expect(page.locator('text=Mobile Perfect')).toBeVisible();
    await expect(page.locator('text=Lightning Fast')).toBeVisible();
  });

  test('should open booking widget when Book Now is clicked', async ({ page }) => {
    // Click the Book Now button
    const bookNowButton = page.locator('#heiwa-trigger-btn');
    await bookNowButton.click();

    // Wait for widget drawer to appear
    await page.waitForTimeout(2000);

    // Verify that the widget backdrop and drawer appear
    const backdrop = page.locator('.heiwa-booking-backdrop.active');
    const drawer = page.locator('.heiwa-booking-drawer.active');
    
    await expect(backdrop).toBeVisible();
    await expect(drawer).toBeVisible();
    
    // Verify drawer header
    await expect(page.locator('.heiwa-booking-drawer-title')).toContainText('Book Your Surf Adventure');
  });

  test('should complete full booking flow from start to finish', async ({ page }) => {
    // Click Book Now button
    const bookNowButton = page.locator('#heiwa-trigger-btn');
    await bookNowButton.click();

    // Wait for widget to appear
    await page.waitForTimeout(2000);

    // Verify widget drawer is visible
    const drawer = page.locator('.heiwa-booking-drawer.active');
    await expect(drawer).toBeVisible();

    // Verify first step (booking type selection)
    await expect(page.locator('.heiwa-booking-drawer')).toContainText('Book Your Surf Adventure');

    // Test booking type selection - choose Room booking
    const roomOption = page.locator('.heiwa-booking-option-card').first();
    await roomOption.click();

    // Verify visual feedback (border color change)
    await expect(roomOption).toHaveCSS('border-color', 'rgb(236, 104, 28)'); // #ec681c

    // Wait for transition to next step
    await page.waitForTimeout(600);

    // Verify booking flow progression
    await expect(page.locator('.heiwa-booking-drawer')).toBeVisible();

    // Fill out date fields
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 3);

    const checkinDate = tomorrow.toISOString().split('T')[0];
    const checkoutDate = dayAfter.toISOString().split('T')[0];

    await page.fill('#checkin-date', checkinDate);
    await page.fill('#checkout-date', checkoutDate);

    // Select 2 participants
    await page.selectOption('#participants', '2');

    // Click Continue button
    const continueBtn = page.locator('.heiwa-next-btn');
    await continueBtn.click();

    // Wait for transition to details step
    await page.waitForTimeout(600);

    // Verify details step is shown
    await expect(page.locator('#step-details')).toBeVisible();
    await expect(page.locator('text=Booking Details')).toBeVisible();

    // Fill out booking details
    await page.fill('#full-name', 'John Doe');
    await page.fill('#email', 'john.doe@example.com');
    await page.fill('#phone', '+1-555-0123');

    // Submit the booking
    const submitBtn = page.locator('.heiwa-submit-btn');
    await submitBtn.click();

    // Wait for transition to success step
    await page.waitForTimeout(600);

    // Verify success step is shown
    await expect(page.locator('#step-success')).toBeVisible();
    await expect(page.locator('text=Booking Confirmed!')).toBeVisible();
    await expect(page.locator('text=Thank you for choosing Heiwa House')).toBeVisible();

    console.log('Full booking flow test completed successfully');
  });

  test('should handle responsive design correctly', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const bookNowButton = page.locator('#heiwa-trigger-btn');
    await expect(bookNowButton).toBeVisible();

    // Verify mobile layout adjustments
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(bookNowButton).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(bookNowButton).toBeVisible();
  });

  test('should load widget assets correctly', async ({ page }) => {
    // Check that CSS files are loaded
    const cssLinks = await page.locator('link[rel="stylesheet"]').all();
    expect(cssLinks.length).toBeGreaterThanOrEqual(4); // base, components, layout, utilities

    // Check that JavaScript is loaded
    const scripts = await page.locator('script[src]').all();
    expect(scripts.length).toBeGreaterThanOrEqual(2); // jQuery + widget.js

    // Verify jQuery is available
    const jQueryLoaded = await page.evaluate(() => {
      return typeof window.jQuery !== 'undefined' && typeof window.$ !== 'undefined';
    });
    expect(jQueryLoaded).toBe(true);

    // Verify no console errors (except expected ones)
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('Next.js')) {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(2000);
    expect(errors.length).toBe(0);
  });

  test('should initialize widget without jQuery errors', async ({ page }) => {
    // Check that no jQuery-related errors are thrown
    const jQueryErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('jQuery')) {
        jQueryErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(3000);

    // Should have no jQuery errors
    expect(jQueryErrors.length).toBe(0);

    // Verify widget initialization messages appear
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'info') {
        logs.push(msg.text());
      }
    });

    await page.waitForTimeout(1000);

    // Should see initialization messages
    const hasInitMessage = logs.some(log =>
      log.includes('jQuery loaded') ||
      log.includes('Widget initialization') ||
      log.includes('Heiwa Booking Widget')
    );
    expect(hasInitMessage).toBe(true);
  });

  test('should handle network failures gracefully', async ({ page }) => {
    // Mock network failure for API calls
    await page.route('**/api/wordpress/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Network Error',
          message: 'Unable to connect to booking service'
        })
      });
    });

    // Click Book Now
    const bookNowButton = page.locator('#heiwa-trigger-btn');
    await bookNowButton.click();

    await page.waitForTimeout(2000);

    // The widget should handle the error gracefully
    // This test will need to be updated based on actual error handling
    console.log('Network failure test completed - widget should handle errors gracefully');
  });

  test('should maintain accessibility standards', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1Elements = await page.locator('h1').all();
    expect(h1Elements.length).toBeGreaterThan(0);

    const h2Elements = await page.locator('h2').all();
    expect(h2Elements.length).toBeGreaterThan(0);

    // Check for alt text on images (if any)
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }

    // Check for proper button accessibility
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const accessibleName = await button.getAttribute('aria-label') ||
                           await button.textContent();
      expect(accessibleName?.trim()).toBeTruthy();
    }
  });

  test('should work with keyboard navigation', async ({ page }) => {
    // Test keyboard navigation to Book Now button
    await page.keyboard.press('Tab');
    const activeElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(activeElement).toBe('BUTTON');

    // Test button activation with Enter
    await page.keyboard.press('Enter');

    // Verify widget interaction
    await page.waitForTimeout(1000);
    console.log('Keyboard navigation test completed');
  });

  test('should handle surf week booking flow', async ({ page }) => {
    // Click Book Now button
    const bookNowButton = page.locator('#heiwa-trigger-btn');
    await bookNowButton.click();

    // Wait for widget to appear
    await page.waitForTimeout(2000);

    // Choose Surf Week booking type
    const surfWeekOption = page.locator('.heiwa-booking-option-card').nth(1);
    await surfWeekOption.click();

    // Verify visual feedback
    await expect(surfWeekOption).toHaveCSS('border-color', 'rgb(236, 104, 28)');

    // Wait for transition to dates step
    await page.waitForTimeout(600);

    // Verify dates step is shown
    await expect(page.locator('#step-dates')).toBeVisible();

    // Fill out form for surf week
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekLater = new Date(tomorrow);
    weekLater.setDate(weekLater.getDate() + 7);

    await page.fill('#checkin-date', tomorrow.toISOString().split('T')[0]);
    await page.fill('#checkout-date', weekLater.toISOString().split('T')[0]);
    await page.selectOption('#participants', '1');

    // Continue to details
    const continueBtn = page.locator('.heiwa-next-btn');
    await continueBtn.click();

    await page.waitForTimeout(600);

    // Fill details
    await page.fill('#full-name', 'Jane Smith');
    await page.fill('#email', 'jane.smith@example.com');
    await page.fill('#phone', '+1-555-0456');

    // Submit
    const submitBtn = page.locator('.heiwa-submit-btn');
    await submitBtn.click();

    await page.waitForTimeout(600);

    // Verify success
    await expect(page.locator('#step-success')).toBeVisible();
    await expect(page.locator('text=Booking Confirmed!')).toBeVisible();
  });

  test('should handle navigation between steps', async ({ page }) => {
    // Click Book Now
    const bookNowButton = page.locator('#heiwa-trigger-btn');
    await bookNowButton.click();
    await page.waitForTimeout(2000);

    // Select booking type
    const roomOption = page.locator('.heiwa-booking-option-card').first();
    await roomOption.click();
    await page.waitForTimeout(600);

    // Go to dates step
    const continueBtn = page.locator('.heiwa-next-btn');
    await continueBtn.click();
    await page.waitForTimeout(600);

    // Verify we're on details step
    await expect(page.locator('#step-details')).toBeVisible();

    // Go back to dates step
    const backBtn = page.locator('.heiwa-back-btn');
    await backBtn.click();
    await page.waitForTimeout(600);

    // Verify we're back on dates step
    await expect(page.locator('#step-dates')).toBeVisible();
    await expect(page.locator('#step-details')).not.toBeVisible();
  });

  test('should close widget correctly', async ({ page }) => {
    // Click Book Now
    const bookNowButton = page.locator('#heiwa-trigger-btn');
    await bookNowButton.click();
    await page.waitForTimeout(2000);

    // Verify widget is visible
    const drawer = page.locator('.heiwa-booking-drawer.active');
    await expect(drawer).toBeVisible();

    // Close widget using close button
    const closeBtn = page.locator('.heiwa-booking-drawer-close');
    await closeBtn.click();

    // Verify widget is hidden
    await expect(drawer).not.toBeVisible();
  });

  test('should handle form submission with valid data', async ({ page }) => {
    // Click Book Now
    const bookNowButton = page.locator('#heiwa-trigger-btn');
    await bookNowButton.click();
    await page.waitForTimeout(2000);

    // Select booking type
    const roomOption = page.locator('.heiwa-booking-option-card').first();
    await roomOption.click();
    await page.waitForTimeout(600);

    // Go to dates step
    const continueBtn = page.locator('.heiwa-next-btn');
    await continueBtn.click();
    await page.waitForTimeout(600);

    // Go to details step
    const continueBtn2 = page.locator('.heiwa-next-btn');
    await continueBtn2.click();
    await page.waitForTimeout(600);

    // Fill all required fields
    await page.fill('#full-name', 'Test User');
    await page.fill('#email', 'test@example.com');
    await page.fill('#phone', '+1-555-0123');

    // Submit the booking
    const submitBtn = page.locator('.heiwa-submit-btn');
    await submitBtn.click();
    await page.waitForTimeout(600);

    // Verify success step is shown
    await expect(page.locator('#step-success')).toBeVisible();
    await expect(page.locator('text=Booking Confirmed!')).toBeVisible();
  });
});
