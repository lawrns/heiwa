import { test, expect } from '@playwright/test'

test.describe('Booking Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should handle credit card payment flow', async ({ page }) => {
    // Navigate to payment step
    await page.click('[data-testid="booking-widget-trigger"]')
    await page.click('[data-testid="surf-week-option"]')
    await page.click('[data-testid="next-step"]')
    
    // Select available dates
    const availableDates = await page.locator('[data-testid="available-date"]').count()
    if (availableDates === 0) {
      test.skip(true, 'No available dates found')
      return
    }
    await page.locator('[data-testid="available-date"]').first().click()
    await page.click('[data-testid="confirm-dates"]')
    
    // Select room
    const rooms = await page.locator('[data-testid="room-card"]').count()
    if (rooms === 0) {
      test.skip(true, 'No rooms available')
      return
    }
    await page.locator('[data-testid="room-card"]').first().click()
    await page.click('[data-testid="next-step"]')
    
    // Skip add-ons
    await page.click('[data-testid="next-step"]')
    
    // Fill guest details
    await page.fill('[data-testid="first-name"]', 'Payment')
    await page.fill('[data-testid="last-name"]', 'Test')
    await page.fill('[data-testid="email"]', 'payment@example.com')
    await page.fill('[data-testid="phone"]', '+351912345679')
    await page.click('[data-testid="next-step"]')
    
    // Wait for review step
    await page.waitForSelector('[data-testid="review-and-pay"]')
    
    // Select credit card payment
    await page.click('[data-testid="payment-method-card"]')
    
    // Fill payment details (test card)
    await page.fill('[data-testid="card-number"]', '4242424242424242')
    await page.fill('[data-testid="card-expiry"]', '12/25')
    await page.fill('[data-testid="card-cvc"]', '123')
    await page.fill('[data-testid="card-name"]', 'Payment Test')
    
    // Accept terms
    await page.click('[data-testid="accept-terms"]')
    
    // Submit payment
    await page.click('[data-testid="submit-payment"]')
    
    // Verify payment processing
    await expect(page.locator('[data-testid="payment-processing"]')).toBeVisible()
    
    // Wait for success
    await page.waitForSelector('[data-testid="payment-success"]', { timeout: 15000 })
    await expect(page.locator('[data-testid="booking-confirmation"]')).toBeVisible()
  })

  test('should handle bank wire payment flow', async ({ page }) => {
    // Navigate to payment step (same as above but faster)
    await page.click('[data-testid="booking-widget-trigger"]')
    await page.click('[data-testid="surf-week-option"]')
    await page.click('[data-testid="next-step"]')
    
    // Use mock data for faster testing
    await page.evaluate(() => {
      // Mock available dates
      const datePicker = document.querySelector('[data-testid="date-picker"]') as HTMLElement
      if (datePicker) datePicker.click()
      
      // Select first available date
      const availableDate = document.querySelector('[data-testid="available-date"]') as HTMLElement
      if (availableDate) availableDate.click()
      
      // Confirm dates
      const confirmDates = document.querySelector('[data-testid="confirm-dates"]') as HTMLElement
      if (confirmDates) confirmDates.click()
    })
    
    await page.waitForTimeout(1000)
    
    // Select room
    const rooms = await page.locator('[data-testid="room-card"]').count()
    if (rooms > 0) {
      await page.locator('[data-testid="room-card"]').first().click()
      await page.click('[data-testid="next-step"]')
    }
    
    // Skip add-ons
    await page.click('[data-testid="next-step"]')
    
    // Fill guest details
    await page.fill('[data-testid="first-name"]', 'Bank')
    await page.fill('[data-testid="last-name"]', 'Wire')
    await page.fill('[data-testid="email"]', 'bankwire@example.com')
    await page.fill('[data-testid="phone"]', '+351912345680')
    await page.click('[data-testid="next-step"]')
    
    // Wait for review step
    await page.waitForSelector('[data-testid="review-and-pay"]')
    
    // Select bank wire payment
    await page.click('[data-testid="payment-method-bank-wire"]')
    
    // Verify bank wire instructions appear
    await expect(page.locator('[data-testid="bank-wire-instructions"]')).toBeVisible()
    await expect(page.locator('[data-testid="bank-details"]')).toBeVisible()
    await expect(page.locator('[data-testid="reference-number"]')).toBeVisible()
    
    // Accept terms
    await page.click('[data-testid="accept-terms"]')
    
    // Submit booking
    await page.click('[data-testid="submit-booking"]')
    
    // Verify booking created with pending payment
    await page.waitForSelector('[data-testid="booking-pending-payment"]', { timeout: 10000 })
    await expect(page.locator('[data-testid="payment-instructions"]')).toBeVisible()
  })

  test('should handle payment errors gracefully', async ({ page }) => {
    // Navigate to payment step
    await page.click('[data-testid="booking-widget-trigger"]')
    await page.click('[data-testid="surf-week-option"]')
    await page.click('[data-testid="next-step"]')
    
    // Mock quick navigation to payment
    await page.evaluate(() => {
      // Skip to payment step for testing
      const steps = ['experience-selection', 'date-selection', 'room-selection', 'add-ons-selection', 'guest-details']
      steps.forEach(step => {
        const element = document.querySelector(`[data-testid="${step}"]`)
        if (element) {
          const nextButton = document.querySelector('[data-testid="next-step"]') as HTMLElement
          if (nextButton) nextButton.click()
        }
      })
    })
    
    await page.waitForSelector('[data-testid="review-and-pay"]')
    
    // Select credit card payment
    await page.click('[data-testid="payment-method-card"]')
    
    // Fill invalid card details
    await page.fill('[data-testid="card-number"]', '4000000000000002') // Declined card
    await page.fill('[data-testid="card-expiry"]', '12/25')
    await page.fill('[data-testid="card-cvc"]', '123')
    await page.fill('[data-testid="card-name"]', 'Error Test')
    
    // Accept terms
    await page.click('[data-testid="accept-terms"]')
    
    // Submit payment
    await page.click('[data-testid="submit-payment"]')
    
    // Verify error handling
    await expect(page.locator('[data-testid="payment-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('payment declined')
    
    // Verify retry option
    await expect(page.locator('[data-testid="retry-payment"]')).toBeVisible()
  })

  test('should validate payment form fields', async ({ page }) => {
    // Navigate to payment step
    await page.click('[data-testid="booking-widget-trigger"]')
    await page.click('[data-testid="surf-week-option"]')
    await page.click('[data-testid="next-step"]')
    
    // Quick navigation to payment
    await page.evaluate(() => {
      for (let i = 0; i < 5; i++) {
        const nextButton = document.querySelector('[data-testid="next-step"]') as HTMLElement
        if (nextButton) nextButton.click()
      }
    })
    
    await page.waitForSelector('[data-testid="review-and-pay"]')
    await page.click('[data-testid="payment-method-card"]')
    
    // Try to submit without filling card details
    await page.click('[data-testid="submit-payment"]')
    
    // Verify validation errors
    await expect(page.locator('[data-testid="card-number-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="card-expiry-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="card-cvc-error"]')).toBeVisible()
    
    // Fill invalid card number
    await page.fill('[data-testid="card-number"]', '123')
    await page.click('[data-testid="submit-payment"]')
    
    await expect(page.locator('[data-testid="card-number-error"]')).toContainText('invalid')
    
    // Fill valid card number but invalid expiry
    await page.fill('[data-testid="card-number"]', '4242424242424242')
    await page.fill('[data-testid="card-expiry"]', '12/20') // Past date
    await page.click('[data-testid="submit-payment"]')
    
    await expect(page.locator('[data-testid="card-expiry-error"]')).toContainText('expired')
  })

  test('should show payment security badges', async ({ page }) => {
    // Navigate to payment step
    await page.click('[data-testid="booking-widget-trigger"]')
    await page.click('[data-testid="surf-week-option"]')
    await page.click('[data-testid="next-step"]')
    
    // Quick navigation to payment
    await page.evaluate(() => {
      for (let i = 0; i < 5; i++) {
        const nextButton = document.querySelector('[data-testid="next-step"]') as HTMLElement
        if (nextButton) nextButton.click()
      }
    })
    
    await page.waitForSelector('[data-testid="review-and-pay"]')
    
    // Verify security badges are visible
    await expect(page.locator('[data-testid="ssl-badge"]')).toBeVisible()
    await expect(page.locator('[data-testid="pci-badge"]')).toBeVisible()
    await expect(page.locator('[data-testid="secure-payment-text"]')).toBeVisible()
  })
})
