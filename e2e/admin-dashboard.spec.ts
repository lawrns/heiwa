import { test, expect } from '@playwright/test'

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin dashboard
    await page.goto('/admin')
  })

  test('should display dashboard header', async ({ page }) => {
    // Check for main heading
    const heading = page.locator('h1')
    await expect(heading).toContainText('Dashboard')
  })

  test('should display stat cards', async ({ page }) => {
    // Check for stat cards
    const statCards = page.locator('[class*="stat"]')
    const count = await statCards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should display action cards', async ({ page }) => {
    // Check for action cards
    const actionCards = page.locator('[class*="action"]')
    const count = await actionCards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should have working navigation', async ({ page }) => {
    // Check sidebar navigation
    const sidebar = page.locator('aside')
    await expect(sidebar).toBeVisible()

    // Check for navigation links
    const navLinks = page.locator('nav a')
    const count = await navLinks.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should navigate to bookings page', async ({ page }) => {
    // Click bookings link
    await page.click('a[href*="bookings"]')
    
    // Wait for navigation
    await page.waitForURL('**/bookings')
    
    // Check page content
    const heading = page.locator('h1')
    await expect(heading).toContainText('Bookings')
  })
})

test.describe('Admin Bookings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/bookings')
  })

  test('should display bookings table', async ({ page }) => {
    // Check for table
    const table = page.locator('table')
    await expect(table).toBeVisible()
  })

  test('should have search functionality', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[placeholder*="Search"]')
    await expect(searchInput).toBeVisible()

    // Type in search
    await searchInput.fill('John')
    
    // Wait for results
    await page.waitForTimeout(500)
    
    // Check results updated
    const rows = page.locator('tbody tr')
    const count = await rows.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should have filter functionality', async ({ page }) => {
    // Find filter select
    const filterSelect = page.locator('select')
    await expect(filterSelect).toBeVisible()

    // Change filter
    await filterSelect.selectOption('confirmed')
    
    // Wait for results
    await page.waitForTimeout(500)
  })

  test('should have pagination', async ({ page }) => {
    // Check for pagination controls
    const paginationButtons = page.locator('button[aria-label*="page"]')
    const count = await paginationButtons.count()
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('Admin Clients Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/clients')
  })

  test('should display clients page', async ({ page }) => {
    const heading = page.locator('h1')
    await expect(heading).toContainText('Clients')
  })

  test('should have search functionality', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]')
    await expect(searchInput).toBeVisible()

    await searchInput.fill('John')
    await page.waitForTimeout(500)
  })

  test('should have status filter', async ({ page }) => {
    const filterSelect = page.locator('select')
    await expect(filterSelect).toBeVisible()

    await filterSelect.selectOption('active')
    await page.waitForTimeout(500)
  })

  test('should display client stats', async ({ page }) => {
    // Check for stat cards
    const stats = page.locator('[class*="stat"]')
    const count = await stats.count()
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('Admin Rooms Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/rooms')
  })

  test('should display rooms page', async ({ page }) => {
    const heading = page.locator('h1')
    await expect(heading).toContainText('Rooms')
  })

  test('should have search and filter', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]')
    const filterSelect = page.locator('select')

    await expect(searchInput).toBeVisible()
    await expect(filterSelect).toBeVisible()
  })

  test('should display room cards', async ({ page }) => {
    const cards = page.locator('[class*="card"]')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('Admin Surf Camps Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/surf-camps')
  })

  test('should display surf camps page', async ({ page }) => {
    const heading = page.locator('h1')
    await expect(heading).toContainText('Surf Camps')
  })

  test('should have level filtering', async ({ page }) => {
    const filterSelect = page.locator('select')
    await expect(filterSelect).toBeVisible()

    await filterSelect.selectOption('beginner')
    await page.waitForTimeout(500)
  })
})

test.describe('Admin Activities Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/activities')
  })

  test('should display activities page', async ({ page }) => {
    const heading = page.locator('h1')
    await expect(heading).toContainText('Activities')
  })

  test('should have category filtering', async ({ page }) => {
    const filterSelect = page.locator('select')
    await expect(filterSelect).toBeVisible()

    await filterSelect.selectOption('play')
    await page.waitForTimeout(500)
  })
})

test.describe('Admin Add-ons Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/add-ons')
  })

  test('should display add-ons page', async ({ page }) => {
    const heading = page.locator('h1')
    await expect(heading).toContainText('Add-ons')
  })

  test('should have category filtering', async ({ page }) => {
    const filterSelect = page.locator('select')
    await expect(filterSelect).toBeVisible()

    await filterSelect.selectOption('equipment')
    await page.waitForTimeout(500)
  })

  test('should display stats', async ({ page }) => {
    const stats = page.locator('[class*="stat"]')
    const count = await stats.count()
    expect(count).toBeGreaterThan(0)
  })
})
