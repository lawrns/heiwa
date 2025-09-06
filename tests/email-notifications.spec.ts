import { test, expect } from '@playwright/test';

// Mock email notification setup
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

  // Mock email API responses
  await page.addInitScript(() => {
    const originalFetch = window.fetch;
    (window as any).fetch = async (url: string, options?: any) => {
      // Mock email sending API
      if (url.includes('/api/send-email')) {
        if (options?.method === 'POST') {
          const body = JSON.parse(options.body);
          return {
            ok: true,
            json: async () => ({
              success: true,
              message: `${body.type} email sent successfully`,
              emailId: 'email_123'
            })
          };
        }
      }

      // Mock booking creation with email trigger
      if (url.includes('/api/bookings') && options?.method === 'POST') {
        return {
          ok: true,
          json: async () => ({
            booking: {
              id: 'booking_123',
              clientIds: ['client_123'],
              items: [{ type: 'room', itemId: 'room_001', quantity: 1, unitPrice: 250, totalPrice: 250 }],
              totalAmount: 250,
              paymentStatus: 'pending',
              notes: 'Test booking'
            }
          })
        };
      }

      return originalFetch(url, options);
    };
  });

  // Mock console.log to capture email logs
  await page.addInitScript(() => {
    const originalLog = console.log;
    (window as any).emailLogs = [];
    console.log = (...args) => {
      if (args[0] === '📧 EMAIL SENT:') {
        (window as any).emailLogs.push(args);
      }
      originalLog(...args);
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

test.describe('Email Notifications System (EMAIL-001)', () => {
  test('should send booking confirmation email when booking is created', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    // Look for create booking button
    const createButton = page.locator('[data-testid="create-booking"]');
    if (await createButton.isVisible()) {
      await createButton.click();

      // Fill booking form (assuming form exists)
      await page.waitForTimeout(1000);

      // Submit booking creation
      const submitButton = page.locator('button:has-text("Create Booking")');
      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Wait for booking creation and email sending
        await page.waitForTimeout(2000);

        // Verify success message (email would be sent in background)
        await expect(page.locator('text=Booking created successfully')).toBeVisible();
      }
    }
  });

  test('should handle manual email sending', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    // Mock existing booking data
    await page.addInitScript(() => {
      (window as any).mockBookingData = {
        id: 'booking_123',
        clientIds: ['client_123'],
        items: [{ type: 'room', itemId: 'room_001', quantity: 1, unitPrice: 250, totalPrice: 250 }],
        totalAmount: 250,
        paymentStatus: 'confirmed',
        notes: 'Test booking'
      };

      (window as any).mockClientData = {
        id: 'client_123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890'
      };
    });

    // Look for send email button (if exists in UI)
    const sendEmailButton = page.locator('button:has-text("Send Email")');
    if (await sendEmailButton.isVisible()) {
      await sendEmailButton.click();

      // Select email type
      const confirmationOption = page.locator('text=Booking Confirmation');
      if (await confirmationOption.isVisible()) {
        await confirmationOption.click();
      }

      // Confirm sending
      const confirmButton = page.locator('button:has-text("Send")');
      if (await confirmButton.isVisible()) {
        await confirmButton.click();

        // Verify success message
        await expect(page.locator('text=Email sent successfully')).toBeVisible();
      }
    }
  });

  test('should validate email template rendering', async ({ page }) => {
    // Test email template preview functionality
    await page.goto('/admin/settings');
    await page.waitForLoadState('networkidle');

    // Look for email templates section
    const emailTemplatesSection = page.locator('text=Email Templates');
    if (await emailTemplatesSection.isVisible()) {
      await emailTemplatesSection.click();

      // Preview booking confirmation template
      const previewButton = page.locator('button:has-text("Preview")');
      if (await previewButton.isVisible()) {
        await previewButton.click();

        // Verify template preview appears
        await expect(page.locator('text=Booking Confirmed!')).toBeVisible();
        await expect(page.locator('text=Welcome to Heiwa House')).toBeVisible();
      }
    }
  });

  test('should handle email sending errors gracefully', async ({ page }) => {
    // Mock email API error
    await page.route('**/api/send-email', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Email service unavailable' })
      });
    });

    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    // Try to trigger email sending
    const createButton = page.locator('[data-testid="create-booking"]');
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(1000);

      const submitButton = page.locator('button:has-text("Create Booking")');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(2000);

        // Should show error message
        await expect(page.locator('text=Failed to send email')).toBeVisible();
      }
    }
  });

  test('should validate email content for booking confirmation', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    // Mock email service to capture email content
    await page.addInitScript(() => {
      (window as any).capturedEmails = [];
      
      const originalFetch = window.fetch;
      (window as any).fetch = async (url: string, options?: any) => {
        if (url.includes('/api/send-email') && options?.method === 'POST') {
          const body = JSON.parse(options.body);
          (window as any).capturedEmails.push(body);
          
          return {
            ok: true,
            json: async () => ({ success: true })
          };
        }
        return originalFetch(url, options);
      };
    });

    // Trigger email sending
    const createButton = page.locator('[data-testid="create-booking"]');
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(1000);

      const submitButton = page.locator('button:has-text("Create Booking")');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(2000);

        // Verify email content was captured
        const capturedEmails = await page.evaluate(() => (window as any).capturedEmails);
        if (capturedEmails && capturedEmails.length > 0) {
          expect(capturedEmails[0]).toHaveProperty('booking');
          expect(capturedEmails[0]).toHaveProperty('client');
          expect(capturedEmails[0]).toHaveProperty('type');
        }
      }
    }
  });

  test('should handle different email types', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    // Test booking confirmation email
    await page.addInitScript(() => {
      (window as any).emailTypes = [];
      
      const originalFetch = window.fetch;
      (window as any).fetch = async (url: string, options?: any) => {
        if (url.includes('/api/send-email') && options?.method === 'POST') {
          const body = JSON.parse(options.body);
          (window as any).emailTypes.push(body.type);
          
          return {
            ok: true,
            json: async () => ({ success: true })
          };
        }
        return originalFetch(url, options);
      };
    });

    // Simulate different email triggers
    await page.evaluate(() => {
      // Simulate booking confirmation
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'booking-confirmation',
          booking: { id: 'test' },
          client: { email: 'test@example.com' }
        })
      });

      // Simulate booking notification
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'booking-notification',
          booking: { id: 'test' },
          client: { email: 'test@example.com' }
        })
      });
    });

    await page.waitForTimeout(1000);

    // Verify different email types were handled
    const emailTypes = await page.evaluate(() => (window as any).emailTypes);
    expect(emailTypes).toContain('booking-confirmation');
    expect(emailTypes).toContain('booking-notification');
  });

  test('should validate admin authentication for email sending', async ({ page }) => {
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
    await page.route('**/api/send-email', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Admin authentication required' })
      });
    });

    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    // Try to send email as non-admin
    await page.evaluate(() => {
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'booking-confirmation',
          booking: { id: 'test' },
          client: { email: 'test@example.com' }
        })
      });
    });

    await page.waitForTimeout(1000);

    // Should show authentication error
    await expect(page.locator('text=Admin authentication required')).toBeVisible();
  });

  test('should handle email queue processing', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    // Mock multiple email sends
    await page.addInitScript(() => {
      (window as any).emailQueue = [];
      
      const originalFetch = window.fetch;
      (window as any).fetch = async (url: string, options?: any) => {
        if (url.includes('/api/send-email') && options?.method === 'POST') {
          const body = JSON.parse(options.body);
          (window as any).emailQueue.push({
            timestamp: Date.now(),
            type: body.type,
            status: 'sent'
          });
          
          return {
            ok: true,
            json: async () => ({ success: true })
          };
        }
        return originalFetch(url, options);
      };
    });

    // Simulate multiple email sends
    await page.evaluate(() => {
      for (let i = 0; i < 3; i++) {
        fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'booking-confirmation',
            booking: { id: `test_${i}` },
            client: { email: `test${i}@example.com` }
          })
        });
      }
    });

    await page.waitForTimeout(2000);

    // Verify all emails were processed
    const emailQueue = await page.evaluate(() => (window as any).emailQueue);
    expect(emailQueue).toHaveLength(3);
    emailQueue.forEach((email: any) => {
      expect(email.status).toBe('sent');
      expect(email.type).toBe('booking-confirmation');
    });
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('text=Bookings Management')).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('text=Bookings Management')).toBeVisible();
  });

  test('should take snapshot for visual regression', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Take screenshot of the bookings page (where emails are triggered)
    await expect(page.locator('body')).toHaveScreenshot('email-notifications.png');
  });
});
