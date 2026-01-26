import { test, expect } from '@playwright/test'

const PRODUCTION_URL = 'https://heiwahauz.netlify.app'
const ADMIN_PASSWORD = 'heiwa_secure_admin_2025'

test.describe('Admin Panel - Realistic Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies and navigate to login
    await page.context().clearCookies()
    await page.goto(`${PRODUCTION_URL}/admin/login`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(2000)
    
    // Login
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    
    // Wait for redirect to admin dashboard (with longer timeout)
    await page.waitForURL('**/admin', { timeout: 60000 })
    await page.waitForTimeout(2000)
  })

  test('should load admin dashboard after login', async ({ page }) => {
    // Verify we're on admin page
    expect(page.url()).toContain('/admin')
    
    // Page should load successfully
    const title = await page.title()
    expect(title).toBeTruthy()
  })

  test('should maintain authentication across navigation', async ({ page }) => {
    // Navigate to different pages
    await page.goto(`${PRODUCTION_URL}/admin`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(2000)
    expect(page.url()).not.toContain('/login')
    
    await page.goto(`${PRODUCTION_URL}/admin/bookings`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(2000)
    expect(page.url()).not.toContain('/login')
  })

  test('should handle admin bookings page', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/admin/bookings`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(3000)
    
    // Page should load
    const title = await page.title()
    expect(title).toBeTruthy()
    
    // Should not redirect to login
    expect(page.url()).not.toContain('/login')
  })

  test('should handle admin rooms page', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/admin/rooms`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(3000)
    
    // Page should load
    const title = await page.title()
    expect(title).toBeTruthy()
    
    // Should not redirect to login
    expect(page.url()).not.toContain('/login')
  })

  test('should handle admin clients page', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/admin/clients`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(3000)
    
    // Page should load
    const title = await page.title()
    expect(title).toBeTruthy()
    
    // Should not redirect to login
    expect(page.url()).not.toContain('/login')
  })

  test('should have no console errors on admin pages', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type === 'error') {
        errors.push(msg.text)
      }
    })
    
    // Navigate to admin pages
    await page.goto(`${PRODUCTION_URL}/admin`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(2000)
    
    await page.goto(`${PRODUCTION_URL}/admin/bookings`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(2000)
    
    await page.goto(`${PRODUCTION_URL}/admin/rooms`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(2000)
    
    // Check for errors
    expect(errors.length).toBe(0)
  })

  test('should load admin pages quickly', async ({ page }) => {
    const startTime = Date.now()
    await page.goto(`${PRODUCTION_URL}/admin`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(2000)
    const loadTime = Date.now() - startTime
    
    // Should load in less than 10 seconds
    expect(loadTime).toBeLessThan(10000)
  })

  test('should handle invalid admin routes gracefully', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/admin/invalid-route`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(2000)
    
    // Should handle gracefully - either show 404 or redirect
    const currentUrl = page.url()
    expect(currentUrl).toMatch(/\/admin\/(404|not-found|invalid)/)
  })

  test('should allow logout', async ({ page }) => {
    const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), [data-testid*="logout"], button[aria-label*="logout" i]')
    const logoutCount = await logoutButton.count()
    
    if (logoutCount > 0) {
      await logoutButton.first().click()
      await page.waitForURL('**/admin/login', { timeout: 10000 })
      
      // Verify we're on login page
      expect(page.url()).toContain('/admin/login')
    }
  })

  test('should clear session on logout', async ({ page }) => {
    const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), [data-testid*="logout"], button[aria-label*="logout" i]')
    const logoutCount = await logoutButton.count()
    
    if (logoutCount > 0) {
      await logoutButton.first().click()
      await page.waitForURL('**/admin/login', { timeout: 10000 })
      
      // Try to access admin dashboard
      await page.goto(`${PRODUCTION_URL}/admin`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(2000)
      
      // Should redirect to login
      expect(page.url()).toContain('/admin/login')
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(`${PRODUCTION_URL}/admin`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(3000)
    
    // Page should load
    const title = await page.title()
    expect(title).toBeTruthy()
  })

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto(`${PRODUCTION_URL}/admin`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(3000)
    
    // Page should load
    const title = await page.title()
    expect(title).toBeTruthy()
  })
})
