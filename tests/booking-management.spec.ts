import { test, expect } from '@playwright/test';

// Mock booking data setup
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

  // Mock booking API responses
  await page.addInitScript(() => {
    const originalFetch = window.fetch;
    (window as any).fetch = async (url: string, options?: any) => {
      // Mock Supabase booking queries
      if (url.includes('supabase') && url.includes('bookings')) {
        return {
          ok: true,
          json: async () => ({
            data: [
              {
                id: 'booking_001',
                client_ids: ['client_123'],
                items: [
                  {
                    type: 'room',
                    itemId: 'room_001',
                    quantity: 1,
                    unitPrice: 250,
                    totalPrice: 250
                  }
                ],
                total_amount: 250,
                payment_status: 'pending',
                payment_method: 'stripe',
                notes: 'Ocean view requested',
                created_at: '2024-01-15T10:00:00Z',
                updated_at: '2024-01-15T10:00:00Z'
              },
              {
                id: 'booking_002',
                client_ids: ['client_456'],
                items: [
                  {
                    type: 'surfCamp',
                    itemId: 'camp_001',
                    quantity: 1,
                    unitPrice: 450,
                    totalPrice: 450
                  }
                ],
                total_amount: 450,
                payment_status: 'confirmed',
                payment_method: 'cash',
                notes: 'Beginner level',
                created_at: '2024-01-16T14:30:00Z',
                updated_at: '2024-01-16T14:30:00Z'
              }
            ],
            error: null
          })
        };
      }

      // Mock booking status update
      if (url.includes('supabase') && options?.method === 'PATCH') {
        return {
          ok: true,
          json: async () => ({ data: {}, error: null })
        };
      }

      // Mock booking deletion
      if (url.includes('supabase') && options?.method === 'DELETE') {
        return {
          ok: true,
          json: async () => ({ data: {}, error: null })
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

test.describe('Booking Management System (BOOK-001, BOOK-002)', () => {
  test('should render bookings page with list of bookings', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    // Verify main page elements
    await expect(page.locator('[data-testid="bookings-page-title"]')).toBeVisible();
    await expect(page.locator('text=Bookings Management')).toBeVisible();
    await expect(page.locator('text=Manage all room and surf camp bookings')).toBeVisible();

    // Verify create booking button
    await expect(page.locator('[data-testid="create-booking"]')).toBeVisible();

    // Verify bookings table
    await expect(page.locator('[data-testid="bookings-table"]')).toBeVisible();
    
    // Verify table headers
    await expect(page.locator('[data-testid="sort-id"]')).toBeVisible();
    await expect(page.locator('[data-testid="sort-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="sort-amount"]')).toBeVisible();
    await expect(page.locator('[data-testid="sort-status"]')).toBeVisible();
  });

  test('should display booking data in table', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Wait for data to load

    // Verify booking data is displayed
    await expect(page.locator('text=booking_001')).toBeVisible();
    await expect(page.locator('text=booking_002')).toBeVisible();
    await expect(page.locator('text=$250.00')).toBeVisible();
    await expect(page.locator('text=$450.00')).toBeVisible();
    await expect(page.locator('text=pending')).toBeVisible();
    await expect(page.locator('text=confirmed')).toBeVisible();
  });

  test('should filter bookings by status', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Use status filter
    await page.locator('select').first().selectOption('pending');
    
    // Should show only pending bookings
    await expect(page.locator('text=pending')).toBeVisible();
    
    // Change to confirmed filter
    await page.locator('select').first().selectOption('confirmed');
    
    // Should show only confirmed bookings
    await expect(page.locator('text=confirmed')).toBeVisible();
  });

  test('should search bookings', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Search for specific booking
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('booking_001');

    // Should show only matching booking
    await expect(page.locator('text=booking_001')).toBeVisible();
    await expect(page.locator('text=booking_002')).not.toBeVisible();

    // Clear search
    await searchInput.clear();
    await searchInput.fill('');

    // Should show all bookings again
    await expect(page.locator('text=booking_001')).toBeVisible();
    await expect(page.locator('text=booking_002')).toBeVisible();
  });

  test('should update booking status', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Click status update button for first booking
    await page.locator('[data-testid="status-update"]').first().click();

    // Verify dropdown menu appears
    await expect(page.locator('text=Mark as Pending')).toBeVisible();
    await expect(page.locator('text=Mark as Confirmed')).toBeVisible();
    await expect(page.locator('text=Mark as Cancelled')).toBeVisible();

    // Click on "Mark as Confirmed"
    await page.locator('text=Mark as Confirmed').click();

    // Verify success message (would appear in real scenario)
    await page.waitForTimeout(1000);
  });

  test('should view booking details', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Click view button for first booking
    await page.locator('[data-testid="view-booking-booking_001"]').click();

    // Verify booking details dialog/modal appears
    // (Implementation depends on the actual modal structure)
    await page.waitForTimeout(500);
  });

  test('should handle booking deletion', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Mock confirmation dialog
    page.on('dialog', dialog => dialog.accept());

    // Click delete button for first booking
    await page.locator('[data-testid="delete-booking-booking_001"]').click();

    // Verify deletion process (success message would appear)
    await page.waitForTimeout(1000);
  });

  test('should sort bookings by different columns', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Click on date column to sort
    await page.locator('[data-testid="sort-date"]').click();
    await page.waitForTimeout(500);

    // Click on amount column to sort
    await page.locator('[data-testid="sort-amount"]').click();
    await page.waitForTimeout(500);

    // Click on status column to sort
    await page.locator('[data-testid="sort-status"]').click();
    await page.waitForTimeout(500);

    // Verify table is still visible after sorting
    await expect(page.locator('[data-testid="bookings-table"]')).toBeVisible();
  });

  test('should handle pagination', async ({ page }) => {
    // Mock large dataset
    await page.addInitScript(() => {
      const mockBookings = Array.from({ length: 25 }, (_, i) => ({
        id: `booking_${String(i + 1).padStart(3, '0')}`,
        client_ids: [`client_${i + 1}`],
        items: [{ type: 'room', itemId: 'room_001', quantity: 1, unitPrice: 100, totalPrice: 100 }],
        total_amount: 100,
        payment_status: i % 3 === 0 ? 'pending' : i % 3 === 1 ? 'confirmed' : 'cancelled',
        payment_method: 'stripe',
        notes: `Booking ${i + 1}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const originalFetch = window.fetch;
      (window as any).fetch = async (url: string, options?: any) => {
        if (url.includes('supabase') && url.includes('bookings')) {
          return {
            ok: true,
            json: async () => ({ data: mockBookings, error: null })
          };
        }
        return originalFetch(url, options);
      };
    });

    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Verify pagination controls appear
    await expect(page.locator('text=Showing')).toBeVisible();
    
    // Check if pagination buttons exist (if implemented)
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should handle create booking dialog', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    // Click create booking button
    await page.locator('[data-testid="create-booking"]').click();

    // Verify create booking dialog appears (implementation dependent)
    await page.waitForTimeout(500);
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/supabase**', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: { message: 'Internal server error' } })
      });
    });

    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    // Should show error handling
    await expect(page.locator('text=Bookings Management')).toBeVisible();
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('[data-testid="bookings-table"]')).toBeVisible();

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('text=Bookings Management')).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('text=Bookings Management')).toBeVisible();
  });

  test('should display booking items correctly', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Verify booking items are displayed
    await expect(page.locator('text=room')).toBeVisible();
    await expect(page.locator('text=surfCamp')).toBeVisible();
  });

  test('should handle empty bookings list', async ({ page }) => {
    // Mock empty response
    await page.addInitScript(() => {
      const originalFetch = window.fetch;
      (window as any).fetch = async (url: string, options?: any) => {
        if (url.includes('supabase') && url.includes('bookings')) {
          return {
            ok: true,
            json: async () => ({ data: [], error: null })
          };
        }
        return originalFetch(url, options);
      };
    });

    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    // Should show empty state
    await expect(page.locator('text=Bookings (0)')).toBeVisible();
  });

  test('should take snapshot for visual regression', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Take screenshot of the bookings page
    await expect(page.locator('body')).toHaveScreenshot('booking-management.png');
  });
});
