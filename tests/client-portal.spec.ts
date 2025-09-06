import { test, expect } from '@playwright/test';

// Mock authentication and data setup
test.beforeEach(async ({ page }) => {
  // Mock authentication state
  await page.addInitScript(() => {
    // Mock AuthProvider context
    (window as any).__mockAuth = {
      user: {
        uid: 'client_123',
        email: 'john.doe@example.com',
        displayName: 'John Doe'
      },
      loading: false,
      signOut: async () => {
        (window as any).__mockAuth.user = null;
        return Promise.resolve();
      }
    };

    // Mock API responses
    const originalFetch = window.fetch;
    (window as any).fetch = async (url: string, options?: any) => {
      // Mock client bookings API
      if (url.includes('/api/bookings/client')) {
        if (options?.method === 'PUT') {
          return {
            ok: true,
            json: async () => ({
              booking: {
                id: 'booking_001',
                clientIds: ['client_123'],
                items: [{ id: 'item_001', name: 'Beginner Paradise', type: 'surfCamp' }],
                totalAmount: 450,
                paymentStatus: 'confirmed',
                notes: 'Updated notes',
                createdAt: new Date(),
                updatedAt: new Date()
              }
            })
          };
        }
        return {
          ok: true,
          json: async () => ({
            bookings: [
              {
                id: 'booking_001',
                clientIds: ['client_123'],
                items: [
                  {
                    id: 'item_001',
                    type: 'surfCamp',
                    name: 'Beginner Paradise',
                    quantity: 1,
                    unitPrice: 450,
                    totalPrice: 450,
                    startDate: '2024-03-01',
                    endDate: '2024-03-07'
                  }
                ],
                totalAmount: 450,
                paymentStatus: 'confirmed',
                paymentMethod: 'stripe',
                notes: 'First surf camp experience',
                createdAt: new Date('2024-02-15'),
                updatedAt: new Date('2024-02-15')
              }
            ]
          })
        };
      }

      // Mock client profile API
      if (url.includes('/api/client/profile')) {
        if (options?.method === 'PUT') {
          return {
            ok: true,
            json: async () => ({
              profile: {
                id: 'client_123',
                name: 'John Doe Updated',
                email: 'john.doe@example.com',
                phone: '+1234567890',
                surfLevel: 'intermediate',
                updatedAt: new Date()
              }
            })
          };
        }
        return {
          ok: true,
          json: async () => ({
            profile: {
              id: 'client_123',
              name: 'John Doe',
              email: 'john.doe@example.com',
              phone: '+1234567890',
              location: 'San Francisco, CA',
              surfLevel: 'intermediate',
              emergencyContact: 'Jane Doe',
              emergencyPhone: '+1987654321',
              dietaryRestrictions: 'Vegetarian',
              medicalConditions: '',
              notes: 'Loves early morning sessions',
              createdAt: new Date('2023-01-15'),
              updatedAt: new Date('2024-02-20')
            }
          })
        };
      }

      // Mock payments API
      if (url.includes('/api/payments/create-checkout-session')) {
        return {
          ok: true,
          json: async () => ({
            sessionId: 'cs_test_mock_session_123',
            url: '/checkout/success'
          })
        };
      }

      return originalFetch(url, options);
    };
  });

  // Mock React components that might not be available
  await page.addInitScript(() => {
    // Mock toast notifications
    (window as any).toast = {
      success: (message: string) => console.log('Toast success:', message),
      error: (message: string) => console.log('Toast error:', message)
    };
  });
});

test.describe('Client Portal (CLIENT-001, CLIENT-002, AUTH-003)', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Mock unauthenticated state
    await page.addInitScript(() => {
      (window as any).__mockAuth = {
        user: null,
        loading: false,
        signOut: async () => Promise.resolve()
      };
    });

    await page.goto('/client');
    
    // Should redirect to auth page
    await page.waitForURL('**/client/auth**', { timeout: 5000 });
    expect(page.url()).toContain('/client/auth');
  });

  test('should render client portal with tabs for authenticated user', async ({ page }) => {
    await page.goto('/client');
    await page.waitForLoadState('networkidle');

    // Verify main portal elements
    await expect(page.locator('text=Welcome to Your Portal')).toBeVisible();
    await expect(page.locator('text=Welcome, John Doe!')).toBeVisible();

    // Verify tabs are present
    await expect(page.locator('[data-testid="bookings-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="payments-tab"]')).toBeVisible();

    // Verify default tab (bookings) is active
    await expect(page.locator('[data-testid="bookings-tab"]')).toHaveAttribute('data-state', 'active');
  });

  test('should switch between tabs correctly', async ({ page }) => {
    await page.goto('/client');
    await page.waitForLoadState('networkidle');

    // Start on bookings tab
    await expect(page.locator('text=My Bookings')).toBeVisible();

    // Switch to profile tab
    await page.locator('[data-testid="profile-tab"]').click();
    await expect(page.locator('text=Profile Settings')).toBeVisible();
    await expect(page.locator('[data-testid="profile-tab"]')).toHaveAttribute('data-state', 'active');

    // Switch to payments tab
    await page.locator('[data-testid="payments-tab"]').click();
    await expect(page.locator('text=Payment History')).toBeVisible();
    await expect(page.locator('[data-testid="payments-tab"]')).toHaveAttribute('data-state', 'active');

    // Switch back to bookings
    await page.locator('[data-testid="bookings-tab"]').click();
    await expect(page.locator('text=My Bookings')).toBeVisible();
  });

  test('should display and edit bookings', async ({ page }) => {
    await page.goto('/client');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Wait for data to load

    // Verify booking is displayed
    await expect(page.locator('text=Beginner Paradise')).toBeVisible();
    await expect(page.locator('text=$450')).toBeVisible();
    await expect(page.locator('text=Confirmed')).toBeVisible();

    // Click edit button
    await page.locator('[data-testid="edit-booking-booking_001"]').click();

    // Verify edit dialog opens
    await expect(page.locator('text=Edit Booking')).toBeVisible();

    // Update notes
    await page.locator('textarea[placeholder*="Add any special requests"]').fill('Updated booking notes');

    // Submit form
    await page.locator('text=Save Changes').click();

    // Verify success (dialog should close)
    await expect(page.locator('text=Edit Booking')).not.toBeVisible();
  });

  test('should display and update profile information', async ({ page }) => {
    await page.goto('/client');
    await page.waitForLoadState('networkidle');

    // Switch to profile tab
    await page.locator('[data-testid="profile-tab"]').click();
    await page.waitForTimeout(1000); // Wait for profile data to load

    // Verify profile information is displayed
    await expect(page.locator('input[value="John Doe"]')).toBeVisible();
    await expect(page.locator('input[value="john.doe@example.com"]')).toBeVisible();
    await expect(page.locator('input[value="+1234567890"]')).toBeVisible();

    // Click edit profile button
    await page.locator('[data-testid="edit-profile-button"]').click();

    // Update name
    await page.locator('input[id="name"]').clear();
    await page.locator('input[id="name"]').fill('John Doe Updated');

    // Submit form
    await page.locator('text=Save Changes').click();

    // Wait for form to be saved
    await page.waitForTimeout(2000);

    // Verify edit mode is disabled
    await expect(page.locator('[data-testid="edit-profile-button"]')).toBeVisible();
  });

  test('should handle profile form validation', async ({ page }) => {
    await page.goto('/client');
    await page.waitForLoadState('networkidle');

    // Switch to profile tab and edit
    await page.locator('[data-testid="profile-tab"]').click();
    await page.waitForTimeout(1000);
    await page.locator('[data-testid="edit-profile-button"]').click();

    // Clear required field
    await page.locator('input[id="name"]').clear();

    // Try to submit
    await page.locator('text=Save Changes').click();

    // Verify error message appears
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('text=Name is required')).toBeVisible();
  });

  test('should display payment history and handle payments', async ({ page }) => {
    await page.goto('/client');
    await page.waitForLoadState('networkidle');

    // Switch to payments tab
    await page.locator('[data-testid="payments-tab"]').click();
    await page.waitForTimeout(1000);

    // Verify payment history section
    await expect(page.locator('text=Payment History')).toBeVisible();

    // Check for pending payments section if any
    const pendingPayments = page.locator('text=Pending Payments');
    if (await pendingPayments.isVisible()) {
      // Test pay button functionality
      const payButton = page.locator('[data-testid="pay-button"]').first();
      if (await payButton.isVisible()) {
        await payButton.click();
        
        // Verify processing state
        await expect(page.locator('text=Processing...')).toBeVisible();
      }
    }

    // Verify payment summary cards
    await expect(page.locator('text=Total Paid')).toBeVisible();
    await expect(page.locator('text=Pending')).toBeVisible();
    await expect(page.locator('text=Total Transactions')).toBeVisible();
  });

  test('should handle sign out functionality', async ({ page }) => {
    await page.goto('/client');
    await page.waitForLoadState('networkidle');

    // Click sign out button
    await page.locator('text=Sign Out').click();

    // Should redirect to auth page
    await page.waitForURL('**/client/auth**', { timeout: 5000 });
    expect(page.url()).toContain('/client/auth');
  });

  test('should display quick stats correctly', async ({ page }) => {
    await page.goto('/client');
    await page.waitForLoadState('networkidle');

    // Verify quick stats cards
    await expect(page.locator('text=Active Bookings')).toBeVisible();
    await expect(page.locator('text=Total Spent')).toBeVisible();
    await expect(page.locator('text=Surf Level')).toBeVisible();

    // Verify stats have values
    await expect(page.locator('text=2').first()).toBeVisible(); // Active bookings
    await expect(page.locator('text=$2,450')).toBeVisible(); // Total spent
    await expect(page.locator('text=Intermediate')).toBeVisible(); // Surf level
  });

  test('should handle quick actions', async ({ page }) => {
    await page.goto('/client');
    await page.waitForLoadState('networkidle');

    // Verify quick actions section
    await expect(page.locator('text=Quick Actions')).toBeVisible();

    // Test quick action buttons
    await page.locator('text=View Bookings').click();
    await expect(page.locator('[data-testid="bookings-tab"]')).toHaveAttribute('data-state', 'active');

    await page.locator('text=Edit Profile').click();
    await expect(page.locator('[data-testid="profile-tab"]')).toHaveAttribute('data-state', 'active');

    await page.locator('text=View Payments').click();
    await expect(page.locator('[data-testid="payments-tab"]')).toHaveAttribute('data-state', 'active');
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/client');
    await page.waitForLoadState('networkidle');

    // Verify mobile layout
    await expect(page.locator('text=Welcome to Your Portal')).toBeVisible();
    
    // Tabs should stack on mobile
    await expect(page.locator('[data-testid="bookings-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="payments-tab"]')).toBeVisible();

    // Test tab switching on mobile
    await page.locator('[data-testid="profile-tab"]').click();
    await expect(page.locator('text=Profile Settings')).toBeVisible();
  });

  test('should take snapshot for visual regression', async ({ page }) => {
    await page.goto('/client');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Take screenshot of the client portal
    await expect(page.locator('body')).toHaveScreenshot('client-portal.png');
  });
});
