/**
 * WordPress Testing Helper Utilities
 * Provides comprehensive testing utilities for WordPress widget integration
 */

import { Page, expect } from '@playwright/test';

export interface WordPressConfig {
  baseUrl: string;
  adminUrl: string;
  adminUser: string;
  adminPassword: string;
  pluginPath: string;
}

export interface BookingTestData {
  experienceType: 'room' | 'surf-week';
  participants: number;
  checkIn: string;
  checkOut: string;
  guestDetails: {
    firstName: string;
    lastName: string;
    email: string;
  }[];
  addOns?: string[];
  roomPreference?: string;
}

export class WordPressTestHelper {
  constructor(private config: WordPressConfig) {}

  /**
   * Install and activate the Heiwa booking widget plugin
   */
  async installPlugin(page: Page): Promise<void> {
    await page.goto(`${this.config.adminUrl}/plugin-install.php`);
    
    // Upload plugin if not already installed
    const pluginExists = await page.locator('[data-slug="heiwa-booking-widget"]').count() > 0;
    
    if (!pluginExists) {
      await page.click('a[href="#upload"]');
      await page.setInputFiles('input[type="file"]', this.config.pluginPath);
      await page.click('#install-plugin-submit');
      await page.waitForSelector('.plugin-install-php');
    }
    
    // Activate plugin
    await page.goto(`${this.config.adminUrl}/plugins.php`);
    const activateLink = page.locator('[data-slug="heiwa-booking-widget"] .activate a');
    
    if (await activateLink.count() > 0) {
      await activateLink.click();
      await expect(page.locator('.notice-success')).toBeVisible();
    }
  }

  /**
   * Configure widget settings in WordPress admin
   */
  async configureWidget(page: Page, settings: {
    supabaseUrl: string;
    supabaseKey: string;
    stripeKey: string;
  }): Promise<void> {
    await page.goto(`${this.config.adminUrl}/admin.php?page=heiwa-booking-settings`);
    
    await page.fill('#supabase_url', settings.supabaseUrl);
    await page.fill('#supabase_anon_key', settings.supabaseKey);
    await page.fill('#stripe_publishable_key', settings.stripeKey);
    
    await page.click('#submit');
    await expect(page.locator('.notice-success')).toBeVisible();
  }

  /**
   * Add booking widget to a WordPress page
   */
  async addWidgetToPage(page: Page, pageTitle: string): Promise<string> {
    // Create new page
    await page.goto(`${this.config.adminUrl}/post-new.php?post_type=page`);
    
    await page.fill('#title', pageTitle);
    
    // Add widget shortcode
    await page.click('.editor-writing-flow');
    await page.keyboard.type('[heiwa_booking_widget]');
    
    // Publish page
    await page.click('.editor-post-publish-panel__toggle');
    await page.click('.editor-post-publish-button');
    
    // Get page URL
    await page.waitForSelector('.post-publish-panel__postpublish-header');
    const viewLink = await page.locator('.post-publish-panel__postpublish-buttons a').getAttribute('href');
    
    return viewLink || '';
  }

  /**
   * Complete a booking flow through WordPress widget
   */
  async completeBookingFlow(page: Page, pageUrl: string, bookingData: BookingTestData): Promise<{
    bookingId: string;
    totalAmount: number;
  }> {
    await page.goto(pageUrl);
    
    // Wait for widget to load
    await page.waitForSelector('.heiwa-booking-widget');
    
    // Step 1: Select experience type
    await page.click(`[data-experience-type="${bookingData.experienceType}"]`);
    await page.click('.heiwa-continue-button');
    
    // Step 2: Select dates and participants
    await page.fill('[data-testid="checkin-date"]', bookingData.checkIn);
    await page.fill('[data-testid="checkout-date"]', bookingData.checkOut);
    await page.fill('[data-testid="participants-count"]', bookingData.participants.toString());
    await page.click('.heiwa-continue-button');
    
    // Step 3: Select room/surf week option
    if (bookingData.experienceType === 'room' && bookingData.roomPreference) {
      await page.click(`[data-room-id="${bookingData.roomPreference}"]`);
    } else {
      // Select first available surf week
      await page.click('.heiwa-surf-week-option:first-child');
    }
    await page.click('.heiwa-continue-button');
    
    // Step 4: Add-ons (if any)
    if (bookingData.addOns && bookingData.addOns.length > 0) {
      for (const addOn of bookingData.addOns) {
        await page.click(`[data-addon-id="${addOn}"]`);
      }
    }
    await page.click('.heiwa-continue-button');
    
    // Step 5: Guest details
    for (let i = 0; i < bookingData.guestDetails.length; i++) {
      const guest = bookingData.guestDetails[i];
      await page.fill(`[data-testid="guest-${i}-firstName"]`, guest.firstName);
      await page.fill(`[data-testid="guest-${i}-lastName"]`, guest.lastName);
      await page.fill(`[data-testid="guest-${i}-email"]`, guest.email);
    }
    await page.click('.heiwa-continue-button');
    
    // Step 6: Review and payment
    const totalAmountText = await page.locator('.heiwa-total-amount').textContent();
    const totalAmount = parseFloat(totalAmountText?.replace(/[^0-9.]/g, '') || '0');
    
    // Mock payment for testing
    await page.click('.heiwa-payment-button');
    
    // Wait for success page
    await page.waitForSelector('.heiwa-booking-success');
    const bookingIdElement = await page.locator('[data-testid="booking-id"]');
    const bookingId = await bookingIdElement.textContent() || '';
    
    return { bookingId, totalAmount };
  }

  /**
   * Verify booking appears in admin dashboard
   */
  async verifyBookingInAdmin(page: Page, bookingId: string): Promise<boolean> {
    // Navigate to React admin dashboard
    await page.goto('http://localhost:3005/admin/bookings');
    
    // Login if needed
    const loginForm = await page.locator('form[data-testid="login-form"]').count();
    if (loginForm > 0) {
      await page.fill('[data-testid="email-input"]', 'admin@heiwa.house');
      await page.fill('[data-testid="password-input"]', 'admin123456');
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('**/admin');
      await page.goto('http://localhost:3005/admin/bookings');
    }
    
    // Search for booking
    await page.fill('[data-testid="booking-search"]', bookingId);
    await page.keyboard.press('Enter');
    
    // Verify booking exists
    const bookingRow = page.locator(`[data-booking-id="${bookingId}"]`);
    return await bookingRow.count() > 0;
  }

  /**
   * Compare WordPress widget with React widget functionality
   */
  async compareWidgetFunctionality(page: Page, testCase: {
    name: string;
    wordpressUrl: string;
    reactUrl: string;
    actions: Array<{
      type: 'click' | 'fill' | 'select';
      selector: string;
      value?: string;
    }>;
  }): Promise<{
    wordpressResult: any;
    reactResult: any;
    match: boolean;
  }> {
    // Test WordPress widget
    await page.goto(testCase.wordpressUrl);
    const wordpressResult = await this.executeTestActions(page, testCase.actions);
    
    // Test React widget
    await page.goto(testCase.reactUrl);
    const reactResult = await this.executeTestActions(page, testCase.actions);
    
    // Compare results
    const match = JSON.stringify(wordpressResult) === JSON.stringify(reactResult);
    
    return { wordpressResult, reactResult, match };
  }

  /**
   * Execute a series of test actions and capture results
   */
  private async executeTestActions(page: Page, actions: Array<{
    type: 'click' | 'fill' | 'select';
    selector: string;
    value?: string;
  }>): Promise<any> {
    const results: any = {};
    
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'click':
            await page.click(action.selector);
            break;
          case 'fill':
            await page.fill(action.selector, action.value || '');
            break;
          case 'select':
            await page.selectOption(action.selector, action.value || '');
            break;
        }
        
        // Capture state after action
        results[action.selector] = {
          visible: await page.locator(action.selector).isVisible(),
          text: await page.locator(action.selector).textContent(),
          value: await page.locator(action.selector).inputValue().catch(() => null),
        };
      } catch (error) {
        results[action.selector] = { error: error.message };
      }
    }
    
    return results;
  }

  /**
   * Perform visual regression testing between widgets
   */
  async compareWidgetVisuals(page: Page, wordpressUrl: string, reactUrl: string): Promise<{
    wordpressScreenshot: Buffer;
    reactScreenshot: Buffer;
    match: boolean;
  }> {
    // Screenshot WordPress widget
    await page.goto(wordpressUrl);
    await page.waitForSelector('.heiwa-booking-widget');
    const wordpressScreenshot = await page.locator('.heiwa-booking-widget').screenshot();
    
    // Screenshot React widget
    await page.goto(reactUrl);
    await page.waitForSelector('.heiwa-booking-widget');
    const reactScreenshot = await page.locator('.heiwa-booking-widget').screenshot();
    
    // Basic comparison (in real implementation, use image comparison library)
    const match = wordpressScreenshot.equals(reactScreenshot);
    
    return { wordpressScreenshot, reactScreenshot, match };
  }

  /**
   * Clean up test data
   */
  async cleanup(page: Page): Promise<void> {
    // Delete test pages
    await page.goto(`${this.config.adminUrl}/edit.php?post_type=page`);
    
    const testPages = page.locator('tr[id*="post-"] .row-title:has-text("Test")');
    const count = await testPages.count();
    
    for (let i = 0; i < count; i++) {
      await testPages.nth(i).hover();
      await page.click('.row-actions .trash a');
    }
    
    // Clear any test bookings from database if needed
    // This would require database access or API calls
  }
}

export default WordPressTestHelper;
