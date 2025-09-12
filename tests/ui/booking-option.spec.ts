import { test, expect } from "@playwright/test";

test("booking option cards meet tap size & layout", async ({ page }) => {
  await page.goto("http://localhost:3005/widget-demo");
  
  // Click the specific BOOK NOW trigger button
  await page.locator("#heiwa-trigger-btn").click();
  
  // Wait for the drawer to open and booking options to appear
  await page.waitForSelector(".heiwa-booking-option-card", { timeout: 5000 });

  const cards = page.locator(".heiwa-booking-option-card");
  await expect(cards).toHaveCountGreaterThan(0);

  const count = await cards.count();
  for (let i = 0; i < count; i++) {
    const box = await cards.nth(i).boundingBox();
    expect(box?.height || 0).toBeGreaterThanOrEqual(44);
  }

  // Test that we can see the booking summary section
  await expect(page.locator(".heiwa-booking-summary")).toBeVisible();
});
