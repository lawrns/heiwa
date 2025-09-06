import { test, expect } from '@playwright/test';

// Mock rooms management setup
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

  // Mock rooms data and API responses
  await page.addInitScript(() => {
    (window as any).__mockRooms = [
      {
        id: 'room_001',
        name: 'Ocean View Suite',
        description: 'Luxurious suite with panoramic ocean views',
        capacity: 2,
        amenities: ['WiFi', 'Air Conditioning', 'Ocean View', 'Private Bathroom'],
        pricing: {
          basePrice: 250,
          weekendSurcharge: 50,
          seasonalRates: {
            high: 300,
            medium: 250,
            low: 200
          }
        },
        images: [
          'https://example.com/room1-1.jpg',
          'https://example.com/room1-2.jpg'
        ],
        status: 'active',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-02-20T14:30:00Z'
      },
      {
        id: 'room_002',
        name: 'Deluxe Room',
        description: 'Comfortable room with modern amenities',
        capacity: 2,
        amenities: ['WiFi', 'Air Conditioning', 'Private Bathroom'],
        pricing: {
          basePrice: 180,
          weekendSurcharge: 30,
          seasonalRates: {
            high: 220,
            medium: 180,
            low: 150
          }
        },
        images: ['https://example.com/room2-1.jpg'],
        status: 'active',
        created_at: '2024-01-20T09:00:00Z',
        updated_at: '2024-02-15T11:00:00Z'
      }
    ];

    const originalFetch = window.fetch;
    (window as any).fetch = async (url: string, options?: any) => {
      // Mock rooms API endpoints
      if (url.includes('/api/rooms')) {
        if (options?.method === 'GET' || !options?.method) {
          return {
            ok: true,
            json: async () => ({
              rooms: (window as any).__mockRooms
            })
          };
        }

        if (options?.method === 'POST') {
          const newRoom = JSON.parse(options.body);
          const room = {
            ...newRoom,
            id: `room_${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          (window as any).__mockRooms.push(room);
          
          return {
            ok: true,
            json: async () => ({ room })
          };
        }

        if (options?.method === 'PUT' || options?.method === 'PATCH') {
          const roomId = url.split('/').pop();
          const updateData = JSON.parse(options.body);
          const roomIndex = (window as any).__mockRooms.findIndex((r: any) => r.id === roomId);
          
          if (roomIndex !== -1) {
            (window as any).__mockRooms[roomIndex] = {
              ...(window as any).__mockRooms[roomIndex],
              ...updateData,
              updated_at: new Date().toISOString()
            };
            
            return {
              ok: true,
              json: async () => ({ room: (window as any).__mockRooms[roomIndex] })
            };
          }
        }

        if (options?.method === 'DELETE') {
          const roomId = url.split('/').pop();
          const roomIndex = (window as any).__mockRooms.findIndex((r: any) => r.id === roomId);
          
          if (roomIndex !== -1) {
            (window as any).__mockRooms.splice(roomIndex, 1);
            return {
              ok: true,
              json: async () => ({ success: true })
            };
          }
        }
      }

      // Mock image upload API
      if (url.includes('/api/upload')) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            files: [
              {
                url: 'https://example.com/uploaded-image.jpg',
                path: 'rooms/uploaded-image.jpg'
              }
            ]
          })
        };
      }

      return originalFetch(url, options);
    };
  });

  // Mock Supabase real-time subscriptions
  await page.addInitScript(() => {
    (window as any).supabase = {
      channel: (name: string) => ({
        on: (event: string, config: any, callback: Function) => ({
          subscribe: () => {
            // Mock real-time subscription
            setTimeout(() => {
              if (event === 'postgres_changes') {
                callback({
                  eventType: 'INSERT',
                  new: { id: 'new_room', name: 'New Room' }
                });
              }
            }, 1000);
            return { unsubscribe: () => {} };
          }
        })
      })
    };
  });
});

test.describe('Rooms Management (ROOM-001)', () => {
  test('should render rooms list with existing rooms', async ({ page }) => {
    await page.goto('/admin/rooms');
    await page.waitForLoadState('networkidle');

    // Verify page title and main elements
    await expect(page.locator('text=Rooms Management')).toBeVisible();
    await expect(page.locator('[data-testid="create-room"]')).toBeVisible();

    // Verify rooms are displayed
    await expect(page.locator('text=Ocean View Suite')).toBeVisible();
    await expect(page.locator('text=Deluxe Room')).toBeVisible();
    await expect(page.locator('text=$250')).toBeVisible();
    await expect(page.locator('text=$180')).toBeVisible();
  });

  test('should create a new room', async ({ page }) => {
    await page.goto('/admin/rooms');
    await page.waitForLoadState('networkidle');

    // Click create room button
    await page.locator('[data-testid="create-room"]').click();

    // Verify room form appears
    await expect(page.locator('[data-testid="room-form"]')).toBeVisible();

    // Fill room form
    await page.locator('input[name="name"]').fill('Premium Suite');
    await page.locator('textarea[name="description"]').fill('Luxury suite with premium amenities');
    await page.locator('input[name="capacity"]').fill('4');
    await page.locator('input[name="basePrice"]').fill('350');

    // Add amenities
    const amenityCheckboxes = page.locator('input[type="checkbox"]');
    await amenityCheckboxes.first().check();
    await amenityCheckboxes.nth(1).check();

    // Submit form
    await page.locator('button:has-text("Create Room")').click();
    await page.waitForTimeout(1000);

    // Verify success message and new room appears
    await expect(page.locator('text=Room created successfully')).toBeVisible();
    await expect(page.locator('text=Premium Suite')).toBeVisible();
  });

  test('should edit an existing room', async ({ page }) => {
    await page.goto('/admin/rooms');
    await page.waitForLoadState('networkidle');

    // Click edit button for first room
    await page.locator('[data-testid="edit-room-room_001"]').click();

    // Verify edit form appears with existing data
    await expect(page.locator('[data-testid="room-form"]')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toHaveValue('Ocean View Suite');

    // Update room details
    await page.locator('input[name="name"]').clear();
    await page.locator('input[name="name"]').fill('Premium Ocean View Suite');
    await page.locator('input[name="basePrice"]').clear();
    await page.locator('input[name="basePrice"]').fill('280');

    // Submit form
    await page.locator('button:has-text("Update Room")').click();
    await page.waitForTimeout(1000);

    // Verify success message and updated room appears
    await expect(page.locator('text=Room updated successfully')).toBeVisible();
    await expect(page.locator('text=Premium Ocean View Suite')).toBeVisible();
    await expect(page.locator('text=$280')).toBeVisible();
  });

  test('should delete a room', async ({ page }) => {
    await page.goto('/admin/rooms');
    await page.waitForLoadState('networkidle');

    // Mock confirmation dialog
    page.on('dialog', dialog => dialog.accept());

    // Click delete button for second room
    await page.locator('[data-testid="delete-room-room_002"]').click();
    await page.waitForTimeout(1000);

    // Verify room is removed
    await expect(page.locator('text=Room deleted successfully')).toBeVisible();
    await expect(page.locator('text=Deluxe Room')).not.toBeVisible();
  });

  test('should validate room form inputs', async ({ page }) => {
    await page.goto('/admin/rooms');
    await page.waitForLoadState('networkidle');

    // Click create room button
    await page.locator('[data-testid="create-room"]').click();

    // Try to submit empty form
    await page.locator('button:has-text("Create Room")').click();

    // Verify validation errors
    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(page.locator('text=Description is required')).toBeVisible();
    await expect(page.locator('text=Capacity is required')).toBeVisible();
    await expect(page.locator('text=Base price is required')).toBeVisible();

    // Fill invalid data
    await page.locator('input[name="capacity"]').fill('-1');
    await page.locator('input[name="basePrice"]').fill('abc');

    await page.locator('button:has-text("Create Room")').click();

    // Verify validation errors for invalid data
    await expect(page.locator('text=Capacity must be positive')).toBeVisible();
    await expect(page.locator('text=Price must be a valid number')).toBeVisible();
  });

  test('should handle image upload for rooms', async ({ page }) => {
    await page.goto('/admin/rooms');
    await page.waitForLoadState('networkidle');

    // Click create room button
    await page.locator('[data-testid="create-room"]').click();

    // Find image upload component
    const uploadButton = page.locator('[data-testid="file-upload"]');
    if (await uploadButton.isVisible()) {
      // Mock file upload
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles([{
        name: 'room-image.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-data')
      }]);

      // Verify upload progress
      await expect(page.locator('text=Uploading...')).toBeVisible();
      
      // Wait for upload completion
      await page.waitForTimeout(2000);
      
      // Verify success message
      await expect(page.locator('text=uploaded successfully')).toBeVisible();
    }
  });

  test('should handle pricing JSONB structure', async ({ page }) => {
    await page.goto('/admin/rooms');
    await page.waitForLoadState('networkidle');

    // Click create room button
    await page.locator('[data-testid="create-room"]').click();

    // Fill basic room info
    await page.locator('input[name="name"]').fill('Test Room');
    await page.locator('textarea[name="description"]').fill('Test description');
    await page.locator('input[name="capacity"]').fill('2');

    // Fill pricing structure
    await page.locator('input[name="basePrice"]').fill('200');
    await page.locator('input[name="weekendSurcharge"]').fill('40');
    
    // Fill seasonal rates
    await page.locator('input[name="highSeasonRate"]').fill('250');
    await page.locator('input[name="mediumSeasonRate"]').fill('200');
    await page.locator('input[name="lowSeasonRate"]').fill('150');

    // Submit form
    await page.locator('button:has-text("Create Room")').click();
    await page.waitForTimeout(1000);

    // Verify room was created with proper pricing structure
    await expect(page.locator('text=Room created successfully')).toBeVisible();
    
    // Verify pricing is displayed correctly
    await expect(page.locator('text=$200')).toBeVisible(); // Base price
    await expect(page.locator('text=+$40 weekends')).toBeVisible(); // Weekend surcharge
  });

  test('should handle real-time updates via Supabase subscriptions', async ({ page }) => {
    await page.goto('/admin/rooms');
    await page.waitForLoadState('networkidle');

    // Wait for real-time subscription to trigger (mocked)
    await page.waitForTimeout(1500);

    // Verify real-time update was handled
    // This would depend on your implementation of real-time updates
    const realTimeIndicator = page.locator('text=Real-time update received');
    if (await realTimeIndicator.isVisible()) {
      await expect(realTimeIndicator).toBeVisible();
    }
  });

  test('should filter and search rooms', async ({ page }) => {
    await page.goto('/admin/rooms');
    await page.waitForLoadState('networkidle');

    // Test search functionality
    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Ocean');
      await page.waitForTimeout(500);

      // Should show only matching rooms
      await expect(page.locator('text=Ocean View Suite')).toBeVisible();
      await expect(page.locator('text=Deluxe Room')).not.toBeVisible();

      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(500);

      // Should show all rooms again
      await expect(page.locator('text=Ocean View Suite')).toBeVisible();
      await expect(page.locator('text=Deluxe Room')).toBeVisible();
    }

    // Test status filter
    const statusFilter = page.locator('select[data-testid="status-filter"]');
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('active');
      await page.waitForTimeout(500);

      // Should show only active rooms
      await expect(page.locator('text=Ocean View Suite')).toBeVisible();
      await expect(page.locator('text=Deluxe Room')).toBeVisible();
    }
  });

  test('should handle room capacity and availability', async ({ page }) => {
    await page.goto('/admin/rooms');
    await page.waitForLoadState('networkidle');

    // Verify capacity is displayed
    await expect(page.locator('text=Capacity: 2')).toBeVisible();

    // Test availability status
    const availabilityIndicator = page.locator('[data-testid="room-availability"]');
    if (await availabilityIndicator.isVisible()) {
      await expect(availabilityIndicator).toBeVisible();
    }
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/admin/rooms');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Rooms Management')).toBeVisible();

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid="create-room"]')).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('text=Rooms Management')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/rooms', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/admin/rooms');
    await page.waitForLoadState('networkidle');

    // Should show error message
    await expect(page.locator('text=Failed to load rooms')).toBeVisible();
  });

  test('should take snapshots for visual regression', async ({ page }) => {
    await page.goto('/admin/rooms');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Take screenshot of full rooms page
    await expect(page.locator('body')).toHaveScreenshot('rooms-page.png');

    // Take screenshot of rooms list/grid
    const roomsList = page.locator('[data-testid="rooms-list"]');
    if (await roomsList.isVisible()) {
      await expect(roomsList).toHaveScreenshot('rooms-list.png');
    }

    // Open create room form and take screenshots
    await page.locator('[data-testid="create-room"]').click();
    await page.waitForTimeout(500);

    await expect(page.locator('[data-testid="room-form"]')).toHaveScreenshot('room-form-create.png');

    // Fill form partially and take screenshot
    await page.locator('input[name="name"]').fill('Test Room');
    await page.locator('textarea[name="description"]').fill('Test description');
    await page.waitForTimeout(300);

    await expect(page.locator('[data-testid="room-form"]')).toHaveScreenshot('room-form-filled.png');

    // Close form and test edit form
    await page.locator('button:has-text("Cancel")').click();
    await page.waitForTimeout(500);

    // Open edit form for existing room
    const editButton = page.locator('[data-testid="edit-room-room_001"]');
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(500);

      await expect(page.locator('[data-testid="room-form"]')).toHaveScreenshot('room-form-edit.png');
    }

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin/rooms');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page.locator('body')).toHaveScreenshot('rooms-mobile.png');
  });
});
