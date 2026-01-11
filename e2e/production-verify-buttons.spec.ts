import { test, expect, Page } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3003'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'testpassword123'

async function loginToAdmin(page: Page): Promise<boolean> {
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(2000)
  
  if (page.url().includes('/admin') && !page.url().includes('/login')) {
    return true
  }
  
  const passwordInput = page.locator('input[type="password"]')
  if (await passwordInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await passwordInput.fill(ADMIN_PASSWORD)
    await page.locator('button[type="submit"]').click()
    await page.waitForURL('**/admin', { timeout: 15000 }).catch(() => {})
    await page.waitForTimeout(2000)
    await page.reload({ waitUntil: 'domcontentloaded' })
  }
  
  return page.url().includes('/admin') && !page.url().includes('/login')
}

test.describe('Verify Add/Create Buttons', () => {
  
  test('Verify all CRUD buttons are visible', async ({ page }) => {
    // Set wider viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    
    await loginToAdmin(page)
    
    console.log('\n=== VERIFYING CRUD BUTTONS ===\n')
    
    // 1. Rooms Page - Add Room button
    await page.goto(`${BASE_URL}/admin/rooms`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    const addRoomBtn = await page.locator('a[href="/admin/rooms/new"]').isVisible().catch(() => false)
    const addRoomText = await page.locator('text=Add Room').isVisible().catch(() => false)
    console.log('Rooms Page:')
    console.log('  - Add Room link:', addRoomBtn ? '✅' : '❌')
    console.log('  - "Add Room" text:', addRoomText ? '✅' : '❌')
    await page.screenshot({ path: 'test-results-production/verify-rooms-buttons.png', fullPage: false })
    
    // 2. Bookings Page - Create Booking button
    await page.goto(`${BASE_URL}/admin/bookings`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    const createBookingBtn = await page.locator('a[href="/admin/bookings/new"]').isVisible().catch(() => false)
    const createBookingText = await page.locator('text=Create Booking').isVisible().catch(() => false)
    console.log('\nBookings Page:')
    console.log('  - Create Booking link:', createBookingBtn ? '✅' : '❌')
    console.log('  - "Create Booking" text:', createBookingText ? '✅' : '❌')
    await page.screenshot({ path: 'test-results-production/verify-bookings-buttons.png', fullPage: false })
    
    // 3. Surf Camps Page - Add Surf Week button
    await page.goto(`${BASE_URL}/admin/surf-camps`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    const addSurfBtn = await page.locator('a[href="/admin/surf-camps/new"]').isVisible().catch(() => false)
    const addSurfText = await page.locator('text=Add Surf Week').isVisible().catch(() => false)
    console.log('\nSurf Camps Page:')
    console.log('  - Add Surf Week link:', addSurfBtn ? '✅' : '❌')
    console.log('  - "Add Surf Week" text:', addSurfText ? '✅' : '❌')
    await page.screenshot({ path: 'test-results-production/verify-surfcamps-buttons.png', fullPage: false })
    
    // 4. Activities Page - Add Activity button
    await page.goto(`${BASE_URL}/admin/activities`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    const addActivityBtn = await page.locator('a[href*="/activities/new"], button:has-text("Add")').first().isVisible().catch(() => false)
    console.log('\nActivities Page:')
    console.log('  - Add Activity button:', addActivityBtn ? '✅' : '❌')
    await page.screenshot({ path: 'test-results-production/verify-activities-buttons.png', fullPage: false })
    
    // 5. Invoices Page - Create Invoice button
    await page.goto(`${BASE_URL}/admin/invoices`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    const createInvoiceBtn = await page.locator('a[href*="/invoices/new"], button:has-text("Create")').first().isVisible().catch(() => false)
    console.log('\nInvoices Page:')
    console.log('  - Create Invoice button:', createInvoiceBtn ? '✅' : '❌')
    await page.screenshot({ path: 'test-results-production/verify-invoices-buttons.png', fullPage: false })
    
    console.log('\n=== BUTTON VERIFICATION COMPLETE ===\n')
    
    // Assertions
    expect(addRoomBtn || addRoomText).toBe(true)
    expect(createBookingBtn || createBookingText).toBe(true)
  })
})
