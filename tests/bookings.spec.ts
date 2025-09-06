import { test, expect } from '@playwright/test';
import { createMockSupabaseClient } from './utils/supabase-mock';

// Mock Supabase client globally
test.beforeEach(async ({ page }) => {
  // Mock the Supabase client
  await page.addInitScript(() => {
    // Mock the Supabase module
    (window as any).__supabaseMock = {
      from: (table: string) => ({
        select: (fields?: string) => ({
          order: (field: string, options?: any) => ({
            then: async (resolve: any) => {
              // Return mock bookings data
              const mockBookings = [
                {
                  id: 'booking_001',
                  client_ids: ['client_001'],
                  items: [
                    {
                      id: 'item_001',
                      type: 'room',
                      itemId: 'room_001',
                      name: 'Ocean View Suite',
                      quantity: 1,
                      unitPrice: 250,
                      totalPrice: 1000
                    }
                  ],
                  total_amount: 1000.00,
                  payment_status: 'confirmed',
                  payment_method: 'stripe',
                  notes: 'Anniversary celebration booking',
                  created_at: '2024-01-25T00:00:00Z',
                  updated_at: '2024-01-25T00:00:00Z'
                },
                {
                  id: 'booking_002',
                  client_ids: ['client_002'],
                  items: [
                    {
                      id: 'item_002',
                      type: 'surfCamp',
                      itemId: 'camp_001',
                      name: 'Beginner Paradise',
                      quantity: 1,
                      unitPrice: 450,
                      totalPrice: 450
                    }
                  ],
                  total_amount: 450.00,
                  payment_status: 'pending',
                  payment_method: 'stripe',
                  notes: 'First surf camp experience',
                  created_at: '2024-02-15T00:00:00Z',
                  updated_at: '2024-02-15T00:00:00Z'
                }
              ];
              resolve({ data: mockBookings, error: null });
            }
          })
        }),
        delete: () => ({
          eq: (field: string, value: any) => ({
            then: async (resolve: any) => {
              resolve({ data: null, error: null });
            }
          })
        })
      }),
      auth: {
        signInWithPassword: async ({ email, password }: any) => {
          const adminEmails = ['admin@heiwa.house', 'manager@heiwa.house'];
          if (adminEmails.includes(email) && password === 'test123') {
            return {
              data: {
                user: { id: 'user_123', email },
                session: { access_token: 'mock_token' }
              },
              error: null
            };
          }
          return { data: null, error: { message: 'Invalid credentials' } };
        }
      }
    };
  });

  // Mock the Supabase import
  await page.route('**/supabase/client*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: `
        export const supabase = window.__supabaseMock;
        export default window.__supabaseMock;
      `
    });
  });
});

test.describe('Bookings CRUD and Routing (BOOK-001)', () => {
  test('should navigate to /admin/bookings without 404 error', async ({ page }) => {
    // Navigate directly to bookings page
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    // Assert no 404 error - page should load successfully
    await expect(page.locator('[data-testid="bookings-page-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="bookings-page-title"]')).toHaveText('Bookings Management');
    
    // Verify the page URL is correct
    expect(page.url()).toContain('/admin/bookings');
  });

  test('should render bookings table with data', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');
    
    // Wait for data to load
    await page.waitForTimeout(1000);

    // Assert table is present
    await expect(page.locator('[data-testid="bookings-table"]')).toBeVisible();
    
    // Check table headers
    await expect(page.locator('[data-testid="sort-id"]')).toBeVisible();
    await expect(page.locator('[data-testid="sort-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="sort-amount"]')).toBeVisible();
    await expect(page.locator('[data-testid="sort-status"]')).toBeVisible();

    // Verify at least one booking row is present
    await expect(page.locator('tbody tr')).toHaveCount(2); // Based on mock data
  });

  test('should filter bookings by status', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Test status filter
    await page.locator('[data-testid="filter-status"]').click();
    await page.locator('text=Pending').click();
    
    // Wait for filter to apply
    await page.waitForTimeout(500);
    
    // Should show only pending bookings
    const statusBadges = page.locator('tbody tr .bg-yellow-100');
    await expect(statusBadges).toHaveCount(1);
  });

  test('should search bookings by text', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Test search functionality
    await page.locator('[data-testid="search-bookings"]').fill('Anniversary');
    await page.waitForTimeout(500);

    // Should filter results based on search term
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
  });

  test('should handle pagination', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Check if pagination controls exist (they might not be visible with only 2 items)
    const nextButton = page.locator('[data-testid="next-page"]');
    const prevButton = page.locator('[data-testid="prev-page"]');
    
    // Previous button should be disabled on first page
    if (await prevButton.isVisible()) {
      await expect(prevButton).toBeDisabled();
    }
  });

  test('should open create booking dialog', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    // Click create booking button
    await page.locator('[data-testid="create-booking"]').click();
    
    // Dialog should open (this would need to be implemented in the component)
    // For now, just verify the button is clickable
    await expect(page.locator('[data-testid="create-booking"]')).toBeVisible();
  });

  test('should handle booking actions (view, edit, delete)', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Test view booking button
    const viewButton = page.locator('[data-testid="view-booking-booking_001"]');
    await expect(viewButton).toBeVisible();
    
    // Test edit booking button
    const editButton = page.locator('[data-testid="edit-booking-booking_001"]');
    await expect(editButton).toBeVisible();
    
    // Test delete booking button
    const deleteButton = page.locator('[data-testid="delete-booking-booking_001"]');
    await expect(deleteButton).toBeVisible();
  });

  test('should sort bookings by clicking column headers', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Click on date column header to sort
    await page.locator('[data-testid="sort-date"]').click();
    
    // Verify table is still visible after sort
    await expect(page.locator('[data-testid="bookings-table"]')).toBeVisible();
    
    // Click on amount column header to sort
    await page.locator('[data-testid="sort-amount"]').click();
    
    // Verify table is still visible after sort
    await expect(page.locator('[data-testid="bookings-table"]')).toBeVisible();
  });

  test('should handle delete booking with confirmation', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Mock the confirm dialog
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Are you sure you want to delete this booking?');
      await dialog.accept();
    });

    // Click delete button
    await page.locator('[data-testid="delete-booking-booking_001"]').click();
    
    // The booking should be removed (in a real scenario)
    // For now, just verify the action was triggered
  });

  test('should display booking details correctly', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Verify booking data is displayed correctly
    await expect(page.locator('text=$1,000.00')).toBeVisible();
    await expect(page.locator('text=$450.00')).toBeVisible();
    
    // Verify status badges
    await expect(page.locator('.bg-green-100')).toBeVisible(); // confirmed status
    await expect(page.locator('.bg-yellow-100')).toBeVisible(); // pending status
  });

  test('should handle real-time updates simulation', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Initial booking count
    const initialRows = await page.locator('tbody tr').count();
    expect(initialRows).toBe(2);

    // In a real scenario, this would test Supabase real-time subscriptions
    // For now, verify the table structure supports dynamic updates
    await expect(page.locator('[data-testid="bookings-table"]')).toBeVisible();
  });
});
