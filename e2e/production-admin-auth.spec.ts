import { test, expect } from '@playwright/test'
import { loginAsAdmin, logoutAdmin, isAuthenticated } from './fixtures/admin-auth'

test.describe('Admin Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth
    await page.context().clearCookies()
  })

  test('should display admin login page', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(2000)
    
    // Check for login form elements
    const passwordInput = page.locator('input[type="password"]')
    await expect(passwordInput).toBeVisible({ timeout: 30000 })
    
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeVisible({ timeout: 30000 })
  })

  test('should login with correct password', async ({ page }) => {
    await loginAsAdmin(page, 'heiwa_secure_admin_2025')
    
    // Should redirect to dashboard (with longer timeout)
    await expect(page).toHaveURL(/.*\/admin/, { timeout: 30000 })
    
    // Should not be on login page
    expect(page.url()).not.toContain('/admin/login')
  })

  test('should reject incorrect password', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(2000)
    
    // Fill incorrect password
    await page.fill('input[type="password"]', 'wrong_password')
    await page.click('button[type="submit"]')
    
    // Should show error message
    await page.waitForTimeout(1000)
    
    // Should still be on login page
    expect(page.url()).toContain('/admin/login')
    
    // Check for error message
    const errorMessage = page.locator('text=/invalid|error|incorrect/i')
    const errorCount = await errorMessage.count()
    expect(errorCount).toBeGreaterThan(0)
  })

  test('should redirect to login when accessing protected route without auth', async ({ page }) => {
    // Clear cookies
    await page.context().clearCookies()
    
    // Try to access admin dashboard
    await page.goto('/admin', { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(2000)
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*\/admin\/login/)
  })

  test('should maintain session after login', async ({ page }) => {
    await loginAsAdmin(page)
    
    // Navigate to different admin pages
    await page.goto('/admin/bookings', { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(2000)
    
    // Should not redirect to login
    expect(page.url()).not.toContain('/admin/login')
    
    await page.goto('/admin/rooms', { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(2000)
    
    // Should still be authenticated
    expect(page.url()).not.toContain('/admin/login')
  })

  test('should set admin_auth cookie on successful login', async ({ page }) => {
    await loginAsAdmin(page)
    
    // Check for admin_auth cookie
    const cookies = await page.context().cookies()
    const adminCookie = cookies.find(c => c.name === 'admin_auth')
    
    expect(adminCookie).toBeDefined()
    expect(adminCookie?.value).toBe('heiwa_secure_admin_2025')
  })

  test('should logout successfully', async ({ page }) => {
    await loginAsAdmin(page)
    
    // Verify we're logged in
    const authenticated = await isAuthenticated(page)
    expect(authenticated).toBe(true)
    
    // Logout
    await logoutAdmin(page)
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*\/admin\/login/)
  })

  test('should redirect to dashboard after successful login', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(2000)
    
    await page.fill('input[type="password"]', 'heiwa_secure_admin_2025')
    await page.click('button[type="submit"]')
    
    // Wait for redirect
    await page.waitForURL('**/admin', { timeout: 10000 })
    
    // Should be on dashboard
    expect(page.url()).toMatch(/.*\/admin$/)
  })
})

