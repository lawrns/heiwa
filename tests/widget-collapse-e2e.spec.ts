import { test, expect } from '@playwright/test';

/**
 * Comprehensive E2E test for Heiwa Booking Widget Collapse Functionality
 *
 * Tests the complete booking flow with focus on:
 * - Progressive disclosure collapse behavior
 * - Guest form auto-collapse after completion
 * - No console errors throughout the flow
 * - Proper UI state management
 */

test.describe('Heiwa Booking Widget - Complete E2E Collapse Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to widget test page
    await page.goto('/widget-test-wp');

    // Wait for page to load completely
    await page.waitForLoadState('networkidle');

    // Clear console errors before starting
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console Error:', msg.text());
      }
    });
  });

  test('Complete booking flow with collapse functionality', async ({ page }) => {
    // Step 1: Verify widget loads without console errors
    console.log('Step 1: Verifying widget loads cleanly');
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Wait for widget to be visible
    await page.waitForSelector('.heiwa-booking-widget', { timeout: 10000 });
    expect(consoleErrors.length).toBe(0);

    // Step 2: Click "Book Now" to open widget
    console.log('Step 2: Opening widget');
    await page.click('.widget-trigger-btn');
    await page.waitForSelector('.heiwa-booking-content', { timeout: 5000 });

    // Step 3: Select booking type and verify collapse
    console.log('Step 3: Testing booking type selection and collapse');
    await page.click('button[data-booking-type="room"]');

    // Wait for auto-advance and check if booking-type section collapses
    await page.waitForTimeout(500); // Wait for collapse animation

    // Check that booking type section is collapsed
    const bookingTypeCollapsed = await page.locator('.heiwa-step-booking-type.heiwa-section-collapsed').isVisible();
    expect(bookingTypeCollapsed).toBe(true);

    // Step 4: Fill dates and guest count
    console.log('Step 4: Filling dates and guest information');

    // Set check-in date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const checkInDate = tomorrow.toISOString().split('T')[0];

    // Set check-out date (3 days later)
    const checkOut = new Date(tomorrow);
    checkOut.setDate(checkOut.getDate() + 3);
    const checkOutDate = checkOut.toISOString().split('T')[0];

    await page.fill('#check-in', checkInDate);
    await page.fill('#check-out', checkOutDate);

    // Set guest count to 2
    await page.click('button[aria-label="Increase guest count"]');

    // Step 5: Select a room
    console.log('Step 5: Selecting a room');
    await page.waitForSelector('.heiwa-room-card', { timeout: 10000 });

    // Click on the first available room
    await page.click('.heiwa-room-card:first-child');

    // Wait for room selection and check if room selection collapses
    await page.waitForTimeout(800); // Wait for collapse animation

    // Check that room selection section is collapsed
    const roomSelectionCollapsed = await page.locator('.heiwa-step-room-selection.heiwa-section-collapsed').isVisible();
    expect(roomSelectionCollapsed).toBe(true);

    // Step 6: Fill guest details and test auto-collapse
    console.log('Step 6: Testing guest form auto-collapse');

    // Wait for form_addons step
    await page.waitForSelector('.heiwa-step-form_addons', { timeout: 5000 });

    // Fill in guest details
    await page.fill('input[data-participant="0"][data-field="firstName"]', 'John');
    await page.fill('input[data-participant="0"][data-field="lastName"]', 'Doe');
    await page.fill('input[data-participant="0"][data-field="email"]', 'john.doe@example.com');

    await page.fill('input[data-participant="1"][data-field="firstName"]', 'Jane');
    await page.fill('input[data-participant="1"][data-field="lastName"]', 'Smith');
    await page.fill('input[data-participant="1"][data-field="email"]', 'jane.smith@example.com');

    // Wait for auto-collapse
    await page.waitForTimeout(800);

    // Verify guest summary appears
    const guestSummaryVisible = await page.locator('.heiwa-guest-summary').isVisible();
    expect(guestSummaryVisible).toBe(true);

    // Verify guest form is collapsed
    const guestFormsCollapsed = await page.locator('.heiwa-guest-forms.heiwa-guest-forms-collapsed').isVisible();
    expect(guestFormsCollapsed).toBe(true);

    // Test edit functionality
    console.log('Step 7: Testing guest edit functionality');
    await page.click('.heiwa-edit-guest-btn');

    // Verify form expands
    await page.waitForTimeout(500);
    const guestFormsExpanded = await page.locator('.heiwa-guest-forms:not(.heiwa-guest-forms-collapsed)').isVisible();
    expect(guestFormsExpanded).toBe(true);

    // Step 8: Complete booking
    console.log('Step 8: Completing booking');
    await page.click('button[data-action="confirm-booking"]');

    // Wait for confirmation
    await page.waitForSelector('.heiwa-booking-confirmation', { timeout: 10000 });

    // Step 9: Verify no console errors throughout the process
    console.log('Step 9: Verifying no console errors');
    expect(consoleErrors.length).toBe(0);

    // Step 10: Test back navigation and collapse expansion
    console.log('Step 10: Testing back navigation');
    await page.click('button[data-action="heiwa-back"]');

    // Verify sections expand when navigating back
    await page.waitForTimeout(500);

    // Check that guest form is visible again
    const guestFormVisibleAgain = await page.locator('.heiwa-guest-forms:not(.heiwa-guest-forms-collapsed)').isVisible();
    expect(guestFormVisibleAgain).toBe(true);

    console.log('✅ Complete E2E test passed - no errors, collapse functionality working perfectly');
  });

  test('Console error monitoring', async ({ page }) => {
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
      }
    });

    // Navigate and interact with widget
    await page.goto('/widget-test-wp');
    await page.waitForLoadState('networkidle');

    await page.click('.widget-trigger-btn');
    await page.waitForSelector('.heiwa-booking-content', { timeout: 5000 });

    // Select room booking
    await page.click('button[data-booking-type="room"]');
    await page.waitForTimeout(1000);

    // Fill basic info
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const checkInDate = tomorrow.toISOString().split('T')[0];

    await page.fill('#check-in', checkInDate);
    await page.fill('#check-out', checkInDate);

    // Wait and check for errors
    await page.waitForTimeout(2000);

    // Log any errors found
    if (consoleErrors.length > 0) {
      console.log('Console Errors Found:', consoleErrors);
    }
    if (consoleWarnings.length > 0) {
      console.log('Console Warnings Found:', consoleWarnings);
    }

    // We expect no critical errors (warnings are acceptable)
    const criticalErrors = consoleErrors.filter(error =>
      !error.includes('Download the React DevTools') &&
      !error.includes('ReactDOMTestUtils') &&
      !error.includes('Warning:')
    );

    expect(criticalErrors.length).toBe(0);
  });
});
