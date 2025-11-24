import { Page } from '@playwright/test'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'heiwa_admin_2024'
const BASE_URL = process.env.BASE_URL || 'https://heiwahauz.netlify.app'

/**
 * Login as admin user
 */
export async function loginAsAdmin(page: Page, password: string = ADMIN_PASSWORD): Promise<void> {
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(2000)
  
  // Fill password input
  const passwordInput = page.locator('input[type="password"]')
  await passwordInput.waitFor({ timeout: 30000 })
  await passwordInput.fill(password)
  
  // Submit form
  const submitButton = page.locator('button[type="submit"]')
  await submitButton.waitFor({ timeout: 30000 })
  await submitButton.click()
  
  // Wait for redirect to dashboard
  await page.waitForURL('**/admin', { timeout: 30000 })
  await page.waitForTimeout(2000)
}

/**
 * Logout admin user
 */
export async function logoutAdmin(page: Page): Promise<void> {
  // Look for logout button/link
  const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), [data-testid="logout"]')
  
  if (await logoutButton.count() > 0) {
    await logoutButton.click()
    await page.waitForURL('**/admin/login', { timeout: 5000 })
  } else {
    // Clear cookies manually if logout button not found
    await page.context().clearCookies()
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(2000)
    
    // Check if we're redirected to login
    const currentUrl = page.url()
    return !currentUrl.includes('/admin/login')
  } catch {
    return false
  }
}

/**
 * Set admin auth cookie directly
 */
export async function setAdminCookie(page: Page, password: string = ADMIN_PASSWORD): Promise<void> {
  await page.context().addCookies([
    {
      name: 'admin_auth',
      value: password,
      domain: '.netlify.app',
      path: '/',
      httpOnly: false,
      secure: true,
      sameSite: 'Lax',
    }
  ])
}

