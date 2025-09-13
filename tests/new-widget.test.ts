import { test, expect } from '@playwright/test';

test.describe('New Booking Widget', () => {
  test('should display and open new widget correctly', async ({ page }) => {
    // Navigate to new widget page
    await page.goto('http://localhost:3005/widget-new');
    await page.waitForLoadState('networkidle');

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

    // Verify progress indicator
    await expect(page.locator('text=Experience')).toBeVisible();
    await expect(page.locator('text=Dates')).toBeVisible();

    // Test experience selection
    const roomOption = page.locator('button:has-text("Book a Room")');
    await expect(roomOption).toBeVisible();
    await roomOption.click();

    // Wait for step transition
    await page.waitForTimeout(1000);

    // Verify moved to dates step
    await expect(page.locator('text=When & How Many?')).toBeVisible();
  });

  test('should handle widget close correctly', async ({ page }) => {
    await page.goto('http://localhost:3005/widget-new');
    await page.waitForLoadState('networkidle');

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
});
