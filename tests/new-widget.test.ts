import { test, expect } from '@playwright/test';

test.describe('New Booking Widget - Complete Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3005/widget-new');
    await page.waitForLoadState('networkidle');
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
    await page.waitForTimeout(1000);

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
    await page.waitForTimeout(1000);

    // Step 1: Select room experience
    const roomOption = page.locator('button:has-text("Book a Room")');
    await expect(roomOption).toBeVisible();
    await roomOption.click();
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
    await page.waitForTimeout(1000);

    // Step 3: Select room option
    await expect(page.locator('text=Choose Your Room')).toBeVisible();
    
    // Wait for options to load
    await page.waitForTimeout(2000);
    
    // Select first room option - use more specific selector
    const roomCard = page.locator('button').filter({ hasText: 'Room Nr 1' }).first();
    await expect(roomCard).toBeVisible();
    await roomCard.click();
    
    // Click Next
    await nextBtn.click();
    await page.waitForTimeout(1000);

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
    await page.waitForTimeout(500);
    
    // Click Next
    await nextBtn.click();
    await page.waitForTimeout(1000);

    // Step 5: Review and Pay
    await expect(page.locator('text=Review & Pay')).toBeVisible();
    await expect(page.locator('text=Booking Summary')).toBeVisible();
    await expect(page.locator('text=Pricing Breakdown')).toBeVisible();
    
    // Verify pricing is displayed
    await expect(page.locator('text=€')).toBeVisible();
  });

  test('should complete surf week booking flow', async ({ page }) => {
    // Open widget
    const bookBtn = page.locator('button:has-text("Book Now")');
    await bookBtn.click();
    await page.waitForTimeout(1000);

    // Step 1: Select surf week experience
    const surfWeekOption = page.locator('button:has-text("All-Inclusive Surf Week")');
    await expect(surfWeekOption).toBeVisible();
    await surfWeekOption.click();
    await page.waitForTimeout(1000);

    // Step 2: Select dates and guests
    await expect(page.locator('text=When & How Many?')).toBeVisible();
    
    // Set start date
    const startDateInput = page.locator('input[type="date"]').first();
    await startDateInput.fill('2024-04-15');
    
    // Set end date
    const endDateInput = page.locator('input[type="date"]').nth(1);
    await endDateInput.fill('2024-04-22');
    
    // Set guests to 2 - use more specific selector
    const increaseGuests = page.locator('button[aria-label="Increase guest count"]');
    await increaseGuests.click();
    
    // Click Next
    const nextBtn = page.locator('button').filter({ hasText: 'Next' }).and(page.locator('[class*="px-6 py-3"]'));
    await nextBtn.click();
    await page.waitForTimeout(1000);

    // Step 3: Select surf week option
    await expect(page.locator('text=Choose Your Surf Week')).toBeVisible();
    
    // Wait for options to load
    await page.waitForTimeout(2000);
    
    // Select first surf week option - use more specific selector
    const surfWeekCard = page.locator('button').filter({ hasText: 'Beginner Surf Week' }).first();
    await expect(surfWeekCard).toBeVisible();
    await surfWeekCard.click();
    
    // Click Next
    await nextBtn.click();
    await page.waitForTimeout(1000);

    // Step 4: Guest details for 2 guests
    await expect(page.locator('h3').filter({ hasText: 'Guest Details' }).first()).toBeVisible();
    await expect(page.locator('text=2 guests')).toBeVisible();
    
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
    await page.waitForTimeout(500);
    
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
    await page.waitForTimeout(500);
    
    // Click Next
    await nextBtn.click();
    await page.waitForTimeout(1000);

    // Step 5: Review and Pay
    await expect(page.locator('text=Review & Pay')).toBeVisible();
    await expect(page.locator('text=Surf Week Package')).toBeVisible();
    await expect(page.locator('text=2 guests')).toBeVisible();
  });

  test('should handle widget close correctly', async ({ page }) => {
    // Open widget
    const bookBtn = page.locator('button:has-text("Book Now")');
    await bookBtn.click();
    await page.waitForTimeout(500);

    // Verify widget is open
    await expect(page.locator('text=Book Your Surf Adventure')).toBeVisible();

    // Close widget with X button
    const closeBtn = page.locator('button[aria-label="Close booking widget"]');
    await closeBtn.click();
    await page.waitForTimeout(500);

    // Verify widget is closed
    await expect(page.locator('text=Book Your Surf Adventure')).not.toBeVisible();
  });

  test('should handle form validation correctly', async ({ page }) => {
    // Open widget and go to guest details step
    const bookBtn = page.locator('button:has-text("Book Now")');
    await bookBtn.click();
    await page.waitForTimeout(1000);

    // Select room experience
    const roomOption = page.locator('button:has-text("Book a Room")');
    await roomOption.click();
    await page.waitForTimeout(1000);

    // Set dates
    const checkInInput = page.locator('input[type="date"]').first();
    await checkInInput.fill('2024-03-15');
    const checkOutInput = page.locator('input[type="date"]').nth(1);
    await checkOutInput.fill('2024-03-18');
    
    // Go to next step
    const nextBtn = page.locator('button').filter({ hasText: 'Next' }).and(page.locator('[class*="px-6 py-3"]'));
    await nextBtn.click();
    await page.waitForTimeout(1000);

    // Select room
    await page.waitForTimeout(2000);
    const roomCard = page.locator('button').filter({ hasText: 'Room Nr 1' }).first();
    await roomCard.click();
    await nextBtn.click();
    await page.waitForTimeout(1000);

    // Try to save guest without filling required fields
    const saveBtn = page.locator('button:has-text("Save Guest 1")');
    await saveBtn.click();
    await page.waitForTimeout(500);

    // Verify validation error appears - check for any validation error
    await expect(page.locator('.bg-red-50').first()).toBeVisible();
    await expect(page.locator('text=required')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Open widget
    const bookBtn = page.locator('button:has-text("Book Now")');
    await expect(bookBtn).toBeVisible();
    await bookBtn.click();
    await page.waitForTimeout(1000);

    // Verify widget opens and is responsive
    await expect(page.locator('text=Book Your Surf Adventure')).toBeVisible();
    
    // Check that the drawer is properly sized for mobile
    const drawer = page.locator('.animate-in.slide-in-from-right');
    await expect(drawer).toBeVisible();
  });
});
