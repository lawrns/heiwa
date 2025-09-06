import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // Mock Supabase authentication and client data
  await page.addInitScript(() => {
    // Mock authenticated admin user
    (window as any).__currentUser = {
      id: 'admin_123',
      email: 'admin@heiwa.house',
      role: 'admin'
    };

    // Mock Supabase client
    (window as any).supabase = {
      auth: {
        getSession: async () => ({
          data: { session: { user: (window as any).__currentUser } },
          error: null
        })
      },
      from: (table: string) => ({
        select: (columns?: string) => ({
          eq: (column: string, value: any) => ({
            single: async () => {
              if (table === 'clients') {
                return {
                  data: {
                    id: 'client_123',
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '+1234567890',
                    status: 'active',
                    created_at: '2024-01-01T00:00:00Z'
                  },
                  error: null
                };
              }
              return { data: null, error: null };
            }
          }),
          order: (column: string, options?: any) => ({
            range: (from: number, to: number) => ({
              async: async () => ({
                data: [
                  {
                    id: 'client_123',
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '+1234567890',
                    status: 'active',
                    created_at: '2024-01-01T00:00:00Z'
                  },
                  {
                    id: 'client_456',
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                    phone: '+0987654321',
                    status: 'active',
                    created_at: '2024-01-02T00:00:00Z'
                  }
                ],
                error: null,
                count: 2
              })
            })
          })
        }),
        insert: (data: any) => ({
          select: () => ({
            single: async () => ({
              data: { ...data, id: 'new_client_' + Date.now() },
              error: null
            })
          })
        }),
        update: (data: any) => ({
          eq: (column: string, value: any) => ({
            select: () => ({
              single: async () => ({
                data: { ...data, id: value },
                error: null
              })
            })
          })
        }),
        delete: () => ({
          eq: (column: string, value: any) => ({
            async: async () => ({ data: {}, error: null })
          })
        })
      })
    };

    // Mock fetch for API routes
    const originalFetch = window.fetch;
    (window as any).fetch = async (url: string, options?: any) => {
      if (url.includes('/api/clients')) {
        if (options?.method === 'POST') {
          return {
            ok: true,
            json: async () => ({
              success: true,
              data: { id: 'new_client_' + Date.now(), ...JSON.parse(options.body) }
            })
          };
        }
        if (options?.method === 'PUT') {
          return {
            ok: true,
            json: async () => ({
              success: true,
              data: { ...JSON.parse(options.body) }
            })
          };
        }
        if (options?.method === 'DELETE') {
          return {
            ok: true,
            json: async () => ({ success: true })
          };
        }
        // GET request
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: [
              {
                id: 'client_123',
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+1234567890',
                status: 'active'
              },
              {
                id: 'client_456',
                name: 'Jane Smith',
                email: 'jane@example.com',
                phone: '+0987654321',
                status: 'active'
              }
            ],
            count: 2
          })
        };
      }
      return originalFetch(url, options);
    };
  });
});

test.describe('Client Management CRUD (CLIENT-001)', () => {
  test('should load client list without errors', async ({ page }) => {
    await page.goto('/admin/clients');
    await page.waitForLoadState('networkidle');

    // Verify page loads without "Failed to load clients" error
    await expect(page.locator('text=Failed to load clients')).not.toBeVisible();

    // Verify client table/list is visible
    await expect(page.locator('table, .client-list, [data-testid*="client"]')).toBeVisible();

    // Verify clients are displayed
    await expect(page.locator('[data-testid^="client-row-"], .client-item')).toBeVisible();
  });

  test('should display client information correctly', async ({ page }) => {
    await page.goto('/admin/clients');
    await page.waitForLoadState('networkidle');

    // Verify client data is displayed
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=jane@example.com')).toBeVisible();

    // Verify status badges
    await expect(page.locator('.badge, [data-testid*="status"]')).toBeVisible();
  });

  test('should open create client modal', async ({ page }) => {
    await page.goto('/admin/clients');
    await page.waitForLoadState('networkidle');

    // Click create/add client button
    const createButton = page.locator('button:has-text("Add Client"), button:has-text("Create Client"), [data-testid*="add-client"], [data-testid*="create-client"]').first();
    await createButton.click();

    // Verify modal opens
    await expect(page.locator('.modal, .dialog, [role="dialog"]')).toBeVisible();

    // Verify form fields are present
    await expect(page.locator('input[name="name"], input[placeholder*="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="phone"], input[type="tel"]')).toBeVisible();
  });

  test('should validate form fields', async ({ page }) => {
    await page.goto('/admin/clients');
    await page.waitForLoadState('networkidle');

    // Open create modal
    const createButton = page.locator('button:has-text("Add Client"), button:has-text("Create Client"), [data-testid*="add-client"]').first();
    await createButton.click();

    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")').first();
    await submitButton.click();

    // Verify validation errors appear
    await expect(page.locator('.error, .invalid, [data-testid*="error"]')).toBeVisible();
  });

  test('should create new client successfully', async ({ page }) => {
    await page.goto('/admin/clients');
    await page.waitForLoadState('networkidle');

    // Open create modal
    const createButton = page.locator('button:has-text("Add Client"), button:has-text("Create Client"), [data-testid*="add-client"]').first();
    await createButton.click();

    // Fill form
    await page.fill('input[name="name"], input[placeholder*="name"]', 'New Client');
    await page.fill('input[name="email"], input[type="email"]', 'newclient@example.com');
    await page.fill('input[name="phone"], input[type="tel"]', '+1111111111');

    // Submit form
    const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")').first();
    await submitButton.click();

    // Verify success (modal closes or success message)
    await page.waitForTimeout(1000);
    await expect(page.locator('.modal, .dialog, [role="dialog"]')).not.toBeVisible();
  });

  test('should edit existing client', async ({ page }) => {
    await page.goto('/admin/clients');
    await page.waitForLoadState('networkidle');

    // Click edit button for first client
    const editButton = page.locator('button:has-text("Edit"), [data-testid*="edit-client"]').first();
    await editButton.click();

    // Verify edit modal opens with pre-filled data
    await expect(page.locator('.modal, .dialog, [role="dialog"]')).toBeVisible();
    await expect(page.locator('input[value="John Doe"], input[value*="john"]')).toBeVisible();

    // Update client name
    await page.fill('input[name="name"], input[placeholder*="name"]', 'John Updated');

    // Submit changes
    const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Update")').first();
    await submitButton.click();

    await page.waitForTimeout(1000);
    await expect(page.locator('.modal, .dialog, [role="dialog"]')).not.toBeVisible();
  });

  test('should delete client with confirmation', async ({ page }) => {
    await page.goto('/admin/clients');
    await page.waitForLoadState('networkidle');

    // Click delete button
    const deleteButton = page.locator('button:has-text("Delete"), [data-testid*="delete-client"]').first();
    await deleteButton.click();

    // Verify confirmation dialog appears
    await expect(page.locator('.confirm, [role="alertdialog"], text=confirm')).toBeVisible();

    // Confirm deletion
    const confirmButton = page.locator('button:has-text("Delete"), button:has-text("Confirm"), button:has-text("Yes")').last();
    await confirmButton.click();

    await page.waitForTimeout(1000);
    // Verify confirmation dialog closes
    await expect(page.locator('.confirm, [role="alertdialog"]')).not.toBeVisible();
  });

  test('should search and filter clients', async ({ page }) => {
    await page.goto('/admin/clients');
    await page.waitForLoadState('networkidle');

    // Test search functionality
    const searchInput = page.locator('input[placeholder*="search"], input[type="search"], [data-testid*="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('John');
      await page.waitForTimeout(500);

      // Verify filtered results
      await expect(page.locator('text=John Doe')).toBeVisible();
    }

    // Test status filter if available
    const statusFilter = page.locator('select[name*="status"], [data-testid*="status-filter"]').first();
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('active');
      await page.waitForTimeout(500);
    }
  });

  test('should handle pagination', async ({ page }) => {
    await page.goto('/admin/clients');
    await page.waitForLoadState('networkidle');

    // Check if pagination exists
    const paginationNext = page.locator('button:has-text("Next"), [data-testid*="next-page"]').first();
    const paginationPrev = page.locator('button:has-text("Previous"), [data-testid*="prev-page"]').first();

    if (await paginationNext.isVisible()) {
      // Test pagination navigation
      await paginationNext.click();
      await page.waitForTimeout(500);

      // Verify page changed
      await expect(page.locator('.client-list, table')).toBeVisible();
    }
  });
});
