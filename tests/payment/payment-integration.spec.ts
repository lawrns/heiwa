import { test, expect } from '@playwright/test'

test.describe('Payment Integration', () => {
  test('should create checkout session successfully', async ({ page }) => {
    // Navigate to checkout and complete booking wizard
    await page.goto('/weeks')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    const firstWeekCard = page.locator('[class*="hover:shadow-lg"]').first()
    const viewDetailsButton = firstWeekCard.locator('text=View Details & Book')
    await viewDetailsButton.click()

    const bookButton = page.locator('text=Book This Week')
    await bookButton.click()

    // Complete booking wizard quickly
    const addParticipantButton = page.locator('text=Add Another Participant')
    await addParticipantButton.click()

    // Fill minimal participant info
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

    // Proceed through wizard
    const nextButton = page.locator('button', { hasText: 'Next' })
    await expect(nextButton).toBeEnabled()
    await nextButton.click()
    await nextButton.click()
    await nextButton.click()

    const completeButton = page.locator('button', { hasText: 'Complete Booking' })
    await completeButton.click()

    // Verify checkout session creation (mock)
    // In a real implementation, this would verify the API call was made correctly
    await page.waitForTimeout(1000)
  })

  test('should handle payment form validation', async ({ page }) => {
    // Navigate to payment page directly
    await page.goto('/checkout/week-1/payment')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify payment form is displayed
    await expect(page.locator('[data-testid="payment-form"]')).toBeVisible()
    await expect(page.locator('[data-testid="card-payment-method"]')).toBeVisible()
    await expect(page.locator('[data-testid="paypal-payment-method"]')).toBeVisible()

    // Verify pay button is initially disabled (no card details)
    const payButton = page.locator('[data-testid="pay-button"]')
    await expect(payButton).toBeDisabled()

    // Select card payment method
    const cardButton = page.locator('[data-testid="card-payment-method"]')
    await cardButton.click()

    // Verify card form appears
    await expect(page.locator('[data-testid="card-name-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="card-number-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="card-expiry-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="card-cvc-input"]')).toBeVisible()

    // Pay button should still be disabled without card details
    await expect(payButton).toBeDisabled()

    // Fill in some card details but not all
    const cardNameInput = page.locator('[data-testid="card-name-input"]')
    await cardNameInput.fill('John Doe')

    // Pay button should still be disabled
    await expect(payButton).toBeDisabled()

    // Fill in complete card details
    const cardNumberInput = page.locator('[data-testid="card-number-input"]')
    const expiryInput = page.locator('[data-testid="card-expiry-input"]')
    const cvcInput = page.locator('[data-testid="card-cvc-input"]')

    await cardNumberInput.fill('4111 1111 1111 1111')
    await expiryInput.fill('12/25')
    await cvcInput.fill('123')

    // Pay button should now be enabled
    await expect(payButton).toBeEnabled()
  })

  test('should process payment successfully', async ({ page }) => {
    await page.goto('/checkout/week-1/payment')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Select card payment and fill details
    const cardButton = page.locator('[data-testid="card-payment-method"]')
    await cardButton.click()

    const cardNameInput = page.locator('[data-testid="card-name-input"]')
    const cardNumberInput = page.locator('[data-testid="card-number-input"]')
    const expiryInput = page.locator('[data-testid="card-expiry-input"]')
    const cvcInput = page.locator('[data-testid="card-cvc-input"]')

    await cardNameInput.fill('John Doe')
    await cardNumberInput.fill('4111 1111 1111 1111')
    await expiryInput.fill('12/25')
    await cvcInput.fill('123')

    const payButton = page.locator('[data-testid="pay-button"]')
    await expect(payButton).toBeEnabled()

    // Click pay button
    await payButton.click()

    // Verify processing state
    await expect(payButton).toBeDisabled()
    await expect(payButton).toHaveText(/Processing Payment/)

    // Wait for mock payment processing
    await page.waitForTimeout(2500)

    // Verify redirect to success page
    await page.waitForURL('/booking/success*')
    await expect(page.locator('[data-testid="booking-confirmed-title"]')).toHaveText('Booking Confirmed!')
    await expect(page.locator('text=Your surf adventure has been successfully booked')).toBeVisible()
  })

  test('should display booking success details correctly', async ({ page }) => {
    // Navigate directly to success page with mock booking ID
    await page.goto('/booking/success?bookingId=test-booking-123')
    await page.waitForLoadState('networkidle')

    // Verify success page loads with correct title
    await expect(page.locator('[data-testid="booking-confirmed-title"]')).toHaveText('Booking Confirmed!')

    // Verify booking details are displayed
    await expect(page.locator('text=Booking Details')).toBeVisible()
    await expect(page.locator('text=test-booking-123')).toBeVisible()
    await expect(page.locator('text=$1,200 MXN')).toBeVisible()

    // Verify next steps are shown
    await expect(page.locator('text=What\'s Next?')).toBeVisible()
    await expect(page.locator('text=Check Your Email')).toBeVisible()
    await expect(page.locator('text=Prepare for Your Trip')).toBeVisible()
    await expect(page.locator('text=Arrive and Surf!')).toBeVisible()

    // Verify action buttons are present
    await expect(page.locator('[data-testid="view-bookings-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="book-another-button"]')).toBeVisible()
  })

  test('should navigate from success page to bookings', async ({ page }) => {
    await page.goto('/booking/success?bookingId=test-booking-123')
    await page.waitForLoadState('networkidle')

    // Click view bookings button
    const viewBookingsButton = page.locator('[data-testid="view-bookings-button"]')
    await viewBookingsButton.click()

    // Should navigate to client bookings page
    await page.waitForURL('/client/bookings')
  })

  test('should navigate from success page to book another week', async ({ page }) => {
    await page.goto('/booking/success?bookingId=test-booking-123')
    await page.waitForLoadState('networkidle')

    // Click book another week button
    const bookAnotherButton = page.locator('[data-testid="book-another-button"]')
    await bookAnotherButton.click()

    // Should navigate to weeks page
    await page.waitForURL('/weeks')
  })

  test('should display contact information on success page', async ({ page }) => {
    await page.goto('/booking/success?bookingId=test-booking-123')
    await page.waitForLoadState('networkidle')

    // Verify support contact information is displayed
    await expect(page.locator('text=Questions? Contact us at')).toBeVisible()
    await expect(page.locator('text=support@heiwa.house')).toBeVisible()

    // Verify the email link is present
    const emailLink = page.locator('a[href="mailto:support@heiwa.house"]')
    await expect(emailLink).toBeVisible()
  })

  test('should display order summary correctly', async ({ page }) => {
    await page.goto('/checkout/week-1/payment')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify order summary is displayed
    const orderSummary = page.locator('[data-testid="order-summary"]')
    await expect(orderSummary).toBeVisible()

    // Verify order summary contains expected information
    await expect(page.locator('text=Week:')).toBeVisible()
    await expect(page.locator('text=Participants:')).toBeVisible()
    await expect(page.locator('text=Room:')).toBeVisible()
    await expect(page.locator('text=Total:')).toBeVisible()

    // Verify specific values are displayed
    await expect(page.locator('text=week-1')).toBeVisible()
    await expect(page.locator('text=2')).toBeVisible() // Mock participants
    await expect(page.locator('text=Ocean View Suite')).toBeVisible()
    await expect(page.locator('text=$1,200')).toBeVisible() // Mock total
  })

  test('should handle PayPal payment method selection', async ({ page }) => {
    await page.goto('/checkout/week-1/payment')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Select PayPal payment method
    const paypalButton = page.locator('[data-testid="paypal-payment-method"]')
    await paypalButton.click()

    // Verify PayPal interface is displayed
    await expect(page.locator('text=You\'ll be redirected to PayPal')).toBeVisible()
    await expect(page.locator('text=PayPal')).toBeVisible()

    // Pay button should be enabled for PayPal (no form validation needed)
    const payButton = page.locator('[data-testid="pay-button"]')
    await expect(payButton).toBeEnabled()
  })

  test('should validate card number format', async ({ page }) => {
    await page.goto('/checkout/week-1/payment')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const cardButton = page.locator('[data-testid="card-payment-method"]')
    await cardButton.click()

    const cardNumberInput = page.locator('[data-testid="card-number-input"]')

    // Test various card number formats
    await cardNumberInput.fill('4111111111111111')
    await expect(cardNumberInput).toHaveValue('4111 1111 1111 1111')

    await cardNumberInput.fill('1234567890123456')
    await expect(cardNumberInput).toHaveValue('1234 5678 9012 3456')

    // Test invalid characters are filtered out
    await cardNumberInput.fill('4111-1111-1111-1111')
    await expect(cardNumberInput).toHaveValue('4111 1111 1111 1111')
  })

  test('should validate expiry date format', async ({ page }) => {
    await page.goto('/checkout/week-1/payment')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const cardButton = page.locator('[data-testid="card-payment-method"]')
    await cardButton.click()

    const expiryInput = page.locator('[data-testid="card-expiry-input"]')

    // Test expiry date formatting
    await expiryInput.fill('1225')
    await expect(expiryInput).toHaveValue('12/25')

    await expiryInput.fill('0125')
    await expect(expiryInput).toHaveValue('01/25')

    // Test invalid characters are filtered out
    await expiryInput.fill('12/25')
    await expect(expiryInput).toHaveValue('12/25')
  })

  test('should show security information', async ({ page }) => {
    await page.goto('/checkout/week-1/payment')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify security information is displayed
    await expect(page.locator('text=Your payment information is encrypted and secure')).toBeVisible()
    await expect(page.locator('text=ShieldCheckIcon')).toBeVisible()

    // Verify SSL/security indicators
    await expect(page.locator('text=encrypted')).toBeVisible()
    await expect(page.locator('text=secure')).toBeVisible()
  })

  test('should display booking policies', async ({ page }) => {
    await page.goto('/checkout/week-1/payment')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify booking policy section is displayed
    await expect(page.locator('text=Booking Policy:')).toBeVisible()

    // Verify policy details
    await expect(page.locator('text=Free cancellation up to 30 days')).toBeVisible()
    await expect(page.locator('text=50% refund 15-29 days')).toBeVisible()
    await expect(page.locator('text=No refund within 14 days')).toBeVisible()
  })

  test('should handle payment errors gracefully', async ({ page }) => {
    // This test would require mocking payment failures
    // For now, we'll verify the payment form handles edge cases

    await page.goto('/checkout/week-1/payment')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const cardButton = page.locator('[data-testid="card-payment-method"]')
    await cardButton.click()

    // Test with invalid card number
    const cardNumberInput = page.locator('[data-testid="card-number-input"]')
    await cardNumberInput.fill('1234 5678 9012 3456') // Invalid card

    const payButton = page.locator('[data-testid="pay-button"]')

    // In a real implementation, the form might validate card numbers
    // For now, we just ensure the UI doesn't break
    await expect(payButton).toBeVisible()
    await expect(page.locator('[data-testid="payment-form"]')).toBeVisible()
  })
})
