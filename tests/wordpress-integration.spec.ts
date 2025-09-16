/**
 * WordPress Integration Test Suite
 * Comprehensive testing of WordPress booking widget integration
 */

import { test, expect, Page } from '@playwright/test';
import WordPressTestHelper, { BookingTestData, WordPressConfig } from './utils/wordpress-helper';

const wpConfig: WordPressConfig = {
  baseUrl: 'http://localhost:8080',
  adminUrl: 'http://localhost:8080/wp-admin',
  adminUser: 'admin',
  adminPassword: 'admin123',
  pluginPath: './wordpress-plugin/heiwa-booking-widget.zip',
};

const testBookingData: BookingTestData = {
  experienceType: 'surf-week',
  participants: 2,
  checkIn: '2024-03-15',
  checkOut: '2024-03-22',
  guestDetails: [
    { firstName: 'John', lastName: 'Doe', email: 'john@test.com' },
    { firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com' },
  ],
  addOns: ['surfboard-rental', 'wetsuit-rental'],
};

let wpHelper: WordPressTestHelper;

test.describe('WordPress Widget Integration', () => {
  test.beforeAll(async ({ browser }) => {
    wpHelper = new WordPressTestHelper(wpConfig);
    const page = await browser.newPage();
    
    // Setup WordPress environment
    await page.goto(wpConfig.adminUrl);
    await page.fill('#user_login', wpConfig.adminUser);
    await page.fill('#user_pass', wpConfig.adminPassword);
    await page.click('#wp-submit');
    
    // Install and configure plugin
    await wpHelper.installPlugin(page);
    await wpHelper.configureWidget(page, {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      stripeKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    });
    
    await page.close();
  });

  test.describe('Plugin Installation and Configuration', () => {
    test('should install Heiwa booking widget plugin successfully', async ({ page }) => {
      await page.goto(`${wpConfig.adminUrl}/plugins.php`);
      
      const pluginRow = page.locator('[data-slug="heiwa-booking-widget"]');
      await expect(pluginRow).toBeVisible();
      
      const activeStatus = pluginRow.locator('.active');
      await expect(activeStatus).toBeVisible();
    });

    test('should configure widget settings correctly', async ({ page }) => {
      await page.goto(`${wpConfig.adminUrl}/admin.php?page=heiwa-booking-settings`);
      
      const supabaseUrl = page.locator('#supabase_url');
      await expect(supabaseUrl).toHaveValue(process.env.NEXT_PUBLIC_SUPABASE_URL!);
      
      const supabaseKey = page.locator('#supabase_anon_key');
      await expect(supabaseKey).toHaveValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    });

    test('should display widget shortcode documentation', async ({ page }) => {
      await page.goto(`${wpConfig.adminUrl}/admin.php?page=heiwa-booking-settings`);
      
      const shortcodeExample = page.locator('.shortcode-example');
      await expect(shortcodeExample).toContainText('[heiwa_booking_widget]');
      
      const documentation = page.locator('.widget-documentation');
      await expect(documentation).toBeVisible();
    });
  });

  test.describe('Widget Functionality', () => {
    let testPageUrl: string;

    test.beforeAll(async ({ browser }) => {
      const page = await browser.newPage();
      await page.goto(wpConfig.adminUrl);
      await page.fill('#user_login', wpConfig.adminUser);
      await page.fill('#user_pass', wpConfig.adminPassword);
      await page.click('#wp-submit');
      
      testPageUrl = await wpHelper.addWidgetToPage(page, 'Test Booking Page');
      await page.close();
    });

    test('should render booking widget on WordPress page', async ({ page }) => {
      await page.goto(testPageUrl);
      
      const widget = page.locator('.heiwa-booking-widget');
      await expect(widget).toBeVisible();
      
      const experienceOptions = page.locator('.heiwa-experience-option');
      await expect(experienceOptions).toHaveCount(2); // Room and Surf Week
    });

    test('should complete surf week booking flow', async ({ page }) => {
      const result = await wpHelper.completeBookingFlow(page, testPageUrl, testBookingData);
      
      expect(result.bookingId).toBeTruthy();
      expect(result.totalAmount).toBeGreaterThan(0);
      
      // Verify booking appears in admin dashboard
      const bookingExists = await wpHelper.verifyBookingInAdmin(page, result.bookingId);
      expect(bookingExists).toBe(true);
    });

    test('should handle room booking flow', async ({ page }) => {
      const roomBookingData: BookingTestData = {
        ...testBookingData,
        experienceType: 'room',
        roomPreference: 'room-1',
      };
      
      const result = await wpHelper.completeBookingFlow(page, testPageUrl, roomBookingData);
      
      expect(result.bookingId).toBeTruthy();
      expect(result.totalAmount).toBeGreaterThan(0);
    });

    test('should validate form inputs correctly', async ({ page }) => {
      await page.goto(testPageUrl);
      
      // Try to proceed without selecting experience
      await page.click('.heiwa-continue-button');
      
      const errorMessage = page.locator('.heiwa-error-message');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText('Please select an experience');
    });

    test('should handle payment errors gracefully', async ({ page }) => {
      await page.goto(testPageUrl);
      
      // Complete flow up to payment
      await page.click('[data-experience-type="surf-week"]');
      await page.click('.heiwa-continue-button');
      
      await page.fill('[data-testid="checkin-date"]', testBookingData.checkIn);
      await page.fill('[data-testid="checkout-date"]', testBookingData.checkOut);
      await page.fill('[data-testid="participants-count"]', '1');
      await page.click('.heiwa-continue-button');
      
      // Select surf week
      await page.click('.heiwa-surf-week-option:first-child');
      await page.click('.heiwa-continue-button');
      
      // Skip add-ons
      await page.click('.heiwa-continue-button');
      
      // Fill guest details
      await page.fill('[data-testid="guest-0-firstName"]', 'Test');
      await page.fill('[data-testid="guest-0-lastName"]', 'User');
      await page.fill('[data-testid="guest-0-email"]', 'test@example.com');
      await page.click('.heiwa-continue-button');
      
      // Simulate payment failure
      await page.evaluate(() => {
        window.stripeTestMode = 'payment_failed';
      });
      
      await page.click('.heiwa-payment-button');
      
      const paymentError = page.locator('.heiwa-payment-error');
      await expect(paymentError).toBeVisible();
    });
  });

  test.describe('Widget Parity Testing', () => {
    test('should match React widget functionality', async ({ page }) => {
      const testCase = {
        name: 'Experience Selection',
        wordpressUrl: testPageUrl,
        reactUrl: 'http://localhost:3005/test-widget',
        actions: [
          { type: 'click' as const, selector: '[data-experience-type="surf-week"]' },
          { type: 'click' as const, selector: '.heiwa-continue-button' },
        ],
      };
      
      const comparison = await wpHelper.compareWidgetFunctionality(page, testCase);
      
      expect(comparison.match).toBe(true);
    });

    test('should have visual parity with React widget', async ({ page }) => {
      const comparison = await wpHelper.compareWidgetVisuals(
        page,
        testPageUrl,
        'http://localhost:3005/test-widget'
      );
      
      // Allow for minor differences due to WordPress styling
      expect(comparison.match).toBe(true);
    });

    test('should maintain consistent pricing calculations', async ({ page }) => {
      // Test WordPress widget pricing
      await page.goto(testPageUrl);
      await page.click('[data-experience-type="surf-week"]');
      await page.click('.heiwa-continue-button');
      
      await page.fill('[data-testid="participants-count"]', '2');
      await page.click('.heiwa-continue-button');
      
      await page.click('.heiwa-surf-week-option:first-child');
      await page.click('.heiwa-continue-button');
      
      // Skip add-ons
      await page.click('.heiwa-continue-button');
      
      // Fill guest details
      await page.fill('[data-testid="guest-0-firstName"]', 'Test');
      await page.fill('[data-testid="guest-0-lastName"]', 'User');
      await page.fill('[data-testid="guest-0-email"]', 'test@example.com');
      await page.fill('[data-testid="guest-1-firstName"]', 'Test2');
      await page.fill('[data-testid="guest-1-lastName"]', 'User2');
      await page.fill('[data-testid="guest-1-email"]', 'test2@example.com');
      await page.click('.heiwa-continue-button');
      
      const wpTotal = await page.locator('.heiwa-total-amount').textContent();
      
      // Test React widget pricing with same configuration
      await page.goto('http://localhost:3005/test-widget');
      // ... repeat same steps ...
      
      const reactTotal = await page.locator('.heiwa-total-amount').textContent();
      
      expect(wpTotal).toBe(reactTotal);
    });
  });

  test.describe('Performance and Accessibility', () => {
    test('should load widget within performance thresholds', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto(testPageUrl);
      await page.waitForSelector('.heiwa-booking-widget');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // 3 second threshold
    });

    test('should be accessible to screen readers', async ({ page }) => {
      await page.goto(testPageUrl);
      
      const widget = page.locator('.heiwa-booking-widget');
      await expect(widget).toHaveAttribute('role', 'main');
      
      const experienceOptions = page.locator('.heiwa-experience-option');
      for (let i = 0; i < await experienceOptions.count(); i++) {
        const option = experienceOptions.nth(i);
        await expect(option).toHaveAttribute('aria-label');
        await expect(option).toHaveAttribute('tabindex', '0');
      }
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto(testPageUrl);
      
      // Tab through widget elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toHaveClass(/heiwa-experience-option/);
      
      // Select with Enter key
      await page.keyboard.press('Enter');
      
      const continueButton = page.locator('.heiwa-continue-button');
      await expect(continueButton).toBeVisible();
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle network connectivity issues', async ({ page }) => {
      await page.goto(testPageUrl);
      
      // Simulate network failure
      await page.route('**/api/**', route => route.abort());
      
      await page.click('[data-experience-type="surf-week"]');
      await page.click('.heiwa-continue-button');
      
      const networkError = page.locator('.heiwa-network-error');
      await expect(networkError).toBeVisible();
      await expect(networkError).toContainText('connection');
    });

    test('should handle invalid date selections', async ({ page }) => {
      await page.goto(testPageUrl);
      
      await page.click('[data-experience-type="surf-week"]');
      await page.click('.heiwa-continue-button');
      
      // Try to select past date
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      await page.fill('[data-testid="checkin-date"]', pastDate.toISOString().split('T')[0]);
      await page.click('.heiwa-continue-button');
      
      const dateError = page.locator('.heiwa-date-error');
      await expect(dateError).toBeVisible();
    });

    test('should handle capacity constraints', async ({ page }) => {
      await page.goto(testPageUrl);
      
      await page.click('[data-experience-type="surf-week"]');
      await page.click('.heiwa-continue-button');
      
      // Try to book more participants than capacity
      await page.fill('[data-testid="participants-count"]', '50');
      await page.click('.heiwa-continue-button');
      
      const capacityError = page.locator('.heiwa-capacity-error');
      await expect(capacityError).toBeVisible();
    });
  });

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage();
    await wpHelper.cleanup(page);
    await page.close();
  });
});
