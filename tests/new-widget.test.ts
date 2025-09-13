import { test, expect } from '@playwright/test';

test.describe('New Booking Widget - Complete Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3005/widget-new', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000); // Give components time to render and API calls to complete
  });

  test('should display and open new widget correctly', async ({ page }) => {
    // Verify page loads with hero content
    await expect(page.locator('h1')).toContainText('Experience the Ultimate');
    await expect(page.locator('h1')).toContainText('Surf Adventure');

    // Verify Book Now button is visible
    const bookBtn = page.locator('button:has-text("Book Now")');
    await expect(bookBtn).toBeVisible();

    // Click Book Now button
    await bookBtn.click();
    await page.waitForTimeout(1500);

    // Verify widget drawer opens
    await expect(page.locator('text=Book Your Surf Adventure')).toBeVisible();
    await expect(page.locator('text=Choose Your Adventure')).toBeVisible();

    // Verify progress indicator - use more specific selectors
    await expect(page.locator('.heiwa-booking-stepper')).toBeVisible();
    await expect(page.locator('div').filter({ hasText: 'Experience' }).first()).toBeVisible();
    await expect(page.locator('div').filter({ hasText: 'Dates' }).first()).toBeVisible();
  });

  test('should complete full room booking flow', async ({ page }) => {
    // Open widget
    const bookBtn = page.locator('button:has-text("Book Now")');
    await bookBtn.click();
    await page.waitForTimeout(1500);

    // Step 1: Select room experience
    const roomOption = page.locator('button:has-text("Book a Room")');
    await expect(roomOption).toBeVisible();
    await roomOption.click({ force: true });
    await page.waitForTimeout(1000);

    // Step 2: Select dates and guests
    await expect(page.locator('text=When & How Many?')).toBeVisible();

    // Set check-in date
    const checkInInput = page.locator('input[type="date"]').first();
    await checkInInput.fill('2024-03-15');

    // Set check-out date
    const checkOutInput = page.locator('input[type="date"]').nth(1);
    await checkOutInput.fill('2024-03-18');

    // Verify dates are set - use more specific selector
    await expect(page.locator('span').filter({ hasText: '3 nights' }).first()).toBeVisible();

    // Click Next
    const nextBtn = page.locator('button').filter({ hasText: 'Next' }).and(page.locator('[class*="px-6 py-3"]'));
    await nextBtn.click();
    await page.waitForTimeout(1500);

    // Step 3: Select room option
    await expect(page.locator('text=Choose Your Room')).toBeVisible();

    // Wait for API data to load and rooms to be displayed
    await page.waitForTimeout(3000);

    // Select first room option - updated to use actual API room names
    const roomCard = page.locator('button').filter({ hasText: 'Room Nr 1' }).first();
    await expect(roomCard).toBeVisible({ timeout: 10000 });
    await roomCard.click();

    // Click Next
    await nextBtn.click();
    await page.waitForTimeout(1500);

    // Step 4: Guest details - use more specific selector for main heading
    await expect(page.locator('h3').filter({ hasText: 'Guest Details' }).first()).toBeVisible();

    // Fill guest details
    const firstNameInput = page.locator('input[placeholder="Enter first name"]');
    await firstNameInput.fill('John');

    const lastNameInput = page.locator('input[placeholder="Enter last name"]');
    await lastNameInput.fill('Doe');

    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('john.doe@example.com');

    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill('+1234567890');

    // Save guest
    const saveBtn = page.locator('button:has-text("Save Guest 1")');
    await saveBtn.click();
    await page.waitForTimeout(1000);

    // Click Next
    await nextBtn.click();
    await page.waitForTimeout(1500);

    // Step 5: Review and Pay
    await expect(page.locator('[data-testid="review-pay-title"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="booking-summary-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="pricing-breakdown-title"]')).toBeVisible();

    // Verify pricing is displayed
    await expect(page.locator('[data-testid="pricing-breakdown-title"]')).toBeVisible();
  });

  test('should verify occupancy updates in real-time', async ({ page }) => {
    // Clean up any existing test bookings first
    await fetch('http://localhost:3005/api/test/create-booking', { method: 'DELETE' });

    // Get initial surf camps data
    const initialResponse = await fetch('http://localhost:3005/api/wordpress/surf-camps', {
      headers: { 'X-Heiwa-API-Key': 'heiwa_wp_test_key_2024_secure_deployment' }
    });
    const initialData = await initialResponse.json();
    const firstCamp = initialData.data?.surf_camps?.[0];

    if (!firstCamp) {
      throw new Error('No surf camps available for testing');
    }

    const initialBooked = firstCamp.details?.confirmed_booked || 0;
    const initialAvailable = firstCamp.details?.available_spots || firstCamp.details?.max_participants || 0;

    // Create a test booking
    const bookingResponse = await fetch('http://localhost:3005/api/test/create-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        surfCampId: firstCamp.id,
        participants: 2,
        clientEmail: 'test-occupancy@example.com'
      })
    });
    const bookingResult = await bookingResponse.json();
    expect(bookingResult.success).toBe(true);

    // Verify occupancy changed
    const updatedResponse = await fetch('http://localhost:3005/api/wordpress/surf-camps', {
      headers: { 'X-Heiwa-API-Key': 'heiwa_wp_test_key_2024_secure_deployment' }
    });
    const updatedData = await updatedResponse.json();
    const updatedCamp = updatedData.data?.surf_camps?.find((c: any) => c.id === firstCamp.id);

    expect(updatedCamp).toBeDefined();
    expect(updatedCamp.details.confirmed_booked).toBeGreaterThan(initialBooked);
    expect(updatedCamp.details.available_spots).toBeLessThan(initialAvailable);

    // Clean up test booking
    await fetch('http://localhost:3005/api/test/create-booking', { method: 'DELETE' });
  });

  test('should test surf week selection step 2', async ({ page }) => {
    // Open widget
    const bookBtn = page.locator('button:has-text("Book Now")');
    await bookBtn.click();
    await page.waitForTimeout(1500);

    // Step 1: Select surf week experience
    const surfWeekOption = page.locator('button:has-text("All-Inclusive Surf Week")');
    await expect(surfWeekOption).toBeVisible();
    await surfWeekOption.click({ force: true });
    await page.waitForTimeout(1000);

    // Step 2: Should show surf week selection instead of date pickers
    await expect(page.locator('text=When & How Many?')).toBeVisible();
    await expect(page.locator('h4:has-text("Choose Your Surf Week")')).toBeVisible();

    // Wait for surf weeks to load
    await page.waitForTimeout(3000);

    // Check if surf week options are displayed
    const surfWeekOptions = page.locator('[data-testid="surf-week-option"]');
    await expect(surfWeekOptions.first()).toBeVisible({ timeout: 10000 });

    // Take a screenshot for debugging
    await page.screenshot({ path: 'surf-week-step2.png' });
  });

  test('should complete surf week booking flow', async ({ page }) => {
    // Open widget
    const bookBtn = page.locator('button:has-text("Book Now")');
    await bookBtn.click();
    await page.waitForTimeout(1500);

    // Step 1: Select surf week experience
    const surfWeekOption = page.locator('button:has-text("All-Inclusive Surf Week")');
    await expect(surfWeekOption).toBeVisible();
    await surfWeekOption.click({ force: true });
    await page.waitForTimeout(1000);

    // Step 2: Select surf week and guests (new flow)
    await expect(page.locator('text=When & How Many?')).toBeVisible();

    // Wait for surf weeks to load
    await page.waitForTimeout(3000);

    // Validate surf week options are displayed
    const surfWeekOptions = page.locator('[data-testid="surf-week-option"]');
    await expect(surfWeekOptions.first()).toBeVisible({ timeout: 10000 });

    // Select first surf week option
    await surfWeekOptions.first().click();
    await page.waitForTimeout(1000);

    // Set guests to 2 - use more specific selector
    const increaseGuests = page.locator('button[aria-label="Increase guest count"]');
    await increaseGuests.click();

    // Click Next
    const nextBtn = page.locator('button').filter({ hasText: 'Next' }).and(page.locator('[class*="px-6 py-3"]'));
    await nextBtn.click();
    await page.waitForTimeout(1500);

    // Step 3: Should show selected surf week details (auto-selected)
    await expect(page.locator('text=Choose Your Surf Week')).toBeVisible();

    // Wait for API data to load and auto-selection
    await page.waitForTimeout(3000);

    // Click Next (surf week should be auto-selected)
    await nextBtn.click();
    await page.waitForTimeout(1500);

    // Step 4: Guest details for 2 guests
    await expect(page.locator('h3').filter({ hasText: 'Guest Details' }).first()).toBeVisible();
    await expect(page.locator('[data-testid="guest-count-instruction"]')).toBeVisible();

    // Fill first guest details
    const firstNameInput = page.locator('input[placeholder="Enter first name"]').first();
    await firstNameInput.fill('John');

    const lastNameInput = page.locator('input[placeholder="Enter last name"]').first();
    await lastNameInput.fill('Doe');

    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill('john.doe@example.com');

    const phoneInput = page.locator('input[type="tel"]').first();
    await phoneInput.fill('+1234567890');

    // Save first guest
    const saveBtn1 = page.locator('button:has-text("Save Guest 1")');
    await saveBtn1.click();
    await page.waitForTimeout(1000);

    // Fill second guest details
    const firstNameInput2 = page.locator('input[placeholder="Enter first name"]').nth(1);
    await firstNameInput2.fill('Jane');

    const lastNameInput2 = page.locator('input[placeholder="Enter last name"]').nth(1);
    await lastNameInput2.fill('Smith');

    const emailInput2 = page.locator('input[type="email"]').nth(1);
    await emailInput2.fill('jane.smith@example.com');

    const phoneInput2 = page.locator('input[type="tel"]').nth(1);
    await phoneInput2.fill('+1234567891');

    // Save second guest
    const saveBtn2 = page.locator('button:has-text("Save Guest 2")');
    await saveBtn2.click();
    await page.waitForTimeout(1000);

    // Click Next
    await nextBtn.click();
    await page.waitForTimeout(1500);

    // Step 5: Review and Pay
    await expect(page.locator('[data-testid="review-pay-title"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Surf Week Package')).toBeVisible();
    await expect(page.locator('[data-testid="guest-completion-status"]')).toBeVisible({ timeout: 10000 });
  });

  test('should handle widget close correctly', async ({ page }) => {
    // Open widget
    const bookBtn = page.locator('button:has-text("Book Now")');
    await bookBtn.click({ force: true });
    await page.waitForTimeout(1500);

    // Verify widget is open
    await expect(page.locator('text=Book Your Surf Adventure')).toBeVisible();

    // Close widget with X button
    const closeBtn = page.locator('button[aria-label="Close booking widget"]');
    await closeBtn.click();
    await page.waitForTimeout(1000);

    // Verify widget is closed
    await expect(page.locator('text=Book Your Surf Adventure')).not.toBeVisible();
  });

  test('should handle form validation correctly', async ({ page }) => {
    // Open widget and go to guest details step
    const bookBtn = page.locator('button:has-text("Book Now")');
    await bookBtn.click();
    await page.waitForTimeout(1500);

    // Select room experience
    const roomOption = page.locator('button:has-text("Book a Room")');
    await roomOption.click({ force: true });
    await page.waitForTimeout(1000);

    // Set dates
    const checkInInput = page.locator('input[type="date"]').first();
    await checkInInput.fill('2024-03-15');
    const checkOutInput = page.locator('input[type="date"]').nth(1);
    await checkOutInput.fill('2024-03-18');

    // Go to next step
    const nextBtn = page.locator('button').filter({ hasText: 'Next' }).and(page.locator('[class*="px-6 py-3"]'));
    await nextBtn.click();
    await page.waitForTimeout(1500);

    // Select room - updated to use actual API room name
    await page.waitForTimeout(2000);
    const roomCard = page.locator('button').filter({ hasText: 'Room Nr 1' }).first();
    await expect(roomCard).toBeVisible({ timeout: 10000 });
    await roomCard.click();
    await nextBtn.click();
    await page.waitForTimeout(1500);

    // Try to save guest without filling required fields
    const saveBtn = page.locator('button:has-text("Save Guest 1")');
    await saveBtn.click();
    await page.waitForTimeout(1000);

    // Verify validation error appears - check for any validation error
    await expect(page.locator('[data-testid="guest-0-error"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="guest-0-error"]')).toContainText('required');
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Open widget
    const bookBtn = page.locator('button:has-text("Book Now")');
    await expect(bookBtn).toBeVisible();
    await bookBtn.click();
    await page.waitForTimeout(1500);

    // Verify widget opens and is responsive
    await expect(page.locator('text=Book Your Surf Adventure')).toBeVisible();

    // Check that the drawer is properly sized for mobile
    const drawer = page.locator('.animate-in.slide-in-from-right');
    await expect(drawer).toBeVisible();
  });
});
