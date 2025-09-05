import { test, expect } from '@playwright/test'

test.describe('Complete Booking Flow', () => {
  test('should complete full booking journey from discovery to payment', async ({ page }) => {
    // Step 1: Navigate to weeks page and verify loading
    await page.goto('/weeks')
    await page.waitForLoadState('networkidle')

    // Wait for weeks to load (mock data takes 1 second)
    await page.waitForTimeout(1500)

    // Verify weeks page loads with content
    await expect(page.locator('h1')).toHaveText('Available Surf Weeks')
    await expect(page.locator('text=Choose your perfect surf adventure')).toBeVisible()

    // Verify weeks are displayed
    const weekCards = page.locator('[class*="hover:shadow-lg"]')
    await expect(weekCards.first()).toBeVisible()

    // Find and click on the first available week
    const firstWeekCard = weekCards.first()
    const viewDetailsButton = firstWeekCard.locator('text=View Details & Book')
    await expect(viewDetailsButton).toBeVisible()

    // Get the week ID from the link href
    const linkElement = firstWeekCard.locator('a[href*="weeks/"]').first()
    const href = await linkElement.getAttribute('href')
    const weekId = href?.split('/').pop()

    await viewDetailsButton.click()

    // Step 2: Verify week detail page loads
    await page.waitForURL(`/weeks/${weekId}`)
    await expect(page.locator('h1')).toBeVisible()

    // Verify week details are displayed
    await expect(page.locator('text=About This Week')).toBeVisible()
    await expect(page.locator('text=What\'s Included')).toBeVisible()
    await expect(page.locator('text=Week Highlights')).toBeVisible()

    // Verify room availability is shown
    await expect(page.locator('text=Room Availability')).toBeVisible()

    // Click book this week button
    const bookButton = page.locator('text=Book This Week')
    await expect(bookButton).toBeVisible()
    await bookButton.click()

    // Step 3: Verify checkout page loads with booking wizard
    await page.waitForURL(`/checkout/${weekId}`)
    await expect(page.locator('[data-testid="checkout-title"]')).toHaveText('Complete Your Booking')
    await expect(page.locator('text=Follow the steps below')).toBeVisible()

    // Verify booking wizard is present
    await expect(page.locator('[data-testid="participants-step"]')).toBeVisible()

    // Step 4: Complete participants step
    // Add first participant
    const addParticipantButton = page.locator('text=Add Another Participant')
    await expect(addParticipantButton).toBeVisible()

    // Fill in first participant details
    const firstNameInput = page.locator('input[placeholder*="First Name"]').first()
    const lastNameInput = page.locator('input[placeholder*="Last Name"]').first()
    const emailInput = page.locator('input[type="email"]').first()
    const phoneInput = page.locator('input[type="tel"]').first()
    const dobInput = page.locator('input[type="date"]').first()

    await firstNameInput.fill('John')
    await lastNameInput.fill('Doe')
    await emailInput.fill('john.doe@example.com')
    await phoneInput.fill('+1234567890')
    await dobInput.fill('1990-01-01')

    // Add second participant
    await addParticipantButton.click()

    // Fill in second participant details
    const secondFirstNameInput = page.locator('input[placeholder*="First Name"]').nth(1)
    const secondLastNameInput = page.locator('input[placeholder*="Last Name"]').nth(1)
    const secondEmailInput = page.locator('input[type="email"]').nth(1)
    const secondPhoneInput = page.locator('input[type="tel"]').nth(1)
    const secondDobInput = page.locator('input[type="date"]').nth(1)

    await secondFirstNameInput.fill('Jane')
    await secondLastNameInput.fill('Smith')
    await secondEmailInput.fill('jane.smith@example.com')
    await secondPhoneInput.fill('+1234567891')
    await secondDobInput.fill('1992-02-02')

    // Click Next to proceed to rooms step
    const nextButton = page.locator('button', { hasText: 'Next' })
    await expect(nextButton).toBeEnabled()
    await nextButton.click()

    // Step 5: Complete rooms step (mock room selection)
    await expect(page.locator('text=Choose Your Accommodation')).toBeVisible()

    // Since room selection is mocked, we'll simulate proceeding
    await nextButton.click()

    // Step 6: Complete add-ons step
    await expect(page.locator('text=Enhance Your Experience')).toBeVisible()

    // Select some add-ons (increase quantities)
    const plusButtons = page.locator('button').filter({ hasText: '+' })
    if (await plusButtons.count() > 0) {
      await plusButtons.first().click()
    }

    // Click Next to proceed to summary
    await nextButton.click()

    // Step 7: Verify summary step and complete booking
    await expect(page.locator('text=Booking Summary')).toBeVisible()
    await expect(page.locator('text=Review your booking details')).toBeVisible()

    // Verify participants are listed
    await expect(page.locator('text=John Doe')).toBeVisible()
    await expect(page.locator('text=Jane Smith')).toBeVisible()

    // Click Complete Booking
    const completeButton = page.locator('button', { hasText: 'Complete Booking' })
    await expect(completeButton).toBeEnabled()
    await completeButton.click()

    // Step 8: Verify payment page loads
    await page.waitForURL(`/checkout/${weekId}/payment`)
    await expect(page.locator('[data-testid="payment-title"]')).toHaveText('Complete Your Payment')
    await expect(page.locator('text=Secure payment')).toBeVisible()

    // Verify order summary is displayed
    await expect(page.locator('[data-testid="order-summary"]')).toBeVisible()
    await expect(page.locator('text=Total:')).toBeVisible()

    // Step 9: Complete payment (mock)
    // Select card payment method
    const cardButton = page.locator('[data-testid="card-payment-method"]')
    await cardButton.click()

    // Fill in card details
    const cardNameInput = page.locator('[data-testid="card-name-input"]')
    const cardNumberInput = page.locator('[data-testid="card-number-input"]')
    const expiryInput = page.locator('[data-testid="card-expiry-input"]')
    const cvcInput = page.locator('[data-testid="card-cvc-input"]')

    await cardNameInput.fill('John Doe')
    await cardNumberInput.fill('4111 1111 1111 1111')
    await expiryInput.fill('12/25')
    await cvcInput.fill('123')

    // Click pay button
    const payButton = page.locator('[data-testid="pay-button"]')
    await expect(payButton).toBeEnabled()
    await payButton.click()

    // Step 10: Verify booking success
    await page.waitForURL('/booking/success*')
    await expect(page.locator('text=Booking Confirmed')).toBeVisible()
    await expect(page.locator('text=Your booking has been successfully created')).toBeVisible()
  })

  test('should handle booking cancellation gracefully', async ({ page }) => {
    // Navigate to checkout
    await page.goto('/weeks')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Click on first available week
    const firstWeekCard = page.locator('[class*="hover:shadow-lg"]').first()
    const viewDetailsButton = firstWeekCard.locator('text=View Details & Book')
    await viewDetailsButton.click()

    // Get week ID and navigate to checkout
    const linkElement = firstWeekCard.locator('a[href*="weeks/"]').first()
    const href = await linkElement.getAttribute('href')
    const weekId = href?.split('/').pop()

    const bookButton = page.locator('text=Book This Week')
    await bookButton.click()

    // Click cancel on booking wizard
    const cancelButton = page.locator('button', { hasText: 'Cancel' })
    await cancelButton.click()

    // Verify navigation back to week details
    await page.waitForURL(`/weeks/${weekId}`)
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should validate required participant information', async ({ page }) => {
    // Navigate to checkout
    await page.goto('/weeks')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    const firstWeekCard = page.locator('[class*="hover:shadow-lg"]').first()
    const viewDetailsButton = firstWeekCard.locator('text=View Details & Book')
    await viewDetailsButton.click()

    const bookButton = page.locator('text=Book This Week')
    await bookButton.click()

    // Try to proceed without filling required fields
    const nextButton = page.locator('button', { hasText: 'Next' })
    await expect(nextButton).toBeDisabled()

    // Fill in some fields but not all required ones
    const firstNameInput = page.locator('input[placeholder*="First Name"]').first()
    await firstNameInput.fill('John')

    // Next should still be disabled
    await expect(nextButton).toBeDisabled()

    // Fill in all required fields
    const lastNameInput = page.locator('input[placeholder*="Last Name"]').first()
    const emailInput = page.locator('input[type="email"]').first()
    const phoneInput = page.locator('input[type="tel"]').first()
    const dobInput = page.locator('input[type="date"]').first()

    await lastNameInput.fill('Doe')
    await emailInput.fill('john.doe@example.com')
    await phoneInput.fill('+1234567890')
    await dobInput.fill('1990-01-01')

    // Now next should be enabled
    await expect(nextButton).toBeEnabled()
  })

  test('should handle sold out weeks appropriately', async ({ page }) => {
    // This test would require mocking a sold out week
    // For now, we'll just verify the UI handles disabled states
    await page.goto('/weeks')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // If there were sold out weeks, the buttons would show "Sold Out" and be disabled
    const soldOutButtons = page.locator('text=Sold Out')
    if (await soldOutButtons.count() > 0) {
      await expect(soldOutButtons.first()).toBeDisabled()
    }
  })
})
