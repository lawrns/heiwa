import { test, expect } from '@playwright/test'

test('should login to admin panel', async ({ page }) => {
  // Go to admin login page
  await page.goto('/admin/login')
  await page.waitForLoadState('domcontentloaded')
  
  // Fill password
  const passwordInput = page.locator('input[type="password"]')
  await passwordInput.waitFor({ timeout: 10000 })
  await passwordInput.fill('HeiwaHouse2024!SecureDevPassword')
  
  // Click submit
  await page.locator('button[type="submit"]').click()
  
  // Wait for redirect to admin dashboard  
  await page.waitForURL('**/admin', { timeout: 15000 })
  
  // Verify we're on admin page
  expect(page.url()).toContain('/admin')
  expect(page.url()).not.toContain('/login')
  
  console.log('✅ Successfully logged in to admin panel!')
})

test('should access admin bookings after login', async ({ page }) => {
  // Login first
  await page.goto('/admin/login')
  await page.waitForLoadState('domcontentloaded')
  
  const passwordInput = page.locator('input[type="password"]')
  await passwordInput.waitFor({ timeout: 10000 })
  await passwordInput.fill('HeiwaHouse2024!SecureDevPassword')
  await page.locator('button[type="submit"]').click()
  await page.waitForURL('**/admin', { timeout: 15000 })
  
  // Now navigate to bookings
  await page.goto('/admin/bookings')
  await page.waitForLoadState('domcontentloaded')
  
  // Verify we're on bookings page (not redirected to login)
  expect(page.url()).toContain('/admin/bookings')
  console.log('✅ Successfully accessed admin bookings page!')
})
