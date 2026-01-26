import { test, expect } from '@playwright/test'

const PRODUCTION_URL = 'https://heiwahauz.netlify.app'
const ADMIN_PASSWORD = 'heiwa_secure_admin_2025'

test.describe('Admin Panel - Comprehensive Feature Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies and navigate to login
    await page.context().clearCookies()
    await page.goto(`${PRODUCTION_URL}/admin/login`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(2000)
    
    // Login
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    
    // Wait for redirect to admin dashboard
    await page.waitForURL('**/admin', { timeout: 30000 })
    await page.waitForTimeout(2000)
  })

  test.describe('Dashboard Overview', () => {
    test('should display dashboard with statistics', async ({ page }) => {
      await page.waitForSelector('[data-testid="dashboard"]', { timeout: 30000 })
      
      // Check for stat cards
      const statCards = page.locator('[data-testid="stat-card"]')
      await expect(statCards.first()).toBeVisible({ timeout: 10000 })
      
      // Check for navigation
      const navSidebar = page.locator('[data-testid="admin-sidebar"]')
      await expect(navSidebar).toBeVisible({ timeout: 10000 })
    })

    test('should display quick action cards', async ({ page }) => {
      await page.waitForSelector('[data-testid="dashboard"]', { timeout: 30000 })
      
      const actionCards = page.locator('[data-testid="action-card"]')
      await expect(actionCards.first()).toBeVisible({ timeout: 10000 })
      
      // Check for specific actions
      const bookingsAction = page.locator('text=Bookings, i')
      const roomsAction = page.locator('text=Rooms, i')
      const clientsAction = page.locator('text=Clients, i')
      
      await expect(bookingsAction.or(roomsAction).or(clientsAction)).toHaveCount(3)
    })
  })

  test.describe('Bookings Management', () => {
    test('should display bookings list with all columns', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/admin/bookings`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Check for bookings table
      const bookingsTable = page.locator('[data-testid="bookings-table"]')
      await expect(bookingsTable).toBeVisible({ timeout: 30000 })
      
      // Check for columns
      const columns = page.locator('th')
      await expect(columns).toHaveCountGreaterThan(0)
    })

    test('should allow filtering bookings by status', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/admin/bookings`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Look for status filter
      const statusFilter = page.locator('[data-testid="status-filter"], select[name="status"], [aria-label*="status"]')
      if (await statusFilter.count() > 0) {
        await statusFilter.selectOption('confirmed')
        await page.waitForTimeout(2000)
        
        // Verify filter was applied
        const currentUrl = page.url()
        expect(currentUrl).toContain('status=confirmed')
      }
    })

    test('should allow searching bookings', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/admin/bookings`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Look for search input
      const searchInput = page.locator('[data-testid="search-input"], input[type="search"], input[placeholder*="search" i]')
      if (await searchInput.count() > 0) {
        await searchInput.fill('test')
        await page.waitForTimeout(2000)
        
        // Verify search was applied
        const currentUrl = page.url()
        expect(currentUrl).toContain('search=test')
      }
    })

    test('should allow viewing booking details', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/admin/bookings`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Look for first booking row
      const firstBooking = page.locator('[data-testid="booking-row"]').first()
      if (await firstBooking.count() > 0) {
        await firstBooking.click()
        await page.waitForTimeout(2000)
        
        // Verify we're on booking details page
        const currentUrl = page.url()
        expect(currentUrl).toMatch(/\/admin\/bookings\/.+/)
      }
    })
  })

  test.describe('Rooms Management', () => {
    test('should display rooms list', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/admin/rooms`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Check for rooms table
      const roomsTable = page.locator('[data-testid="rooms-table"]')
      await expect(roomsTable).toBeVisible({ timeout: 30000 })
      
      // Check for room cards or rows
      const roomItems = page.locator('[data-testid="room-card"], [data-testid="room-row"]')
      await expect(roomItems.first()).toBeVisible({ timeout: 10000 })
    })

    test('should allow creating new room', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/admin/rooms`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Look for "Add Room" button
      const addRoomButton = page.locator('button:has-text("Add Room"), button:has-text("New Room"), [data-testid="add-room"]')
      if (await addRoomButton.count() > 0) {
        await addRoomButton.click()
        await page.waitForTimeout(2000)
        
        // Verify we're on room creation page
        const currentUrl = page.url()
        expect(currentUrl).toMatch(/\/admin\/rooms\/(new|create)/)
      }
    })

    test('should allow editing existing room', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/admin/rooms`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Look for first room
      const firstRoom = page.locator('[data-testid="room-card"], [data-testid="room-row"]').first()
      if (await firstRoom.count() > 0) {
        await firstRoom.click()
        await page.waitForTimeout(2000)
        
        // Verify we're on room edit page
        const currentUrl = page.url()
        expect(currentUrl).toMatch(/\/admin\/rooms\/.+/)
      }
    })
  })

  test.describe('Clients Management', () => {
    test('should display clients list', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/admin/clients`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Check for clients table
      const clientsTable = page.locator('[data-testid="clients-table"]')
      await expect(clientsTable).toBeVisible({ timeout: 30000 })
    })

    test('should allow searching clients', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/admin/clients`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Look for search input
      const searchInput = page.locator('[data-testid="search-input"], input[type="search"], input[placeholder*="search" i]')
      if (await searchInput.count() > 0) {
        await searchInput.fill('john')
        await page.waitForTimeout(2000)
        
        // Verify search was applied
        const currentUrl = page.url()
        expect(currentUrl).toContain('search=john')
      }
    })

    test('should allow viewing client details', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/admin/clients`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Look for first client
      const firstClient = page.locator('[data-testid="client-row"], [data-testid="client-card"]').first()
      if (await firstClient.count() > 0) {
        await firstClient.click()
        await page.waitForTimeout(2000)
        
        // Verify we're on client details page
        const currentUrl = page.url()
        expect(currentUrl).toMatch(/\/admin\/clients\/.+/)
      }
    })
  })

  test.describe('Surf Camps Management', () => {
    test('should display surf camps list', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/admin/surf-camps`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Check for surf camps table
      const surfCampsTable = page.locator('[data-testid="surf-camps-table"]')
      await expect(surfCampsTable).toBeVisible({ timeout: 30000 })
    })

    test('should allow creating new surf camp', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/admin/surf-camps`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Look for "Add Surf Camp" button
      const addCampButton = page.locator('button:has-text("Add Surf Camp"), button:has-text("New Camp"), [data-testid="add-surf-camp"]')
      if (await addCampButton.count() > 0) {
        await addCampButton.click()
        await page.waitForTimeout(2000)
        
        // Verify we're on surf camp creation page
        const currentUrl = page.url()
        expect(currentUrl).toMatch(/\/admin\/surf-camps\/(new|create)/)
      }
    })
  })

  test.describe('Analytics Dashboard', () => {
    test('should display analytics page', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/admin/analytics`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Check for analytics content
      const analyticsContent = page.locator('[data-testid="analytics"], [data-testid="charts"]')
      await expect(analyticsContent.first()).toBeVisible({ timeout: 30000 })
    })

    test('should display revenue charts', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/admin/analytics`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Look for charts
      const charts = page.locator('[data-testid="chart"], canvas, svg')
      await expect(charts.first()).toBeVisible({ timeout: 30000 })
    })

    test('should have date range selector', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/admin/analytics`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Look for date range selector
      const dateRange = page.locator('[data-testid="date-range"], input[type="date"]')
      await expect(dateRange.first()).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Calendar View', () => {
    test('should display calendar view', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/admin/calendar`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Check for calendar
      const calendar = page.locator('[data-testid="calendar"], [data-testid="calendar-view"]')
      await expect(calendar.first()).toBeVisible({ timeout: 30000 })
    })

    test('should display bookings on calendar', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/admin/calendar`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Look for calendar events
      const calendarEvents = page.locator('[data-testid="calendar-event"], [data-testid="booking-event"]')
      await expect(calendarEvents.first()).toBeVisible({ timeout: 30000 })
    })
  })

  test.describe('CMS Homepage Editor', () => {
    test('should display homepage editor', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/admin/homepage`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Check for CMS editor
      const cmsEditor = page.locator('[data-testid="cms-editor"], [data-testid="homepage-editor"]')
      await expect(cmsEditor.first()).toBeVisible({ timeout: 30000 })
    })

    test('should allow editing hero section', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/admin/homepage`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Look for hero section editor
      const heroEditor = page.locator('[data-testid="hero-editor"], [data-testid="section-editor"][data-section="hero"]')
      if (await heroEditor.count() > 0) {
        await expect(heroEditor).toBeVisible({ timeout: 10000 })
      }
    })
  })

  test.describe('Activities Management', () => {
    test('should display activities list', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/admin/activities`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Check for activities table
      const activitiesTable = page.locator('[data-testid="activities-table"]')
      await expect(activitiesTable).toBeVisible({ timeout: 30000 })
    })

    test('should allow creating new activity', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/admin/activities`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Look for "Add Activity" button
      const addActivityButton = page.locator('button:has-text("Add Activity"), button:has-text("New Activity"), [data-testid="add-activity"]')
      if (await addActivityButton.count() > 0) {
        await addActivityButton.click()
        await page.waitForTimeout(2000)
        
        // Verify we're on activity creation page
        const currentUrl = page.url()
        expect(currentUrl).toMatch(/\/admin\/activities\/(new|create)/)
      }
    })
  })

  test.describe('Add-ons Management', () => {
    test('should display add-ons list', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/admin/addons`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Check for add-ons table
      const addonsTable = page.locator('[data-testid="addons-table"]')
      await expect(addonsTable).toBeVisible({ timeout: 30000 })
    })

    test('should allow creating new add-on', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/admin/addons`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Look for "Add Add-on" button
      const addAddonButton = page.locator('button:has-text("Add Add-on"), button:has-text("New Add-on"), [data-testid="add-addon"]')
      if (await addAddonButton.count() > 0) {
        await addAddonButton.click()
        await page.waitForTimeout(2000)
        
        // Verify we're on add-on creation page
        const currentUrl = page.url()
        expect(currentUrl).toMatch(/\/admin\/addons\/(new|create)/)
      }
    })
  })

  test.describe('Payments & Invoices', () => {
    test('should display payments list', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/admin/payments`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Check for payments table
      const paymentsTable = page.locator('[data-testid="payments-table"]')
      await expect(paymentsTable).toBeVisible({ timeout: 30000 })
    })

    test('should display invoices list', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/admin/invoices`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Check for invoices table
      const invoicesTable = page.locator('[data-testid="invoices-table"]')
      await expect(invoicesTable).toBeVisible({ timeout: 30000 })
    })

    test('should allow generating invoice', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/admin/invoices`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Look for "Generate Invoice" button
      const generateButton = page.locator('button:has-text("Generate Invoice"), button:has-text("Create Invoice"), [data-testid="generate-invoice"]')
      if (await generateButton.count() > 0) {
        await expect(generateButton).toBeVisible({ timeout: 10000 })
      }
    })
  })

  test.describe('Gallery Management', () => {
    test('should display gallery management', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/admin/gallery`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Check for gallery content
      const galleryContent = page.locator('[data-testid="gallery"], [data-testid="gallery-manager"]')
      await expect(galleryContent.first()).toBeVisible({ timeout: 30000 })
    })

    test('should allow uploading images', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/admin/gallery`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Look for upload button
      const uploadButton = page.locator('button:has-text("Upload"), input[type="file"], [data-testid="upload-button"]')
      if (await uploadButton.count() > 0) {
        await expect(uploadButton.first()).toBeVisible({ timeout: 10000 })
      }
    })
  })

  test.describe('Navigation & Layout', () => {
    test('should have working navigation sidebar', async ({ page }) => {
      const navSidebar = page.locator('[data-testid="admin-sidebar"]')
      await expect(navSidebar).toBeVisible({ timeout: 30000 })
      
      // Check for navigation links
      const navLinks = navSidebar.locator('a, button')
      await expect(navLinks.first()).toBeVisible({ timeout: 10000 })
    })

    test('should allow navigating between admin pages', async ({ page }) => {
      // Navigate to bookings
      await page.goto(`${PRODUCTION_URL}/admin/bookings`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(2000)
      expect(page.url()).toContain('/admin/bookings')
      
      // Navigate to rooms
      await page.goto(`${PRODUCTION_URL}/admin/rooms`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(2000)
      expect(page.url()).toContain('/admin/rooms')
      
      // Navigate to clients
      await page.goto(`${PRODUCTION_URL}/admin/clients`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(2000)
      expect(page.url()).toContain('/admin/clients')
    })

    test('should maintain authentication across pages', async ({ page }) => {
      // Navigate to multiple pages
      await page.goto(`${PRODUCTION_URL}/admin/bookings`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(2000)
      expect(page.url()).not.toContain('/login')
      
      await page.goto(`${PRODUCTION_URL}/admin/rooms`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(2000)
      expect(page.url()).not.toContain('/login')
      
      await page.goto(`${PRODUCTION_URL}/admin/clients`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(2000)
      expect(page.url()).not.toContain('/login')
    })
  })

  test.describe('Responsive Design', () => {
    test('should be usable on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${PRODUCTION_URL}/admin`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Check for mobile menu
      const mobileMenu = page.locator('[data-testid="mobile-menu"], button[aria-label*="menu" i]')
      await expect(mobileMenu.first()).toBeVisible({ timeout: 30000 })
      
      // Check for responsive layout
      const dashboard = page.locator('[data-testid="dashboard"]')
      await expect(dashboard).toBeVisible({ timeout: 30000 })
    })

    test('should be usable on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${PRODUCTION_URL}/admin`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Check for responsive layout
      const dashboard = page.locator('[data-testid="dashboard"]')
      await expect(dashboard).toBeVisible({ timeout: 30000 })
    })
  })

  test.describe('Performance & Loading', () => {
    test('should load admin panel quickly', async ({ page }) => {
      const startTime = Date.now()
      await page.goto(`${PRODUCTION_URL}/admin`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(2000)
      const loadTime = Date.now() - startTime
      
      expect(loadTime).toBeLessThan(10000) // Should load in less than 10 seconds
    })

    test('should have no console errors', async ({ page }) => {
      const errors: string[] = []
      page.on('console', (msg) => {
        if (msg.type === 'error') {
          errors.push(msg.text)
        }
      })
      
      await page.goto(`${PRODUCTION_URL}/admin`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Navigate to a few pages
      await page.goto(`${PRODUCTION_URL}/admin/bookings`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(2000)
      
      await page.goto(`${PRODUCTION_URL}/admin/rooms`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(2000)
      
      // Check for errors
      expect(errors.length).toBe(0)
    })
  })

  test.describe('Error Handling', () => {
    test('should handle invalid routes gracefully', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/admin/invalid-route`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(2000)
      
      // Should show 404 or redirect
      const currentUrl = page.url()
      expect(currentUrl).toMatch(/\/admin\/(404|not-found)/)
    })

    test('should display error messages for invalid data', async ({ page }) => {
      // Try to access a non-existent booking
      await page.goto(`${PRODUCTION_URL}/admin/bookings/invalid-id`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(2000)
      
      // Should show error message
      const errorMessage = page.locator('text=/not found|error|invalid/i')
      await expect(errorMessage.first()).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Logout & Session Management', () => {
    test('should allow logout', async ({ page }) => {
      const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), [data-testid="logout"]')
      if (await logoutButton.count() > 0) {
        await logoutButton.click()
        await page.waitForURL('**/admin/login', { timeout: 10000 })
        
        // Verify we're on login page
        expect(page.url()).toContain('/admin/login')
      }
    })

    test('should clear session on logout', async ({ page }) => {
      // Logout
      const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), [data-testid="logout"]')
      if (await logoutButton.count() > 0) {
        await logoutButton.click()
        await page.waitForURL('**/admin/login', { timeout: 10000 })
        
        // Try to access admin dashboard
        await page.goto(`${PRODUCTION_URL}/admin`, { waitUntil: 'domcontentloaded', timeout: 60000 })
        await page.waitForTimeout(2000)
        
        // Should redirect to login
        expect(page.url()).toContain('/admin/login')
      }
    })
  })
})
