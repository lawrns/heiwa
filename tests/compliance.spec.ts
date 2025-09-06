import { test, expect } from '@playwright/test';

// Mock compliance data setup
test.beforeEach(async ({ page }) => {
  // Mock admin authentication
  await page.addInitScript(() => {
    (window as any).__mockAuth = {
      user: {
        uid: 'admin_123',
        email: 'admin@heiwa.house',
        displayName: 'Admin User'
      },
      loading: false
    };
  });

  // Mock GDPR API responses
  await page.addInitScript(() => {
    const originalFetch = window.fetch;
    (window as any).fetch = async (url: string, options?: any) => {
      // Mock GDPR export API
      if (url.includes('/api/gdpr/export')) {
        if (options?.method === 'POST') {
          const body = JSON.parse(options.body);
          return {
            ok: true,
            blob: async () => new Blob([JSON.stringify({
              exportInfo: {
                exportDate: new Date().toISOString(),
                requestedBy: 'admin@heiwa.house',
                clientEmail: body.clientEmail,
                dataTypes: body
              },
              clientData: {
                profile: { name: 'John Doe', email: body.clientEmail },
                bookings: [{ id: 'booking_001', totalAmount: 450 }],
                payments: [{ id: 'payment_001', amount: 450 }]
              }
            }, null, 2)], { type: 'application/json' })
          };
        }
        return {
          ok: true,
          json: async () => ({ status: 'ready', message: 'GDPR export service is operational' })
        };
      }

      // Mock GDPR delete API
      if (url.includes('/api/gdpr/delete')) {
        if (options?.method === 'POST') {
          const body = JSON.parse(options.body);
          if (body.confirmationText !== 'DELETE') {
            return {
              ok: false,
              status: 400,
              json: async () => ({ error: 'Must type "DELETE" to confirm' })
            };
          }
          return {
            ok: true,
            json: async () => ({
              success: true,
              message: 'Client data successfully deleted',
              deletedRecords: 5,
              clientEmail: body.clientEmail,
              deletedBy: 'admin@heiwa.house'
            })
          };
        }
        return {
          ok: true,
          json: async () => ({ status: 'ready', recentDeletions: [] })
        };
      }

      return originalFetch(url, options);
    };
  });

  // Mock toast notifications
  await page.addInitScript(() => {
    (window as any).toast = {
      success: (message: string) => console.log('Toast success:', message),
      error: (message: string) => console.log('Toast error:', message)
    };
  });
});

test.describe('GDPR Compliance Tools (COMPLIANCE-001)', () => {
  test('should render compliance page with data export and erasure tools', async ({ page }) => {
    await page.goto('/admin/compliance');
    await page.waitForLoadState('networkidle');

    // Verify main compliance page elements
    await expect(page.locator('text=GDPR Compliance')).toBeVisible();
    await expect(page.locator('text=Data Protection & Privacy')).toBeVisible();

    // Verify data export section
    await expect(page.locator('text=Data Export')).toBeVisible();
    await expect(page.locator('[data-testid="data-export"]')).toBeVisible();

    // Verify data erasure section
    await expect(page.locator('text=Right to Erasure')).toBeVisible();
    await expect(page.locator('[data-testid="data-erasure"]')).toBeVisible();

    // Verify compliance information
    await expect(page.locator('text=GDPR Rights & Compliance')).toBeVisible();
  });

  test('should handle data export functionality', async ({ page }) => {
    await page.goto('/admin/compliance');
    await page.waitForLoadState('networkidle');

    // Click on data export button
    await page.locator('[data-testid="data-export"]').click();

    // Verify export dialog/form appears
    await expect(page.locator('text=Export Client Data')).toBeVisible();

    // Fill in client email
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill('john.doe@example.com');

    // Fill in request reason
    const reasonInput = page.locator('textarea').first();
    await reasonInput.fill('Client requested data export for GDPR compliance');

    // Submit export request
    await page.locator('button:has-text("Export Data")').click();

    // Verify processing state
    await expect(page.locator('text=Processing...')).toBeVisible();

    // Wait for completion
    await page.waitForTimeout(2000);

    // Verify success (in real scenario, file would be downloaded)
    // The mock will simulate successful export
  });

  test('should validate data export form inputs', async ({ page }) => {
    await page.goto('/admin/compliance');
    await page.waitForLoadState('networkidle');

    // Click on data export button
    await page.locator('[data-testid="data-export"]').click();

    // Try to submit without email
    await page.locator('button:has-text("Export Data")').click();

    // Should show validation error
    await expect(page.locator('text=Client email is required')).toBeVisible();

    // Fill invalid email
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill('invalid-email');

    await page.locator('button:has-text("Export Data")').click();

    // Should show email validation error
    await expect(page.locator('text=Invalid email format')).toBeVisible();
  });

  test('should handle data erasure functionality', async ({ page }) => {
    await page.goto('/admin/compliance');
    await page.waitForLoadState('networkidle');

    // Click on data erasure button
    await page.locator('[data-testid="data-erasure"]').click();

    // Verify erasure dialog appears
    await expect(page.locator('text=Erase Client Data')).toBeVisible();
    await expect(page.locator('text=Irreversible Action')).toBeVisible();

    // Fill in client email
    const emailInput = page.locator('input[type="email"]').last();
    await emailInput.fill('john.doe@example.com');

    // Fill in erasure reason
    const reasonInput = page.locator('textarea').last();
    await reasonInput.fill('Client requested account deletion under GDPR Article 17');

    // Fill in confirmation text
    const confirmationInput = page.locator('input[placeholder="DELETE"]');
    await confirmationInput.fill('DELETE');

    // Submit erasure request
    await page.locator('button:has-text("Erase Data")').click();

    // Verify processing state
    await expect(page.locator('text=Processing...')).toBeVisible();

    // Wait for completion
    await page.waitForTimeout(2000);

    // Verify success message would appear
    // The mock will simulate successful deletion
  });

  test('should validate data erasure confirmation', async ({ page }) => {
    await page.goto('/admin/compliance');
    await page.waitForLoadState('networkidle');

    // Click on data erasure button
    await page.locator('[data-testid="data-erasure"]').click();

    // Fill in email and reason but wrong confirmation
    const emailInput = page.locator('input[type="email"]').last();
    await emailInput.fill('john.doe@example.com');

    const reasonInput = page.locator('textarea').last();
    await reasonInput.fill('Test deletion');

    const confirmationInput = page.locator('input[placeholder="DELETE"]');
    await confirmationInput.fill('WRONG');

    // Button should be disabled
    const eraseButton = page.locator('button:has-text("Erase Data")');
    await expect(eraseButton).toBeDisabled();

    // Fill correct confirmation
    await confirmationInput.clear();
    await confirmationInput.fill('DELETE');

    // Button should now be enabled
    await expect(eraseButton).toBeEnabled();
  });

  test('should display GDPR compliance information', async ({ page }) => {
    await page.goto('/admin/compliance');
    await page.waitForLoadState('networkidle');

    // Verify GDPR rights information
    await expect(page.locator('text=Data Subject Rights')).toBeVisible();
    await expect(page.locator('text=Right to Access')).toBeVisible();
    await expect(page.locator('text=Right to Rectification')).toBeVisible();
    await expect(page.locator('text=Right to Erasure')).toBeVisible();
    await expect(page.locator('text=Right to Data Portability')).toBeVisible();

    // Verify compliance status indicators
    await expect(page.locator('text=Compliance Status')).toBeVisible();
    await expect(page.locator('text=Data Export Tool')).toBeVisible();
    await expect(page.locator('text=Data Erasure Tool')).toBeVisible();
  });

  test('should handle admin-only access', async ({ page }) => {
    // Mock non-admin user
    await page.addInitScript(() => {
      (window as any).__mockAuth = {
        user: {
          uid: 'client_123',
          email: 'client@example.com',
          displayName: 'Regular Client'
        },
        loading: false
      };
    });

    // Mock API to return 401 for non-admin
    await page.route('**/api/gdpr/**', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Admin authentication required' })
      });
    });

    await page.goto('/admin/compliance');
    await page.waitForLoadState('networkidle');

    // Try to use export tool
    await page.locator('[data-testid="data-export"]').click();
    
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill('test@example.com');
    
    await page.locator('button:has-text("Export Data")').click();

    // Should show authentication error
    await expect(page.locator('text=Admin authentication required')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/gdpr/export', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/admin/compliance');
    await page.waitForLoadState('networkidle');

    // Try to export data
    await page.locator('[data-testid="data-export"]').click();
    
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill('test@example.com');
    
    await page.locator('button:has-text("Export Data")').click();

    // Should show error message
    await expect(page.locator('text=Failed to export data')).toBeVisible();
  });

  test('should handle client not found scenario', async ({ page }) => {
    // Mock client not found response
    await page.route('**/api/gdpr/export', async route => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Client not found' })
      });
    });

    await page.goto('/admin/compliance');
    await page.waitForLoadState('networkidle');

    // Try to export data for non-existent client
    await page.locator('[data-testid="data-export"]').click();
    
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill('nonexistent@example.com');
    
    await page.locator('button:has-text("Export Data")').click();

    // Should show client not found error
    await expect(page.locator('text=Client not found')).toBeVisible();
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/admin/compliance');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=GDPR Compliance')).toBeVisible();

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid="data-export"]')).toBeVisible();
    await expect(page.locator('[data-testid="data-erasure"]')).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('text=GDPR Compliance')).toBeVisible();
  });

  test('should take snapshot for visual regression', async ({ page }) => {
    await page.goto('/admin/compliance');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Take screenshot of the compliance page
    await expect(page.locator('body')).toHaveScreenshot('compliance-page.png');
  });
});
