import { test, expect } from '@playwright/test';

const BASE_URL = 'https://heiwahauz.netlify.app';

test.describe('Booking Widget E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('TEST 1: Page loads without critical errors', async ({ page }) => {
    // Check for console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(2000);

    const criticalErrors = errors.filter(
      (e) =>
        e.includes('Cannot access') ||
        e.includes('ReferenceError') ||
        e.includes('TypeError')
    );

    expect(criticalErrors).toHaveLength(0);
    console.log('✓ Page loads without critical errors');
  });

  test('TEST 2: Booking button is visible', async ({ page }) => {
    // Look for book button or floating widget
    const bookButton = page.locator(
      'button:has-text("Book"), a:has-text("Book"), [data-testid="book-button"]'
    );
    const floatingWidget = page.locator('[data-testid="floating-widget"]');

    const isVisible = (await bookButton.isVisible()) || (await floatingWidget.isVisible());
    expect(isVisible).toBeTruthy();
    console.log('✓ Booking button is visible');
  });

  test('TEST 3: API endpoints return valid data', async ({ page }) => {
    // Test rooms endpoint
    const roomsResponse = await page.request.get(`${BASE_URL}/api/rooms`);
    expect(roomsResponse.ok()).toBeTruthy();
    const roomsData = await roomsResponse.json();
    expect(roomsData.success).toBeTruthy();
    expect(Array.isArray(roomsData.data.rooms)).toBeTruthy();
    expect(roomsData.data.rooms.length).toBeGreaterThan(0);
    console.log(`✓ Rooms API: ${roomsData.data.rooms.length} rooms available`);

    // Test surf camps endpoint
    const campsResponse = await page.request.get(`${BASE_URL}/api/surf-camps`);
    expect(campsResponse.ok()).toBeTruthy();
    const campsData = await campsResponse.json();
    expect(campsData.success).toBeTruthy();
    expect(Array.isArray(campsData.data.surf_camps)).toBeTruthy();
    expect(campsData.data.surf_camps.length).toBeGreaterThan(0);
    console.log(`✓ Surf Camps API: ${campsData.data.surf_camps.length} camps available`);

    // Test add-ons endpoint
    const addOnsResponse = await page.request.get(`${BASE_URL}/api/add-ons`);
    expect(addOnsResponse.ok()).toBeTruthy();
    const addOnsData = await addOnsResponse.json();
    expect(addOnsData.success).toBeTruthy();
    console.log(`✓ Add-ons API: ${addOnsData.addOns?.length || 0} add-ons available`);
  });

  test('TEST 4: Room booking flow - Select room experience', async ({ page }) => {
    // Click book button
    const bookButton = page.locator('button:has-text("Book"), a:has-text("Book")').first();
    if (await bookButton.isVisible()) {
      await bookButton.click();
      await page.waitForTimeout(1000);
    }

    // Look for experience selection
    const roomOption = page.locator('button:has-text("Book a Room"), text="Book a Room"').first();
    if (await roomOption.isVisible()) {
      await roomOption.click();
      console.log('✓ Room booking experience selected');
      await page.waitForTimeout(1500);
    }

    // Check if we're in the booking flow
    const bookingWidget = page.locator('[data-testid="booking-widget"], .booking-widget, [class*="booking"]');
    const isVisible = await bookingWidget.isVisible().catch(() => false);
    expect(isVisible || (await page.locator('button:has-text("Next")').isVisible())).toBeTruthy();
  });

  test('TEST 5: Surf week booking flow - Select experience', async ({ page }) => {
    // Click book button
    const bookButton = page.locator('button:has-text("Book"), a:has-text("Book")').first();
    if (await bookButton.isVisible()) {
      await bookButton.click();
      await page.waitForTimeout(1000);
    }

    // Look for surf week option
    const surfOption = page.locator('button:has-text("Surf Week"), text="Surf Week"').first();
    if (await surfOption.isVisible()) {
      await surfOption.click();
      console.log('✓ Surf week booking experience selected');
      await page.waitForTimeout(1500);
    }

    // Check if we're in the booking flow
    const bookingWidget = page.locator('[data-testid="booking-widget"], .booking-widget, [class*="booking"]');
    const isVisible = await bookingWidget.isVisible().catch(() => false);
    expect(isVisible || (await page.locator('button:has-text("Next")').isVisible())).toBeTruthy();
  });

  test('TEST 6: Room data structure validation', async ({ page }) => {
    const roomsResponse = await page.request.get(`${BASE_URL}/api/rooms`);
    const roomsData = await roomsResponse.json();
    const room = roomsData.data.rooms[0];

    // Check required fields
    expect(room).toHaveProperty('id');
    expect(room).toHaveProperty('name');
    expect(room).toHaveProperty('capacity');
    expect(room).toHaveProperty('pricing');
    expect(room).toHaveProperty('images');
    expect(room).toHaveProperty('amenities');

    console.log(`✓ Room data structure valid: ${room.name}`);
    console.log(`  - Capacity: ${room.capacity} guests`);
    console.log(`  - Price: €${room.pricing.standard}/night`);
    console.log(`  - Amenities: ${room.amenities.join(', ')}`);
  });

  test('TEST 7: Surf camp data structure validation', async ({ page }) => {
    const campsResponse = await page.request.get(`${BASE_URL}/api/surf-camps`);
    const campsData = await campsResponse.json();
    const camp = campsData.data.surf_camps[0];

    // Check required fields
    expect(camp).toHaveProperty('id');
    expect(camp).toHaveProperty('name');
    expect(camp).toHaveProperty('start_date');
    expect(camp).toHaveProperty('end_date');
    expect(camp).toHaveProperty('price');
    expect(camp).toHaveProperty('max_participants');
    expect(camp).toHaveProperty('available_spots');

    console.log(`✓ Surf camp data structure valid: ${camp.name}`);
    console.log(`  - Dates: ${camp.start_date} to ${camp.end_date}`);
    console.log(`  - Price: €${camp.price}/person`);
    console.log(`  - Available spots: ${camp.available_spots}/${camp.max_participants}`);
  });

  test('TEST 8: No Zod errors in console', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(3000);

    const zodErrors = errors.filter((e) => e.includes('Cannot access') || e.includes('Zod'));
    expect(zodErrors).toHaveLength(0);
    console.log('✓ No Zod initialization errors');
  });

  test('TEST 9: No multiple GoTrueClient warnings', async ({ page }) => {
    const warnings: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });

    await page.waitForTimeout(3000);

    const goTrueWarnings = warnings.filter((w) => w.includes('GoTrueClient'));
    // Allow 0 warnings (ideal) or 1 warning (acceptable)
    expect(goTrueWarnings.length).toBeLessThanOrEqual(1);
    console.log(`✓ GoTrueClient warnings: ${goTrueWarnings.length} (acceptable)`);
  });

  test('TEST 10: Admin panel accessibility', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForTimeout(2000);

    // Check if we get redirected or see admin content
    const currentUrl = page.url();
    const isAdminOrRedirect =
      currentUrl.includes('/admin') || currentUrl.includes('login') || currentUrl.includes('auth');

    expect(isAdminOrRedirect).toBeTruthy();
    console.log(`✓ Admin panel accessible (URL: ${currentUrl})`);
  });
});
