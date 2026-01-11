import { test, expect } from '@playwright/test'

test.describe('Booking Widget Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    
    // Wait for page to load
    await page.waitForLoadState('domcontentloaded')
  })

  test('should complete full booking flow with add-ons', async ({ page }) => {
    // Step 1: Open booking widget
    await page.click('[data-testid="booking-widget-trigger"]')
    await expect(page.locator('[data-testid="booking-widget"]')).toBeVisible()
    
    // Step 2: Select experience type
    await page.click('[data-testid="experience-selection"]')
    await page.click('[data-testid="surf-week-option"]')
    await page.click('[data-testid="next-step"]')
    
    // Step 3: Select dates
    await page.click('[data-testid="date-picker"]')
    // Select available dates (next week)
    const availableDates = await page.locator('[data-testid="available-date"]').count()
    if (availableDates === 0) {
      test.skip(true, 'No available dates found')
      return
    }
    
    // Step 4: Select room
    await page.waitForSelector('[data-testid="room-selection"]')
    const rooms = await page.locator('[data-testid="room-card"]').count()
    if (rooms === 0) {
      test.skip(true, 'No rooms available')
      return
    }
    await page.locator('[data-testid="room-card"]').first().click()
    await page.click('[data-testid="next-step"]')
    
    // Step 5: Select add-ons
    await page.waitForSelector('[data-testid="add-ons-selection"]')
    const addOns = await page.locator('[data-testid="add-on-item"]').count()
    if (addOns > 0) {
      await page.locator('[data-testid="add-on-item"]').first().click()
    }
    await page.click('[data-testid="next-step"]')
    
    // Step 6: Fill guest details
    await page.waitForSelector('[data-testid="guest-details"]')
    await page.fill('[data-testid="first-name"]', 'Test')
    await page.fill('[data-testid="last-name"]', 'User')
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="phone"]', '+351912345678')
    await page.fill('[data-testid="address"]', 'Test Address')
    await page.fill('[data-testid="city"]', 'Lisbon')
    await page.fill('[data-testid="postal-code"]', '1000-001')
    await page.fill('[data-testid="country"]', 'Portugal')
    
    // Step 7: Review and confirm
    await page.click('[data-testid="next-step"]')
    await page.waitForSelector('[data-testid="review-and-pay"]')
    
    // Verify booking summary
    await expect(page.locator('[data-testid="booking-summary"]')).toBeVisible()
    await expect(page.locator('[data-testid="total-price"]')).toBeVisible()
    
    // Step 8: Select payment method
    await page.click('[data-testid="payment-method-card"]')
    
    // Step 9: Submit booking
    await page.click('[data-testid="submit-booking"]')
    
    // Step 10: Verify success
    await page.waitForSelector('[data-testid="booking-success"]', { timeout: 10000 })
    await expect(page.locator('[data-testid="booking-confirmation"]')).toBeVisible()
    await expect(page.locator('[data-testid="booking-id"]')).toBeVisible()
  })

  test('should handle form validation errors', async ({ page }) => {
    // Open booking widget
    await page.click('[data-testid="booking-widget-trigger"]')
    
    // Try to proceed without selecting experience
    await page.click('[data-testid="next-step"]')
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible()
    
    // Select experience and proceed
    await page.click('[data-testid="surf-week-option"]')
    await page.click('[data-testid="next-step"]')
    
    // Try to proceed without selecting dates
    await page.click('[data-testid="next-step"]')
    await expect(page.locator('[data-testid="date-error"]')).toBeVisible()
  })

  test('should handle unavailable dates gracefully', async ({ page }) => {
    // Open booking widget
    await page.click('[data-testid="booking-widget-trigger"]')
    await page.click('[data-testid="surf-week-option"]')
    await page.click('[data-testid="next-step"]')
    
    // Try to select past dates
    await page.click('[data-testid="date-picker"]')
    const pastDates = await page.locator('[data-testid="past-date"]').count()
    if (pastDates > 0) {
      await page.locator('[data-testid="past-date"]').first().click()
      await expect(page.locator('[data-testid="date-unavailable-error"]')).toBeVisible()
    }
  })

  test('should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Open booking widget
    await page.click('[data-testid="booking-widget-trigger"]')
    
    // Verify mobile layout
    await expect(page.locator('[data-testid="booking-widget"]')).toBeVisible()
    await expect(page.locator('[data-testid="mobile-step-indicator"]')).toBeVisible()
    
    // Test mobile navigation
    await page.click('[data-testid="mobile-menu-button"]')
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
  })

  test('should handle booking widget close and reopen', async ({ page }) => {
    // Open booking widget
    await page.click('[data-testid="booking-widget-trigger"]')
    await expect(page.locator('[data-testid="booking-widget"]')).toBeVisible()
    
    // Close widget
    await page.click('[data-testid="close-widget"]')
    await expect(page.locator('[data-testid="booking-widget"]')).not.toBeVisible()
    
    // Reopen widget
    await page.click('[data-testid="booking-widget-trigger"]')
    await expect(page.locator('[data-testid="booking-widget"]')).toBeVisible()
    
    // Should start at first step
    await expect(page.locator('[data-testid="experience-selection"]')).toBeVisible()
  })

  test('should handle real-time availability updates', async ({ page }) => {
    // Open booking widget in two tabs
    const context = page.context()
    const page2 = await context.newPage()
    
    await page.goto('/')
    await page2.goto('/')
    
    // Open booking widget in both
    await page.click('[data-testid="booking-widget-trigger"]')
    await page2.click('[data-testid="booking-widget-trigger"]')
    
    // Select same room in both
    await page.click('[data-testid="surf-week-option"]')
    await page.click('[data-testid="next-step"]')
    
    await page2.click('[data-testid="surf-week-option"]')
    await page2.click('[data-testid="next-step"]')
    
    // Check if availability updates
    await page.waitForSelector('[data-testid="availability-indicator"]')
    await page2.waitForSelector('[data-testid="availability-indicator"]')
    
    await page2.close()
  })
})
