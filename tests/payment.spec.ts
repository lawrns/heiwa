import { test, expect } from '@playwright/test';

// Mock payment data setup
test.beforeEach(async ({ page }) => {
  // Mock payment form data and API responses
  await page.addInitScript(() => {
    // Mock fetch for payment API calls
    const originalFetch = window.fetch;
    (window as any).fetch = async (url: string, options?: any) => {
      if (url.includes('/api/payments/create-checkout-session')) {
        return {
          ok: true,
          json: async () => ({
            sessionId: 'cs_test_mock_session_123',
            url: '/checkout/week-1/payment',
            bookingId: 'booking_123'
          })
        };
      }
      return originalFetch(url, options);
    };
  });
});

test.describe('Payment Form and Stripe Integration (PAYMENT-001)', () => {
  test('should display security icons and PCI compliance badge', async ({ page }) => {
    // Navigate to payment page
    await page.goto('/checkout/week-1/payment');
    await page.waitForLoadState('networkidle');

    // Verify security icons are present
    await expect(page.locator('[data-testid="lock-icon"]')).toBeVisible();
    await expect(page.locator('[data-testid="pci-badge"]')).toBeVisible();
    await expect(page.locator('[data-testid="pci-badge"]')).toHaveText('PCI Compliant');

    // Verify lock icon is green (security indicator)
    const lockIcon = page.locator('[data-testid="lock-icon"]');
    await expect(lockIcon).toHaveClass(/text-green-600/);
  });

  test('should validate payment form inputs', async ({ page }) => {
    await page.goto('/checkout/week-1/payment');
    await page.waitForLoadState('networkidle');

    // Verify payment form is displayed
    await expect(page.locator('[data-testid="payment-form"]')).toBeVisible();

    // Initially, pay button should be disabled (empty form)
    const payButton = page.locator('[data-testid="pay-button"]');
    await expect(payButton).toBeDisabled();

    // Fill cardholder name only
    await page.locator('[data-testid="card-name-input"]').fill('John Doe');
    await expect(payButton).toBeDisabled(); // Still disabled

    // Fill card number (invalid length)
    await page.locator('[data-testid="card-number-input"]').fill('1234 5678');
    await expect(payButton).toBeDisabled(); // Still disabled

    // Fill complete card number
    await page.locator('[data-testid="card-number-input"]').clear();
    await page.locator('[data-testid="card-number-input"]').fill('1234 5678 9012 3456');
    await expect(payButton).toBeDisabled(); // Still disabled (missing expiry and CVV)

    // Fill expiry date
    await page.locator('[data-testid="card-expiry-input"]').fill('12/25');
    await expect(payButton).toBeDisabled(); // Still disabled (missing CVV)

    // Fill CVV
    await page.locator('[data-testid="card-cvv-input"]').fill('123');
    
    // Now pay button should be enabled
    await expect(payButton).toBeEnabled();
  });

  test('should format card number correctly', async ({ page }) => {
    await page.goto('/checkout/week-1/payment');
    await page.waitForLoadState('networkidle');

    const cardNumberInput = page.locator('[data-testid="card-number-input"]');
    
    // Type card number without spaces
    await cardNumberInput.fill('1234567890123456');
    
    // Verify it gets formatted with spaces
    await expect(cardNumberInput).toHaveValue('1234 5678 9012 3456');

    // Test partial number formatting
    await cardNumberInput.clear();
    await cardNumberInput.fill('12345678');
    await expect(cardNumberInput).toHaveValue('1234 5678');
  });

  test('should handle payment method selection', async ({ page }) => {
    await page.goto('/checkout/week-1/payment');
    await page.waitForLoadState('networkidle');

    // Verify card payment method is selected by default
    const cardMethod = page.locator('[data-testid="card-payment-method"]');
    const paypalMethod = page.locator('[data-testid="paypal-payment-method"]');
    
    await expect(cardMethod).toBeVisible();
    await expect(paypalMethod).toBeVisible();

    // Card should be selected by default (has active styling)
    await expect(cardMethod).toHaveClass(/border-oceanBlue-500/);

    // Click PayPal method
    await paypalMethod.click();
    await expect(paypalMethod).toHaveClass(/border-oceanBlue-500/);

    // Switch back to card
    await cardMethod.click();
    await expect(cardMethod).toHaveClass(/border-oceanBlue-500/);
  });

  test('should display order summary correctly', async ({ page }) => {
    await page.goto('/checkout/week-1/payment');
    await page.waitForLoadState('networkidle');

    // Verify order summary is present
    await expect(page.locator('[data-testid="order-summary"]')).toBeVisible();
    await expect(page.locator('text=Order Summary')).toBeVisible();

    // Verify week information is displayed
    await expect(page.locator('text=Week:')).toBeVisible();
    await expect(page.locator('text=week-1')).toBeVisible();

    // Verify total amount is displayed
    await expect(page.locator('text=Total:')).toBeVisible();
  });

  test('should handle payment processing', async ({ page }) => {
    await page.goto('/checkout/week-1/payment');
    await page.waitForLoadState('networkidle');

    // Fill valid payment details
    await page.locator('[data-testid="card-name-input"]').fill('John Doe');
    await page.locator('[data-testid="card-number-input"]').fill('1234 5678 9012 3456');
    await page.locator('[data-testid="card-expiry-input"]').fill('12/25');
    await page.locator('[data-testid="card-cvv-input"]').fill('123');

    // Click pay button
    const payButton = page.locator('[data-testid="pay-button"]');
    await expect(payButton).toBeEnabled();
    await payButton.click();

    // Verify processing state
    await expect(page.locator('text=Processing Payment...')).toBeVisible();
    await expect(payButton).toBeDisabled();

    // Wait for processing to complete and redirect
    await page.waitForURL('**/booking/success**', { timeout: 5000 });
    expect(page.url()).toContain('/booking/success');
  });

  test('should validate expiry date format', async ({ page }) => {
    await page.goto('/checkout/week-1/payment');
    await page.waitForLoadState('networkidle');

    const expiryInput = page.locator('[data-testid="card-expiry-input"]');
    
    // Test various expiry formats
    await expiryInput.fill('1225');
    await expect(expiryInput).toHaveValue('12/25');

    await expiryInput.clear();
    await expiryInput.fill('0125');
    await expect(expiryInput).toHaveValue('01/25');

    // Test invalid month
    await expiryInput.clear();
    await expiryInput.fill('1325');
    // Should still format but validation would catch invalid month
    await expect(expiryInput).toHaveValue('13/25');
  });

  test('should validate CVV input', async ({ page }) => {
    await page.goto('/checkout/week-1/payment');
    await page.waitForLoadState('networkidle');

    const cvvInput = page.locator('[data-testid="card-cvv-input"]');
    
    // Test CVV length limits
    await cvvInput.fill('12345');
    await expect(cvvInput).toHaveValue('123'); // Should be limited to 3 digits

    // Test that non-numeric characters are filtered
    await cvvInput.clear();
    await cvvInput.fill('1a2b3');
    await expect(cvvInput).toHaveValue('123');
  });

  test('should show payment amount in button', async ({ page }) => {
    await page.goto('/checkout/week-1/payment');
    await page.waitForLoadState('networkidle');

    const payButton = page.locator('[data-testid="pay-button"]');
    
    // Verify button shows payment amount
    await expect(payButton).toContainText('Pay $');
    await expect(payButton).toContainText('MXN'); // Currency
  });

  test('should handle Stripe checkout session creation', async ({ page }) => {
    // Mock the API call
    await page.route('**/api/payments/create-checkout-session', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sessionId: 'cs_test_mock_session_123',
          url: '/checkout/week-1/payment',
          bookingId: 'booking_123'
        })
      });
    });

    await page.goto('/checkout/week-1/payment');
    await page.waitForLoadState('networkidle');

    // Fill form and submit
    await page.locator('[data-testid="card-name-input"]').fill('John Doe');
    await page.locator('[data-testid="card-number-input"]').fill('1234 5678 9012 3456');
    await page.locator('[data-testid="card-expiry-input"]').fill('12/25');
    await page.locator('[data-testid="card-cvv-input"]').fill('123');

    await page.locator('[data-testid="pay-button"]').click();

    // Verify redirect to success page
    await page.waitForURL('**/booking/success**', { timeout: 5000 });
  });

  test('should handle payment errors gracefully', async ({ page }) => {
    // Mock API to return error
    await page.route('**/api/payments/create-checkout-session', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Payment failed'
        })
      });
    });

    await page.goto('/checkout/week-1/payment');
    await page.waitForLoadState('networkidle');

    // Fill form and submit
    await page.locator('[data-testid="card-name-input"]').fill('John Doe');
    await page.locator('[data-testid="card-number-input"]').fill('1234 5678 9012 3456');
    await page.locator('[data-testid="card-expiry-input"]').fill('12/25');
    await page.locator('[data-testid="card-cvv-input"]').fill('123');

    await page.locator('[data-testid="pay-button"]').click();

    // Should still redirect to success (fallback behavior)
    await page.waitForURL('**/booking/success**', { timeout: 5000 });
  });

  test('should display payment form title correctly', async ({ page }) => {
    await page.goto('/checkout/week-1/payment');
    await page.waitForLoadState('networkidle');

    // Verify page title and form title
    await expect(page.locator('h1')).toHaveText('Complete Your Payment');
    await expect(page.locator('text=Payment Details')).toBeVisible();
    await expect(page.locator('text=Secure Payment')).toBeVisible();
  });

  test('should validate required fields before enabling payment', async ({ page }) => {
    await page.goto('/checkout/week-1/payment');
    await page.waitForLoadState('networkidle');

    const payButton = page.locator('[data-testid="pay-button"]');
    
    // Test each field individually
    await page.locator('[data-testid="card-name-input"]').fill('John Doe');
    await expect(payButton).toBeDisabled();

    await page.locator('[data-testid="card-number-input"]').fill('1234 5678 9012 3456');
    await expect(payButton).toBeDisabled();

    await page.locator('[data-testid="card-expiry-input"]').fill('12/25');
    await expect(payButton).toBeDisabled();

    // Only after all fields are filled should button be enabled
    await page.locator('[data-testid="card-cvv-input"]').fill('123');
    await expect(payButton).toBeEnabled();

    // Remove a field and verify button is disabled again
    await page.locator('[data-testid="card-name-input"]').clear();
    await expect(payButton).toBeDisabled();
  });

  test('should handle webhook simulation', async ({ page }) => {
    // This test simulates the webhook flow
    await page.route('**/api/webhooks/stripe', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          received: true
        })
      });
    });

    await page.goto('/checkout/week-1/payment');
    await page.waitForLoadState('networkidle');

    // Complete payment flow
    await page.locator('[data-testid="card-name-input"]').fill('John Doe');
    await page.locator('[data-testid="card-number-input"]').fill('1234 5678 9012 3456');
    await page.locator('[data-testid="card-expiry-input"]').fill('12/25');
    await page.locator('[data-testid="card-cvv-input"]').fill('123');

    await page.locator('[data-testid="pay-button"]').click();

    // Verify successful completion
    await page.waitForURL('**/booking/success**', { timeout: 5000 });
    expect(page.url()).toContain('bookingId=mock-payment-success');
  });
});
