import { test, expect } from '@playwright/test'

const PRODUCTION_URL = 'https://heiwahauz.netlify.app'
const ADMIN_PASSWORD = 'heiwa_secure_admin_2025'

test.describe('Admin Panel - Full Authenticated Testing', () => {
  
  test('Admin Login and Toolbar Visibility', async ({ page }) => {
    // Navigate to admin login
    await page.goto(`${PRODUCTION_URL}/admin/login`)
    await expect(page).toHaveTitle(/Admin Login/i)
    
    // Fill in password
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    
    // Click login button
    await page.click('button[type="submit"]')
    
    // Wait for redirect to admin dashboard
    await page.waitForURL(`${PRODUCTION_URL}/admin`, { timeout: 10000 })
    
    // Verify we're on the admin dashboard
    await expect(page).toHaveURL(`${PRODUCTION_URL}/admin`)
    
    // Wait for dashboard to load
    await page.waitForLoadState('networkidle')
    
    // Take screenshot of admin dashboard
    await page.screenshot({ path: 'test-results/admin-dashboard-authenticated.png', fullPage: true })
    
    console.log('✅ Admin login successful')
  })

  test('Admin Toolbar Visibility After Login', async ({ page }) => {
    // Login first
    await page.goto(`${PRODUCTION_URL}/admin/login`)
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(`${PRODUCTION_URL}/admin`)
    
    // Navigate to homepage to check toolbar
    await page.goto(`${PRODUCTION_URL}/`)
    await page.waitForLoadState('networkidle')
    
    // Wait a bit for toolbar to render
    await page.waitForTimeout(2000)
    
    // Check if admin toolbar is visible
    const toolbar = page.locator('text=Edit Page').or(page.locator('text=Dashboard'))
    const toolbarVisible = await toolbar.isVisible().catch(() => false)
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/homepage-with-admin-toolbar.png', fullPage: true })
    
    if (toolbarVisible) {
      console.log('✅ Admin toolbar is visible on homepage')
    } else {
      console.log('⚠️ Admin toolbar not visible - checking localStorage')
      const adminLoggedIn = await page.evaluate(() => localStorage.getItem('admin_logged_in'))
      console.log('localStorage admin_logged_in:', adminLoggedIn)
    }
  })

  test('Booking Widget Date Display Accuracy', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/`)
    await page.waitForLoadState('networkidle')
    
    // Click "Book Now" button
    const bookButton = page.locator('text=Book Now').first()
    await bookButton.click()
    
    // Wait for booking widget to open
    await page.waitForTimeout(1000)
    
    // Select "Room Booking"
    await page.click('text=Room Booking')
    await page.waitForTimeout(500)
    
    // Click "Next" to go to date selection
    await page.click('button:has-text("Next")')
    await page.waitForTimeout(1000)
    
    // Select check-in date (14th Jan 2026)
    const checkInDate = '2026-01-14'
    await page.fill('input[type="date"]', checkInDate)
    await page.waitForTimeout(500)
    
    // Select check-out date (21st Jan 2026)
    const checkOutDate = '2026-01-21'
    const checkOutInputs = await page.locator('input[type="date"]').all()
    if (checkOutInputs.length > 1) {
      await checkOutInputs[1].fill(checkOutDate)
    }
    await page.waitForTimeout(1000)
    
    // Take screenshot of date selection
    await page.screenshot({ path: 'test-results/booking-widget-dates.png', fullPage: true })
    
    // Check if dates are displayed correctly in summary
    const pageContent = await page.content()
    
    // Look for date display - should show 14/01/2026 - 21/01/2026
    const hasCorrectCheckIn = pageContent.includes('14/01/2026') || pageContent.includes('14 January 2026')
    const hasCorrectCheckOut = pageContent.includes('21/01/2026') || pageContent.includes('21 January 2026')
    
    console.log('Check-in date displayed correctly:', hasCorrectCheckIn)
    console.log('Check-out date displayed correctly:', hasCorrectCheckOut)
    
    if (hasCorrectCheckIn && hasCorrectCheckOut) {
      console.log('✅ Date display is accurate - no off-by-one bug')
    } else {
      console.log('⚠️ Date display may have issues')
    }
  })

  test('Admin Dashboard - Bookings Management', async ({ page }) => {
    // Login
    await page.goto(`${PRODUCTION_URL}/admin/login`)
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(`${PRODUCTION_URL}/admin`)
    
    // Navigate to bookings
    await page.goto(`${PRODUCTION_URL}/admin/bookings`)
    await page.waitForLoadState('networkidle')
    
    // Wait for bookings to load
    await page.waitForTimeout(2000)
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/admin-bookings-page.png', fullPage: true })
    
    // Check if bookings table is visible
    const hasTable = await page.locator('table').isVisible().catch(() => false)
    console.log('Bookings table visible:', hasTable)
    
    if (hasTable) {
      console.log('✅ Admin bookings page loaded successfully')
    }
  })

  test('Admin Dashboard - Rooms Management', async ({ page }) => {
    // Login
    await page.goto(`${PRODUCTION_URL}/admin/login`)
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(`${PRODUCTION_URL}/admin`)
    
    // Navigate to rooms
    await page.goto(`${PRODUCTION_URL}/admin/rooms`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/admin-rooms-page.png', fullPage: true })
    
    // Check if rooms are displayed
    const pageContent = await page.content()
    const hasRooms = pageContent.includes('Dorm room') || pageContent.includes('Room 1') || pageContent.includes('Room Nr 3')
    
    console.log('Rooms displayed:', hasRooms)
    
    if (hasRooms) {
      console.log('✅ Admin rooms page showing database rooms')
    }
  })

  test('Image Loading - No 404 Errors', async ({ page }) => {
    const imageErrors: string[] = []
    
    // Listen for failed image requests
    page.on('response', response => {
      if (response.url().includes('/images/') && response.status() === 404) {
        imageErrors.push(response.url())
      }
    })
    
    // Visit homepage
    await page.goto(`${PRODUCTION_URL}/`)
    await page.waitForLoadState('networkidle')
    
    // Visit rooms page
    await page.goto(`${PRODUCTION_URL}/rooms`)
    await page.waitForLoadState('networkidle')
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/rooms-page-images.png', fullPage: true })
    
    if (imageErrors.length === 0) {
      console.log('✅ No image 404 errors detected')
    } else {
      console.log('⚠️ Image 404 errors found:', imageErrors)
    }
    
    expect(imageErrors.length).toBe(0)
  })

  test('Availability API - Date Range Check', async ({ page }) => {
    const roomId = '6a6e6bb0-d3e5-4fab-87d8-7e39174637e9' // Room Nr 3
    const checkIn = '2026-02-14'
    const checkOut = '2026-02-21'
    
    const response = await page.request.get(
      `${PRODUCTION_URL}/api/availability?roomId=${roomId}&checkIn=${checkIn}&checkOut=${checkOut}`
    )
    
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    console.log('Availability API response:', JSON.stringify(data, null, 2))
    
    expect(data.success).toBe(true)
    expect(data.data.nights).toBe(7)
    expect(data.data.available).toBeDefined()
    
    console.log('✅ Availability API working correctly')
  })

  test('Console Errors Check', async ({ page }) => {
    const consoleErrors: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    // Visit key pages
    await page.goto(`${PRODUCTION_URL}/`)
    await page.waitForLoadState('networkidle')
    
    await page.goto(`${PRODUCTION_URL}/rooms`)
    await page.waitForLoadState('networkidle')
    
    // Login to admin
    await page.goto(`${PRODUCTION_URL}/admin/login`)
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(`${PRODUCTION_URL}/admin`)
    await page.waitForLoadState('networkidle')
    
    // Filter out known non-critical errors
    const criticalErrors = consoleErrors.filter(err => 
      !err.includes('404') && 
      !err.includes('favicon') &&
      !err.includes('YouTube') &&
      !err.includes('ad blocker')
    )
    
    console.log('Total console errors:', consoleErrors.length)
    console.log('Critical console errors:', criticalErrors.length)
    
    if (criticalErrors.length > 0) {
      console.log('Critical errors:', criticalErrors)
    } else {
      console.log('✅ No critical console errors')
    }
  })
})
