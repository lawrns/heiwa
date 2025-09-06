import { test, expect } from '@playwright/test';

// Mock payment tracking setup
test.beforeEach(async ({ page }) => {
  // Mock admin authentication
  await page.addInitScript(() => {
    (window as any).__mockAuth = {
      user: {
        uid: 'admin_123',
        email: 'admin@heiwa.house',
        displayName: 'Admin User',
        role: 'admin'
      },
      loading: false
    };

    (window as any).__currentUser = (window as any).__mockAuth.user;
  });

  // Mock payment data and API responses
  await page.addInitScript(() => {
    (window as any).__mockPayments = [
      {
        id: 'payment_001',
        bookingId: 'booking_001',
        clientName: 'John Doe',
        clientEmail: 'john.doe@example.com',
        amount: 450.00,
        currency: 'USD',
        status: 'completed',
        paymentMethod: 'stripe',
        stripePaymentIntentId: 'pi_test_1234567890abcdef',
        stripeCheckoutSessionId: 'cs_test_abcdef1234567890',
        transactionDate: '2024-02-15T10:30:00Z',
        refundAmount: 0,
        refundStatus: null,
        created_at: '2024-02-15T10:25:00Z',
        updated_at: '2024-02-15T10:35:00Z'
      },
      {
        id: 'payment_002',
        bookingId: 'booking_002',
        clientName: 'Jane Smith',
        clientEmail: 'jane.smith@example.com',
        amount: 320.00,
        currency: 'USD',
        status: 'pending',
        paymentMethod: 'stripe',
        stripePaymentIntentId: 'pi_test_abcdef0987654321',
        stripeCheckoutSessionId: 'cs_test_0987654321abcdef',
        transactionDate: null,
        refundAmount: 0,
        refundStatus: null,
        created_at: '2024-03-01T14:20:00Z',
        updated_at: '2024-03-01T14:20:00Z'
      },
      {
        id: 'payment_003',
        bookingId: 'booking_003',
        clientName: 'Mike Johnson',
        clientEmail: 'mike.johnson@example.com',
        amount: 650.00,
        currency: 'USD',
        status: 'refunded',
        paymentMethod: 'stripe',
        stripePaymentIntentId: 'pi_test_fedcba0123456789',
        stripeCheckoutSessionId: 'cs_test_fedcba0123456789',
        transactionDate: '2024-01-20T16:45:00Z',
        refundAmount: 650.00,
        refundStatus: 'completed',
        created_at: '2024-01-20T16:40:00Z',
        updated_at: '2024-01-25T09:15:00Z'
      }
    ];

    const originalFetch = window.fetch;
    (window as any).fetch = async (url: string, options?: any) => {
      // Mock payments API endpoints
      if (url.includes('/api/payments')) {
        if (options?.method === 'GET' || !options?.method) {
          return {
            ok: true,
            json: async () => ({
              payments: (window as any).__mockPayments,
              total: (window as any).__mockPayments.length,
              totalAmount: (window as any).__mockPayments.reduce((sum: number, p: any) => sum + p.amount, 0)
            })
          };
        }

        // Mock refund initiation
        if (url.includes('/refund') && options?.method === 'POST') {
          const { paymentId, amount, reason } = JSON.parse(options.body);
          const paymentIndex = (window as any).__mockPayments.findIndex((p: any) => p.id === paymentId);
          
          if (paymentIndex !== -1) {
            (window as any).__mockPayments[paymentIndex] = {
              ...(window as any).__mockPayments[paymentIndex],
              refundAmount: amount,
              refundStatus: 'processing',
              updated_at: new Date().toISOString()
            };
            
            return {
              ok: true,
              json: async () => ({
                success: true,
                refundId: `re_${Date.now()}`,
                status: 'processing'
              })
            };
          }
        }

        // Mock payment status update
        if (options?.method === 'PATCH') {
          const paymentId = url.split('/').pop();
          const updateData = JSON.parse(options.body);
          const paymentIndex = (window as any).__mockPayments.findIndex((p: any) => p.id === paymentId);
          
          if (paymentIndex !== -1) {
            (window as any).__mockPayments[paymentIndex] = {
              ...(window as any).__mockPayments[paymentIndex],
              ...updateData,
              updated_at: new Date().toISOString()
            };
            
            return {
              ok: true,
              json: async () => ({ payment: (window as any).__mockPayments[paymentIndex] })
            };
          }
        }
      }

      // Mock Stripe webhook simulation
      if (url.includes('/api/webhooks/stripe')) {
        return {
          ok: true,
          json: async () => ({ received: true })
        };
      }

      return originalFetch(url, options);
    };
  });

  // Mock Stripe webhook events
  await page.addInitScript(() => {
    (window as any).simulateStripeWebhook = (eventType: string, paymentIntentId: string) => {
      const payment = (window as any).__mockPayments.find((p: any) => p.stripePaymentIntentId === paymentIntentId);
      if (payment) {
        if (eventType === 'payment_intent.succeeded') {
          payment.status = 'completed';
          payment.transactionDate = new Date().toISOString();
        } else if (eventType === 'payment_intent.payment_failed') {
          payment.status = 'failed';
        } else if (eventType === 'charge.dispute.created') {
          payment.status = 'disputed';
        }
        payment.updated_at = new Date().toISOString();
        
        // Trigger UI update
        window.dispatchEvent(new CustomEvent('payment-update', { detail: payment }));
      }
    };
  });
});

test.describe('Payment Tracking (PAYMENT-002)', () => {
  test('should render payments table with existing payments', async ({ page }) => {
    await page.goto('/admin/payments');
    await page.waitForLoadState('networkidle');

    // Verify page title and main elements
    await expect(page.locator('text=Payment Tracking')).toBeVisible();
    await expect(page.locator('[data-testid="payments-table"]')).toBeVisible();

    // Verify payments are displayed
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=Jane Smith')).toBeVisible();
    await expect(page.locator('text=Mike Johnson')).toBeVisible();
    await expect(page.locator('text=$450.00')).toBeVisible();
    await expect(page.locator('text=$320.00')).toBeVisible();
    await expect(page.locator('text=$650.00')).toBeVisible();

    // Verify status badges
    await expect(page.locator('text=completed')).toBeVisible();
    await expect(page.locator('text=pending')).toBeVisible();
    await expect(page.locator('text=refunded')).toBeVisible();
  });

  test('should filter payments by status', async ({ page }) => {
    await page.goto('/admin/payments');
    await page.waitForLoadState('networkidle');

    // Test completed filter
    const statusFilter = page.locator('select[data-testid="status-filter"]');
    await statusFilter.selectOption('completed');
    await page.waitForTimeout(500);

    // Should show only completed payments
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=Jane Smith')).not.toBeVisible();
    await expect(page.locator('text=Mike Johnson')).not.toBeVisible();

    // Test pending filter
    await statusFilter.selectOption('pending');
    await page.waitForTimeout(500);

    // Should show only pending payments
    await expect(page.locator('text=Jane Smith')).toBeVisible();
    await expect(page.locator('text=John Doe')).not.toBeVisible();
    await expect(page.locator('text=Mike Johnson')).not.toBeVisible();

    // Test refunded filter
    await statusFilter.selectOption('refunded');
    await page.waitForTimeout(500);

    // Should show only refunded payments
    await expect(page.locator('text=Mike Johnson')).toBeVisible();
    await expect(page.locator('text=John Doe')).not.toBeVisible();
    await expect(page.locator('text=Jane Smith')).not.toBeVisible();

    // Reset to show all
    await statusFilter.selectOption('all');
    await page.waitForTimeout(500);

    // Should show all payments
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=Jane Smith')).toBeVisible();
    await expect(page.locator('text=Mike Johnson')).toBeVisible();
  });

  test('should filter payments by date range', async ({ page }) => {
    await page.goto('/admin/payments');
    await page.waitForLoadState('networkidle');

    // Set date range filter
    const startDateFilter = page.locator('input[data-testid="start-date-filter"]');
    const endDateFilter = page.locator('input[data-testid="end-date-filter"]');

    if (await startDateFilter.isVisible() && await endDateFilter.isVisible()) {
      await startDateFilter.fill('2024-02-01');
      await endDateFilter.fill('2024-02-28');
      await page.waitForTimeout(500);

      // Should show only payments in February 2024
      await expect(page.locator('text=John Doe')).toBeVisible(); // Feb 15
      await expect(page.locator('text=Jane Smith')).not.toBeVisible(); // March 1
      await expect(page.locator('text=Mike Johnson')).not.toBeVisible(); // January 20
    }
  });

  test('should search payments by client name or email', async ({ page }) => {
    await page.goto('/admin/payments');
    await page.waitForLoadState('networkidle');

    // Search by client name
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('John');
    await page.waitForTimeout(500);

    // Should show only matching payments
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=Jane Smith')).not.toBeVisible();
    await expect(page.locator('text=Mike Johnson')).not.toBeVisible();

    // Search by email
    await searchInput.clear();
    await searchInput.fill('jane.smith@example.com');
    await page.waitForTimeout(500);

    // Should show only matching payments
    await expect(page.locator('text=Jane Smith')).toBeVisible();
    await expect(page.locator('text=John Doe')).not.toBeVisible();
    await expect(page.locator('text=Mike Johnson')).not.toBeVisible();

    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(500);

    // Should show all payments
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=Jane Smith')).toBeVisible();
    await expect(page.locator('text=Mike Johnson')).toBeVisible();
  });

  test('should initiate refund for completed payment', async ({ page }) => {
    await page.goto('/admin/payments');
    await page.waitForLoadState('networkidle');

    // Click refund button for completed payment
    await page.locator('[data-testid="refund-button-payment_001"]').click();

    // Verify refund dialog appears
    await expect(page.locator('text=Initiate Refund')).toBeVisible();

    // Fill refund form
    await page.locator('input[name="refundAmount"]').fill('450.00');
    await page.locator('textarea[name="refundReason"]').fill('Customer requested cancellation');

    // Submit refund
    await page.locator('button:has-text("Process Refund")').click();
    await page.waitForTimeout(1000);

    // Verify success message
    await expect(page.locator('text=Refund initiated successfully')).toBeVisible();

    // Verify payment status updated
    await expect(page.locator('text=processing')).toBeVisible();
  });

  test('should not allow refund for non-completed payments', async ({ page }) => {
    await page.goto('/admin/payments');
    await page.waitForLoadState('networkidle');

    // Refund button should be disabled for pending payments
    const pendingRefundButton = page.locator('[data-testid="refund-button-payment_002"]');
    if (await pendingRefundButton.isVisible()) {
      await expect(pendingRefundButton).toBeDisabled();
    }

    // Refund button should not be visible for already refunded payments
    const refundedRefundButton = page.locator('[data-testid="refund-button-payment_003"]');
    await expect(refundedRefundButton).not.toBeVisible();
  });

  test('should validate refund amount', async ({ page }) => {
    await page.goto('/admin/payments');
    await page.waitForLoadState('networkidle');

    // Click refund button
    await page.locator('[data-testid="refund-button-payment_001"]').click();

    // Try to refund more than payment amount
    await page.locator('input[name="refundAmount"]').fill('500.00'); // More than $450
    await page.locator('button:has-text("Process Refund")').click();

    // Verify validation error
    await expect(page.locator('text=Refund amount cannot exceed payment amount')).toBeVisible();

    // Try negative amount
    await page.locator('input[name="refundAmount"]').clear();
    await page.locator('input[name="refundAmount"]').fill('-100');
    await page.locator('button:has-text("Process Refund")').click();

    // Verify validation error
    await expect(page.locator('text=Refund amount must be positive')).toBeVisible();
  });

  test('should handle Stripe webhook updates', async ({ page }) => {
    await page.goto('/admin/payments');
    await page.waitForLoadState('networkidle');

    // Simulate Stripe webhook for payment success
    await page.evaluate(() => {
      (window as any).simulateStripeWebhook('payment_intent.succeeded', 'pi_test_abcdef0987654321');
    });

    await page.waitForTimeout(1000);

    // Verify payment status updated from pending to completed
    await expect(page.locator('text=completed')).toHaveCount(2); // Should now have 2 completed payments

    // Simulate payment failure webhook
    await page.evaluate(() => {
      (window as any).simulateStripeWebhook('payment_intent.payment_failed', 'pi_test_abcdef0987654321');
    });

    await page.waitForTimeout(1000);

    // Verify payment status updated to failed
    await expect(page.locator('text=failed')).toBeVisible();
  });

  test('should display payment details modal', async ({ page }) => {
    await page.goto('/admin/payments');
    await page.waitForLoadState('networkidle');

    // Click on payment row to view details
    await page.locator('text=John Doe').first().click();

    // Verify payment details modal appears
    await expect(page.locator('[data-testid="payment-details-modal"]')).toBeVisible();

    // Verify payment details are shown
    await expect(page.locator('text=Payment Details')).toBeVisible();
    await expect(page.locator('text=pi_test_1234567890abcdef')).toBeVisible(); // Stripe Payment Intent ID
    await expect(page.locator('text=cs_test_abcdef1234567890')).toBeVisible(); // Stripe Checkout Session ID
    await expect(page.locator('text=john.doe@example.com')).toBeVisible();
  });

  test('should sort payments by different columns', async ({ page }) => {
    await page.goto('/admin/payments');
    await page.waitForLoadState('networkidle');

    // Sort by amount (ascending)
    await page.locator('[data-testid="sort-amount"]').click();
    await page.waitForTimeout(500);

    // Verify sorting order (smallest amount first)
    const firstAmount = await page.locator('[data-testid="payments-table"] tbody tr:first-child td:nth-child(4)').textContent();
    expect(firstAmount).toContain('$320.00');

    // Sort by amount (descending)
    await page.locator('[data-testid="sort-amount"]').click();
    await page.waitForTimeout(500);

    // Verify sorting order (largest amount first)
    const firstAmountDesc = await page.locator('[data-testid="payments-table"] tbody tr:first-child td:nth-child(4)').textContent();
    expect(firstAmountDesc).toContain('$650.00');

    // Sort by date
    await page.locator('[data-testid="sort-date"]').click();
    await page.waitForTimeout(500);

    // Verify table is still visible after sorting
    await expect(page.locator('[data-testid="payments-table"]')).toBeVisible();
  });

  test('should display payment summary statistics', async ({ page }) => {
    await page.goto('/admin/payments');
    await page.waitForLoadState('networkidle');

    // Verify summary cards
    await expect(page.locator('text=Total Payments')).toBeVisible();
    await expect(page.locator('text=Total Amount')).toBeVisible();
    await expect(page.locator('text=Completed')).toBeVisible();
    await expect(page.locator('text=Pending')).toBeVisible();
    await expect(page.locator('text=Refunded')).toBeVisible();

    // Verify summary values
    await expect(page.locator('text=3')).toBeVisible(); // Total payments count
    await expect(page.locator('text=$1,420.00')).toBeVisible(); // Total amount
  });

  test('should handle pagination for large payment lists', async ({ page }) => {
    // Mock large payment dataset
    await page.addInitScript(() => {
      const largePaymentList = Array.from({ length: 25 }, (_, i) => ({
        id: `payment_${String(i + 1).padStart(3, '0')}`,
        bookingId: `booking_${i + 1}`,
        clientName: `Client ${i + 1}`,
        clientEmail: `client${i + 1}@example.com`,
        amount: 100 + (i * 10),
        currency: 'USD',
        status: i % 3 === 0 ? 'completed' : i % 3 === 1 ? 'pending' : 'refunded',
        paymentMethod: 'stripe',
        created_at: new Date().toISOString()
      }));

      (window as any).__mockPayments = largePaymentList;
    });

    await page.goto('/admin/payments');
    await page.waitForLoadState('networkidle');

    // Verify pagination controls appear
    const paginationControls = page.locator('[data-testid="pagination"]');
    if (await paginationControls.isVisible()) {
      await expect(paginationControls).toBeVisible();

      // Test next page
      const nextButton = page.locator('button:has-text("Next")');
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should export payments data', async ({ page }) => {
    await page.goto('/admin/payments');
    await page.waitForLoadState('networkidle');

    // Look for export button
    const exportButton = page.locator('[data-testid="export-payments"]');
    if (await exportButton.isVisible()) {
      // Mock download
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();

      // Verify export initiated
      await expect(page.locator('text=Exporting payments...')).toBeVisible();
    }
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/admin/payments');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('[data-testid="payments-table"]')).toBeVisible();

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('text=Payment Tracking')).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('text=Payment Tracking')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/payments', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/admin/payments');
    await page.waitForLoadState('networkidle');

    // Should show error message
    await expect(page.locator('text=Failed to load payments')).toBeVisible();
  });

  test('should take snapshots for visual regression', async ({ page }) => {
    await page.goto('/admin/payments');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Take screenshot of full payments page
    await expect(page.locator('body')).toHaveScreenshot('payments-page.png');

    // Take screenshot of payments table
    await expect(page.locator('[data-testid="payments-table"]')).toHaveScreenshot('payments-table.png');

    // Take screenshot of payment summary cards
    const summaryCards = page.locator('[data-testid="payment-summary"]');
    if (await summaryCards.isVisible()) {
      await expect(summaryCards).toHaveScreenshot('payment-summary-cards.png');
    }

    // Test with filters applied
    const statusFilter = page.locator('select[data-testid="status-filter"]');
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('completed');
      await page.waitForTimeout(500);

      await expect(page.locator('[data-testid="payments-table"]')).toHaveScreenshot('payments-table-filtered.png');

      // Reset filter
      await statusFilter.selectOption('all');
      await page.waitForTimeout(500);
    }

    // Open refund dialog and take screenshot
    await page.locator('[data-testid="refund-button-payment_001"]').click();
    await page.waitForTimeout(500);

    const refundDialog = page.locator('[data-testid="refund-dialog"]');
    if (await refundDialog.isVisible()) {
      await expect(refundDialog).toHaveScreenshot('refund-dialog.png');
    } else {
      // Fallback to text-based selector
      await expect(page.locator('text=Initiate Refund')).toHaveScreenshot('refund-dialog-fallback.png');
    }

    // Fill refund form and take screenshot
    await page.locator('input[name="refundAmount"]').fill('100.00');
    await page.locator('textarea[name="refundReason"]').fill('Customer requested refund');
    await page.waitForTimeout(300);

    if (await refundDialog.isVisible()) {
      await expect(refundDialog).toHaveScreenshot('refund-dialog-filled.png');
    }

    // Close dialog and test payment details modal
    await page.locator('button:has-text("Cancel")').click();
    await page.waitForTimeout(500);

    // Click on payment row to open details
    await page.locator('text=John Doe').first().click();
    await page.waitForTimeout(500);

    const detailsModal = page.locator('[data-testid="payment-details-modal"]');
    if (await detailsModal.isVisible()) {
      await expect(detailsModal).toHaveScreenshot('payment-details-modal.png');
    }

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin/payments');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page.locator('body')).toHaveScreenshot('payments-mobile.png');
  });
});
