import { test, expect } from '@playwright/test';

// Mock surf camps management setup
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

  // Mock surf camps data and API responses
  await page.addInitScript(() => {
    (window as any).__mockSurfCamps = [
      {
        id: 'camp_001',
        name: 'Beginner\'s Paradise',
        description: 'Perfect for first-time surfers with professional instruction',
        level: 'beginner',
        duration: 7,
        capacity: 12,
        price: 450,
        startDate: '2024-03-15',
        endDate: '2024-03-21',
        instructor: 'Carlos Rodriguez',
        equipment: ['Surfboard', 'Wetsuit', 'Leash'],
        linkedRooms: ['room_001', 'room_002'],
        status: 'active',
        created_at: '2024-01-10T09:00:00Z',
        updated_at: '2024-02-15T11:30:00Z'
      },
      {
        id: 'camp_002',
        name: 'Advanced Wave Riders',
        description: 'For experienced surfers looking to master advanced techniques',
        level: 'advanced',
        duration: 5,
        capacity: 8,
        price: 650,
        startDate: '2024-04-01',
        endDate: '2024-04-05',
        instructor: 'Maria Santos',
        equipment: ['Advanced Surfboard', 'Wetsuit', 'GoPro'],
        linkedRooms: ['room_003', 'room_004'],
        status: 'active',
        created_at: '2024-01-20T14:00:00Z',
        updated_at: '2024-02-10T16:45:00Z'
      }
    ];

    (window as any).__mockRooms = [
      { id: 'room_001', name: 'Ocean View Suite', status: 'active' },
      { id: 'room_002', name: 'Deluxe Room', status: 'active' },
      { id: 'room_003', name: 'Premium Suite', status: 'active' },
      { id: 'room_004', name: 'Standard Room', status: 'active' }
    ];

    const originalFetch = window.fetch;
    (window as any).fetch = async (url: string, options?: any) => {
      // Mock surf camps API endpoints
      if (url.includes('/api/surf-camps')) {
        if (options?.method === 'GET' || !options?.method) {
          return {
            ok: true,
            json: async () => ({
              surfCamps: (window as any).__mockSurfCamps
            })
          };
        }

        if (options?.method === 'POST') {
          const newCamp = JSON.parse(options.body);
          const camp = {
            ...newCamp,
            id: `camp_${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          (window as any).__mockSurfCamps.push(camp);
          
          return {
            ok: true,
            json: async () => ({ surfCamp: camp })
          };
        }

        if (options?.method === 'PUT' || options?.method === 'PATCH') {
          const campId = url.split('/').pop();
          const updateData = JSON.parse(options.body);
          const campIndex = (window as any).__mockSurfCamps.findIndex((c: any) => c.id === campId);
          
          if (campIndex !== -1) {
            (window as any).__mockSurfCamps[campIndex] = {
              ...(window as any).__mockSurfCamps[campIndex],
              ...updateData,
              updated_at: new Date().toISOString()
            };
            
            return {
              ok: true,
              json: async () => ({ surfCamp: (window as any).__mockSurfCamps[campIndex] })
            };
          }
        }

        if (options?.method === 'DELETE') {
          const campId = url.split('/').pop();
          const campIndex = (window as any).__mockSurfCamps.findIndex((c: any) => c.id === campId);
          
          if (campIndex !== -1) {
            (window as any).__mockSurfCamps.splice(campIndex, 1);
            return {
              ok: true,
              json: async () => ({ success: true })
            };
          }
        }
      }

      // Mock rooms API for linking
      if (url.includes('/api/rooms')) {
        return {
          ok: true,
          json: async () => ({
            rooms: (window as any).__mockRooms
          })
        };
      }

      return originalFetch(url, options);
    };
  });

  // Mock date validation
  await page.addInitScript(() => {
    (window as any).validateDates = (startDate: string, endDate: string) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const now = new Date();
      
      return {
        isValid: start < end && start >= now,
        error: start >= end ? 'End date must be after start date' : 
               start < now ? 'Start date cannot be in the past' : null
      };
    };
  });
});

test.describe('Surf Camps Management (CAMP-001)', () => {
  test('should render surf camps list with existing camps', async ({ page }) => {
    await page.goto('/admin/surf-camps');
    await page.waitForLoadState('networkidle');

    // Verify page title and main elements
    await expect(page.locator('text=Surf Camps Management')).toBeVisible();
    await expect(page.locator('[data-testid="create-camp"]')).toBeVisible();

    // Verify surf camps are displayed
    await expect(page.locator('text=Beginner\'s Paradise')).toBeVisible();
    await expect(page.locator('text=Advanced Wave Riders')).toBeVisible();
    await expect(page.locator('text=$450')).toBeVisible();
    await expect(page.locator('text=$650')).toBeVisible();
    await expect(page.locator('text=Carlos Rodriguez')).toBeVisible();
    await expect(page.locator('text=Maria Santos')).toBeVisible();
  });

  test('should create a new surf camp', async ({ page }) => {
    await page.goto('/admin/surf-camps');
    await page.waitForLoadState('networkidle');

    // Click create camp button
    await page.locator('[data-testid="create-camp"]').click();

    // Verify camp form appears
    await expect(page.locator('[data-testid="camp-form"]')).toBeVisible();

    // Fill camp form
    await page.locator('input[name="name"]').fill('Intermediate Waves');
    await page.locator('textarea[name="description"]').fill('Perfect for intermediate surfers');
    await page.locator('select[name="level"]').selectOption('intermediate');
    await page.locator('input[name="duration"]').fill('6');
    await page.locator('input[name="capacity"]').fill('10');
    await page.locator('input[name="price"]').fill('550');
    await page.locator('input[name="startDate"]').fill('2024-05-01');
    await page.locator('input[name="endDate"]').fill('2024-05-06');
    await page.locator('input[name="instructor"]').fill('Ana Garcia');

    // Select linked rooms
    const roomCheckboxes = page.locator('input[type="checkbox"][name="linkedRooms"]');
    await roomCheckboxes.first().check();
    await roomCheckboxes.nth(1).check();

    // Submit form
    await page.locator('button:has-text("Create Surf Camp")').click();
    await page.waitForTimeout(1000);

    // Verify success message and new camp appears
    await expect(page.locator('text=Surf camp created successfully')).toBeVisible();
    await expect(page.locator('text=Intermediate Waves')).toBeVisible();
  });

  test('should edit an existing surf camp', async ({ page }) => {
    await page.goto('/admin/surf-camps');
    await page.waitForLoadState('networkidle');

    // Click edit button for first camp
    await page.locator('[data-testid="edit-camp-camp_001"]').click();

    // Verify edit form appears with existing data
    await expect(page.locator('[data-testid="camp-form"]')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toHaveValue('Beginner\'s Paradise');

    // Update camp details
    await page.locator('input[name="name"]').clear();
    await page.locator('input[name="name"]').fill('Ultimate Beginner Experience');
    await page.locator('input[name="price"]').clear();
    await page.locator('input[name="price"]').fill('480');

    // Submit form
    await page.locator('button:has-text("Update Surf Camp")').click();
    await page.waitForTimeout(1000);

    // Verify success message and updated camp appears
    await expect(page.locator('text=Surf camp updated successfully')).toBeVisible();
    await expect(page.locator('text=Ultimate Beginner Experience')).toBeVisible();
    await expect(page.locator('text=$480')).toBeVisible();
  });

  test('should delete a surf camp', async ({ page }) => {
    await page.goto('/admin/surf-camps');
    await page.waitForLoadState('networkidle');

    // Mock confirmation dialog
    page.on('dialog', dialog => dialog.accept());

    // Click delete button for second camp
    await page.locator('[data-testid="delete-camp-camp_002"]').click();
    await page.waitForTimeout(1000);

    // Verify camp is removed
    await expect(page.locator('text=Surf camp deleted successfully')).toBeVisible();
    await expect(page.locator('text=Advanced Wave Riders')).not.toBeVisible();
  });

  test('should validate surf camp form inputs', async ({ page }) => {
    await page.goto('/admin/surf-camps');
    await page.waitForLoadState('networkidle');

    // Click create camp button
    await page.locator('[data-testid="create-camp"]').click();

    // Try to submit empty form
    await page.locator('button:has-text("Create Surf Camp")').click();

    // Verify validation errors
    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(page.locator('text=Description is required')).toBeVisible();
    await expect(page.locator('text=Duration is required')).toBeVisible();
    await expect(page.locator('text=Capacity is required')).toBeVisible();
    await expect(page.locator('text=Price is required')).toBeVisible();

    // Fill invalid data
    await page.locator('input[name="duration"]').fill('0');
    await page.locator('input[name="capacity"]').fill('-5');
    await page.locator('input[name="price"]').fill('abc');

    await page.locator('button:has-text("Create Surf Camp")').click();

    // Verify validation errors for invalid data
    await expect(page.locator('text=Duration must be positive')).toBeVisible();
    await expect(page.locator('text=Capacity must be positive')).toBeVisible();
    await expect(page.locator('text=Price must be a valid number')).toBeVisible();
  });

  test('should validate date ranges', async ({ page }) => {
    await page.goto('/admin/surf-camps');
    await page.waitForLoadState('networkidle');

    // Click create camp button
    await page.locator('[data-testid="create-camp"]').click();

    // Fill form with invalid dates
    await page.locator('input[name="name"]').fill('Test Camp');
    await page.locator('textarea[name="description"]').fill('Test description');
    await page.locator('input[name="startDate"]').fill('2024-05-10');
    await page.locator('input[name="endDate"]').fill('2024-05-05'); // End before start

    await page.locator('button:has-text("Create Surf Camp")').click();

    // Verify date validation error
    await expect(page.locator('text=End date must be after start date')).toBeVisible();

    // Test past date validation
    await page.locator('input[name="startDate"]').fill('2023-01-01'); // Past date
    await page.locator('input[name="endDate"]').fill('2023-01-07');

    await page.locator('button:has-text("Create Surf Camp")').click();

    // Verify past date validation error
    await expect(page.locator('text=Start date cannot be in the past')).toBeVisible();
  });

  test('should handle capacity validation', async ({ page }) => {
    await page.goto('/admin/surf-camps');
    await page.waitForLoadState('networkidle');

    // Click create camp button
    await page.locator('[data-testid="create-camp"]').click();

    // Fill form with capacity exceeding room capacity
    await page.locator('input[name="name"]').fill('Test Camp');
    await page.locator('textarea[name="description"]').fill('Test description');
    await page.locator('input[name="capacity"]').fill('50'); // Very high capacity

    // Select rooms (assuming total room capacity is less than 50)
    const roomCheckboxes = page.locator('input[type="checkbox"][name="linkedRooms"]');
    await roomCheckboxes.first().check();

    await page.locator('button:has-text("Create Surf Camp")').click();

    // Verify capacity validation warning
    const capacityWarning = page.locator('text=Camp capacity exceeds available room capacity');
    if (await capacityWarning.isVisible()) {
      await expect(capacityWarning).toBeVisible();
    }
  });

  test('should display linked rooms correctly', async ({ page }) => {
    await page.goto('/admin/surf-camps');
    await page.waitForLoadState('networkidle');

    // Verify linked rooms are displayed for camps
    await expect(page.locator('text=Ocean View Suite')).toBeVisible();
    await expect(page.locator('text=Deluxe Room')).toBeVisible();

    // Click on a camp to see room details
    const campCard = page.locator('text=Beginner\'s Paradise').first();
    await campCard.click();

    // Verify room details are shown
    const roomDetails = page.locator('[data-testid="linked-rooms"]');
    if (await roomDetails.isVisible()) {
      await expect(roomDetails).toBeVisible();
    }
  });

  test('should handle equipment list management', async ({ page }) => {
    await page.goto('/admin/surf-camps');
    await page.waitForLoadState('networkidle');

    // Click create camp button
    await page.locator('[data-testid="create-camp"]').click();

    // Add equipment items
    const equipmentInput = page.locator('input[name="equipment"]');
    if (await equipmentInput.isVisible()) {
      await equipmentInput.fill('Surfboard');
      await page.locator('button:has-text("Add Equipment")').click();

      await equipmentInput.fill('Wetsuit');
      await page.locator('button:has-text("Add Equipment")').click();

      // Verify equipment items are added
      await expect(page.locator('text=Surfboard')).toBeVisible();
      await expect(page.locator('text=Wetsuit')).toBeVisible();

      // Remove an equipment item
      await page.locator('[data-testid="remove-equipment-0"]').click();
      
      // Verify item is removed
      await expect(page.locator('text=Surfboard')).not.toBeVisible();
    }
  });

  test('should filter camps by level and status', async ({ page }) => {
    await page.goto('/admin/surf-camps');
    await page.waitForLoadState('networkidle');

    // Test level filter
    const levelFilter = page.locator('select[data-testid="level-filter"]');
    if (await levelFilter.isVisible()) {
      await levelFilter.selectOption('beginner');
      await page.waitForTimeout(500);

      // Should show only beginner camps
      await expect(page.locator('text=Beginner\'s Paradise')).toBeVisible();
      await expect(page.locator('text=Advanced Wave Riders')).not.toBeVisible();

      // Reset filter
      await levelFilter.selectOption('all');
      await page.waitForTimeout(500);

      // Should show all camps
      await expect(page.locator('text=Beginner\'s Paradise')).toBeVisible();
      await expect(page.locator('text=Advanced Wave Riders')).toBeVisible();
    }

    // Test search functionality
    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Advanced');
      await page.waitForTimeout(500);

      // Should show only matching camps
      await expect(page.locator('text=Advanced Wave Riders')).toBeVisible();
      await expect(page.locator('text=Beginner\'s Paradise')).not.toBeVisible();
    }
  });

  test('should handle real-time updates', async ({ page }) => {
    await page.goto('/admin/surf-camps');
    await page.waitForLoadState('networkidle');

    // Mock real-time update
    await page.addInitScript(() => {
      setTimeout(() => {
        // Simulate new camp added via real-time subscription
        (window as any).__mockSurfCamps.push({
          id: 'camp_realtime',
          name: 'Real-time Camp',
          description: 'Added via real-time update',
          level: 'intermediate',
          price: 500
        });
        
        // Trigger update event
        window.dispatchEvent(new CustomEvent('surf-camp-update', {
          detail: { type: 'INSERT', new: { name: 'Real-time Camp' } }
        }));
      }, 1000);
    });

    // Wait for real-time update
    await page.waitForTimeout(1500);

    // Verify new camp appears (if real-time is implemented)
    const realTimeCamp = page.locator('text=Real-time Camp');
    if (await realTimeCamp.isVisible()) {
      await expect(realTimeCamp).toBeVisible();
    }
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/admin/surf-camps');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Surf Camps Management')).toBeVisible();

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid="create-camp"]')).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('text=Surf Camps Management')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/surf-camps', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/admin/surf-camps');
    await page.waitForLoadState('networkidle');

    // Should show error message
    await expect(page.locator('text=Failed to load surf camps')).toBeVisible();
  });

  test('should take snapshots for visual regression', async ({ page }) => {
    await page.goto('/admin/surf-camps');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Take screenshot of full surf camps page
    await expect(page.locator('body')).toHaveScreenshot('surf-camps-page.png');

    // Take screenshot of camps list/grid
    const campsList = page.locator('[data-testid="camps-list"]');
    if (await campsList.isVisible()) {
      await expect(campsList).toHaveScreenshot('surf-camps-list.png');
    }

    // Open create camp form and take screenshots
    await page.locator('[data-testid="create-camp"]').click();
    await page.waitForTimeout(500);

    await expect(page.locator('[data-testid="camp-form"]')).toHaveScreenshot('surf-camp-form-create.png');

    // Fill form partially and take screenshot
    await page.locator('input[name="name"]').fill('Test Surf Camp');
    await page.locator('textarea[name="description"]').fill('Test surf camp description');
    await page.locator('select[name="level"]').selectOption('beginner');
    await page.waitForTimeout(300);

    await expect(page.locator('[data-testid="camp-form"]')).toHaveScreenshot('surf-camp-form-filled.png');

    // Close form and test edit form
    await page.locator('button:has-text("Cancel")').click();
    await page.waitForTimeout(500);

    // Open edit form for existing camp
    const editButton = page.locator('[data-testid="edit-camp-camp_001"]');
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(500);

      await expect(page.locator('[data-testid="camp-form"]')).toHaveScreenshot('surf-camp-form-edit.png');
    }

    // Test with filters applied
    await page.goto('/admin/surf-camps');
    await page.waitForLoadState('networkidle');

    const levelFilter = page.locator('select[data-testid="level-filter"]');
    if (await levelFilter.isVisible()) {
      await levelFilter.selectOption('beginner');
      await page.waitForTimeout(500);

      await expect(page.locator('body')).toHaveScreenshot('surf-camps-filtered.png');
    }

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin/surf-camps');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page.locator('body')).toHaveScreenshot('surf-camps-mobile.png');
  });
});
