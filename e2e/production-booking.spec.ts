import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3003';

test.describe('Production Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Set a longer timeout for production tests
    test.setTimeout(60000);
  });

  test('Complete Room Booking Flow', async ({ page }) => {
    console.log('\n🌐 === PRODUCTION BROWSER TEST ===\n');
    console.log(`📍 URL: ${BASE_URL}`);

    // Step 1: Load homepage
    console.log('\n[1/7] Loading homepage...');
    await page.goto(BASE_URL, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    const pageTitle = await page.title();
    console.log(`✅ Homepage loaded: "${pageTitle}"`);
    expect(pageTitle).toContain('Heiwa');

    // Step 2: Verify page is interactive
    console.log('\n[2/7] Checking page interactivity...');
    const body = page.locator('body');
    await expect(body).toBeVisible();
    console.log('✅ Page is interactive');

    // Step 3: Navigate to rooms page
    console.log('\n[3/7] Navigating to rooms page...');
    await page.goto(`${BASE_URL}/rooms`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    console.log('✅ Rooms page loaded');

    // Step 4: Check API endpoints are working from browser
    console.log('\n[4/7] Testing Rooms API from browser...');
    const roomsApiTest = await page.evaluate(async () => {
      const response = await fetch('/api/rooms', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      const data = await response.json();
      return {
        status: response.status,
        success: data.success,
        roomCount: data.data?.rooms?.length || 0,
        firstRoom: data.data?.rooms?.[0]?.name
      };
    });

    console.log(`✅ Rooms API Response:`);
    console.log(`   Status: ${roomsApiTest.status}`);
    console.log(`   Success: ${roomsApiTest.success}`);
    console.log(`   Rooms Available: ${roomsApiTest.roomCount}`);
    console.log(`   First Room: ${roomsApiTest.firstRoom}`);
    expect(roomsApiTest.success).toBe(true);
    expect(roomsApiTest.roomCount).toBeGreaterThan(0);

    // Step 5: Test Surf Camps API
    console.log('\n[5/7] Testing Surf Camps API from browser...');
    const campsApiTest = await page.evaluate(async () => {
      const response = await fetch('/api/surf-camps', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      const data = await response.json();
      return {
        status: response.status,
        success: data.success,
        campCount: data.data?.surf_camps?.length || 0,
        firstCamp: data.data?.surf_camps?.[0]?.name
      };
    });

    console.log(`✅ Surf Camps API Response:`);
    console.log(`   Status: ${campsApiTest.status}`);
    console.log(`   Success: ${campsApiTest.success}`);
    console.log(`   Camps Available: ${campsApiTest.campCount}`);
    console.log(`   First Camp: ${campsApiTest.firstCamp}`);
    expect(campsApiTest.success).toBe(true);
    expect(campsApiTest.campCount).toBeGreaterThan(0);

    // Step 6: Test Room Booking API
    console.log('\n[6/7] Testing Room Booking API from browser...');
    const roomBookingTest = await page.evaluate(async () => {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: 'f3f00cbb-c30e-4d84-9352-cfb6a76684d0',
          start_date: '2025-12-20',
          end_date: '2025-12-22',
          clientName: 'Browser Test - Room',
          email: 'browsertest.room@example.com'
        })
      });
      const data = await response.json();
      return {
        status: response.status,
        success: data.success,
        bookingNumber: data.data?.booking?.booking_number,
        bookingId: data.data?.booking?.id,
        bookingStatus: data.data?.booking?.status,
        error: data.error
      };
    });

    console.log(`✅ Room Booking API Response:`);
    console.log(`   Status: ${roomBookingTest.status}`);
    console.log(`   Success: ${roomBookingTest.success}`);
    if (roomBookingTest.success) {
      console.log(`   Booking Number: ${roomBookingTest.bookingNumber}`);
      console.log(`   Booking ID: ${roomBookingTest.bookingId}`);
      console.log(`   Booking Status: ${roomBookingTest.bookingStatus}`);
      console.log(`   ✅ ROOM BOOKING WORKS!`);
    } else {
      console.log(`   Error: ${roomBookingTest.error}`);
    }
    expect(roomBookingTest.success).toBe(true);

    // Step 7: Test Surf Camp Booking API
    console.log('\n[7/7] Testing Surf Camp Booking API from browser...');
    const campBookingTest = await page.evaluate(async () => {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          camp_id: '7c59ab79-510b-443b-8489-437a93f9205b',
          participants: [
            {
              firstName: 'Browser',
              lastName: 'Tester',
              email: 'browsertest.camp@example.com',
              phone: '+1 555-0100'
            }
          ],
          pricing: { total: 450 }
        })
      });
      const data = await response.json();
      return {
        status: response.status,
        success: data.success,
        bookingNumber: data.data?.booking?.booking_number,
        bookingId: data.data?.booking?.id,
        bookingStatus: data.data?.booking?.status,
        error: data.error
      };
    });

    console.log(`✅ Surf Camp Booking API Response:`);
    console.log(`   Status: ${campBookingTest.status}`);
    console.log(`   Success: ${campBookingTest.success}`);
    if (campBookingTest.success) {
      console.log(`   Booking Number: ${campBookingTest.bookingNumber}`);
      console.log(`   Booking ID: ${campBookingTest.bookingId}`);
      console.log(`   Booking Status: ${campBookingTest.bookingStatus}`);
      console.log(`   ✅ SURF CAMP BOOKING WORKS!`);
    } else {
      console.log(`   Error: ${campBookingTest.error}`);
    }
    expect(campBookingTest.success).toBe(true);

    console.log('\n🎉 === ALL PRODUCTION TESTS PASSED ===\n');
    console.log('📊 Summary:');
    console.log(`   ✅ Homepage loads`);
    console.log(`   ✅ Rooms page loads`);
    console.log(`   ✅ Rooms API works (${roomsApiTest.roomCount} rooms)`);
    console.log(`   ✅ Surf Camps API works (${campsApiTest.campCount} camps)`);
    console.log(`   ✅ Room booking creation works`);
    console.log(`   ✅ Surf camp booking creation works`);
    console.log(`\n🚀 Production site is fully functional!\n`);
  });
});
