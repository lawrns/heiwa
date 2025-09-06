import { test, expect } from '@playwright/test';

// Mock data for testing
const mockClients = [
  { id: 'client_001', name: 'John Doe', email: 'john@example.com', phone: '+1234567890' },
  { id: 'client_002', name: 'Jane Smith', email: 'jane@example.com', phone: '+0987654321' }
];

const mockRooms = [
  { 
    id: 'room_001', 
    name: 'Ocean View Suite', 
    capacity: 2, 
    isActive: true,
    pricing: { basePrice: 250, pricingModel: 'per_bed' }
  },
  { 
    id: 'room_002', 
    name: 'Garden Villa', 
    capacity: 4, 
    isActive: true,
    pricing: { basePrice: 400, pricingModel: 'whole_room' }
  }
];

const mockSurfCamps = [
  { id: 'camp_001', name: 'Beginner Paradise', price: 450, level: 'beginner', isActive: true },
  { id: 'camp_002', name: 'Advanced Waves', price: 650, level: 'advanced', isActive: true }
];

const mockAddOns = [
  { id: 'addon_001', name: 'Airport Transfer', price: 50, category: 'transport', isActive: true },
  { id: 'addon_002', name: 'Surfboard Rental', price: 25, category: 'equipment', isActive: true }
];

test.beforeEach(async ({ page }) => {
  // Mock API responses
  await page.route('**/api/firebase-clients', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ clients: mockClients })
    });
  });

  await page.route('**/api/rooms', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ rooms: mockRooms })
    });
  });

  await page.route('**/api/surf-camps', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ surfCamps: mockSurfCamps })
    });
  });

  await page.route('**/api/add-ons', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ addOns: mockAddOns })
    });
  });

  // Mock successful booking creation
  await page.route('**/api/firebase-bookings', async (route) => {
    if (route.request().method() === 'POST') {
      const requestBody = await route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          booking: {
            id: 'booking_new_' + Date.now(),
            ...requestBody
          }
        })
      });
    }
  });
});

test.describe('Booking Creation Modal', () => {
  test('should open modal when +New booking button is clicked', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    // Click the +New booking button
    const newBookingButton = page.locator('button:has-text("+New booking"), button:has-text("New Booking")').first();
    await expect(newBookingButton).toBeVisible();
    await newBookingButton.click();

    // Verify modal opens
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Create New Booking')).toBeVisible();
  });

  test('should load client data in modal', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    // Open modal
    await page.locator('button:has-text("+New booking"), button:has-text("New Booking")').first().click();
    
    // Wait for modal to load
    await page.waitForTimeout(1000);

    // Verify clients are loaded
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=Jane Smith')).toBeVisible();
    await expect(page.locator('text=john@example.com')).toBeVisible();
  });

  test('should load room, surf camp, and add-on data', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    // Open modal
    await page.locator('button:has-text("+New booking"), button:has-text("New Booking")').first().click();
    await page.waitForTimeout(1000);

    // Verify rooms are loaded
    await expect(page.locator('text=Ocean View Suite')).toBeVisible();
    await expect(page.locator('text=Garden Villa')).toBeVisible();

    // Verify surf camps are loaded
    await expect(page.locator('text=Beginner Paradise')).toBeVisible();
    await expect(page.locator('text=Advanced Waves')).toBeVisible();

    // Verify add-ons are loaded
    await expect(page.locator('text=Airport Transfer')).toBeVisible();
    await expect(page.locator('text=Surfboard Rental')).toBeVisible();
  });

  test('should validate form fields', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    // Open modal
    await page.locator('button:has-text("+New booking"), button:has-text("New Booking")').first().click();
    await page.waitForTimeout(1000);

    // Try to submit without selecting clients
    const submitButton = page.locator('button:has-text("Create Booking")');
    await expect(submitButton).toBeDisabled();

    // Select a client
    await page.locator('input[type="checkbox"]').first().check();
    
    // Submit button should still be disabled (no items selected)
    await expect(submitButton).toBeDisabled();
  });

  test('should add items to booking', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    // Open modal
    await page.locator('button:has-text("+New booking"), button:has-text("New Booking")').first().click();
    await page.waitForTimeout(1000);

    // Add a room
    const addRoomButton = page.locator('button').filter({ hasText: '+' }).first();
    await addRoomButton.click();

    // Verify item appears in selected items
    await expect(page.locator('text=Ocean View Suite')).toBeVisible();
    await expect(page.locator('text=$250.00')).toBeVisible();
  });

  test('should calculate price correctly', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    // Open modal
    await page.locator('button:has-text("+New booking"), button:has-text("New Booking")').first().click();
    await page.waitForTimeout(1000);

    // Add multiple items
    const addButtons = page.locator('button').filter({ hasText: '+' });
    await addButtons.nth(0).click(); // Add room
    await addButtons.nth(1).click(); // Add surf camp
    await addButtons.nth(2).click(); // Add add-on

    // Verify price calculation
    await expect(page.locator('text=Subtotal:')).toBeVisible();
    await expect(page.locator('text=Taxes (10%):')).toBeVisible();
    await expect(page.locator('text=Service Fee (5%):')).toBeVisible();
    await expect(page.locator('text=Total:')).toBeVisible();
  });

  test('should update item quantities', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    // Open modal
    await page.locator('button:has-text("+New booking"), button:has-text("New Booking")').first().click();
    await page.waitForTimeout(1000);

    // Add a room
    await page.locator('button').filter({ hasText: '+' }).first().click();

    // Increase quantity
    const increaseButton = page.locator('button').filter({ hasText: '+' }).last();
    await increaseButton.click();

    // Verify quantity updated
    await expect(page.locator('text=2')).toBeVisible(); // quantity
    await expect(page.locator('text=$500.00')).toBeVisible(); // updated price
  });

  test('should remove items from booking', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    // Open modal
    await page.locator('button:has-text("+New booking"), button:has-text("New Booking")').first().click();
    await page.waitForTimeout(1000);

    // Add a room
    await page.locator('button').filter({ hasText: '+' }).first().click();

    // Remove the item
    await page.locator('button:has-text("Remove")').click();

    // Verify item is removed
    await expect(page.locator('text=No items selected')).toBeVisible();
  });

  test('should search clients', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    // Open modal
    await page.locator('button:has-text("+New booking"), button:has-text("New Booking")').first().click();
    await page.waitForTimeout(1000);

    // Search for a specific client
    await page.locator('input[placeholder*="Search clients"]').fill('John');

    // Verify search results
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=Jane Smith')).not.toBeVisible();
  });

  test('should create booking successfully', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    // Open modal
    await page.locator('button:has-text("+New booking"), button:has-text("New Booking")').first().click();
    await page.waitForTimeout(1000);

    // Select client
    await page.locator('input[type="checkbox"]').first().check();

    // Add items
    await page.locator('button').filter({ hasText: '+' }).first().click();

    // Set payment status
    await page.locator('select').filter({ hasText: 'Select payment status' }).selectOption('confirmed');

    // Submit form
    await page.locator('button:has-text("Create Booking")').click();

    // Verify success
    await expect(page.locator('text=Booking created successfully')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/firebase-bookings', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Validation failed' })
        });
      }
    });

    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    // Open modal and try to create booking
    await page.locator('button:has-text("+New booking"), button:has-text("New Booking")').first().click();
    await page.waitForTimeout(1000);

    // Fill form
    await page.locator('input[type="checkbox"]').first().check();
    await page.locator('button').filter({ hasText: '+' }).first().click();
    await page.locator('select').selectOption('confirmed');

    // Submit and expect error
    await page.locator('button:has-text("Create Booking")').click();
    await expect(page.locator('text=Validation Error')).toBeVisible();
  });

  test('should close modal when cancel is clicked', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    // Open modal
    await page.locator('button:has-text("+New booking"), button:has-text("New Booking")').first().click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Click cancel
    await page.locator('button:has-text("Cancel")').click();

    // Verify modal is closed
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('should reset form when modal is reopened', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    // Open modal and make changes
    await page.locator('button:has-text("+New booking"), button:has-text("New Booking")').first().click();
    await page.waitForTimeout(1000);
    await page.locator('input[type="checkbox"]').first().check();
    await page.locator('button').filter({ hasText: '+' }).first().click();

    // Close modal
    await page.locator('button:has-text("Cancel")').click();

    // Reopen modal
    await page.locator('button:has-text("+New booking"), button:has-text("New Booking")').first().click();
    await page.waitForTimeout(1000);

    // Verify form is reset
    await expect(page.locator('input[type="checkbox"]:checked')).toHaveCount(0);
    await expect(page.locator('text=No items selected')).toBeVisible();
  });
});
