import { Page } from '@playwright/test'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'heiwa_secure_admin_2025'
const BASE_URL = process.env.BASE_URL || 'https://heiwahauz.netlify.app'

// Extract domain from BASE_URL for cookie setting
function getCookieDomain(): string {
  try {
    const url = new URL(BASE_URL)
    return url.hostname
  } catch {
    return 'localhost'
  }
}

/**
 * Login as admin user by setting the auth cookie directly.
 * This bypasses the login form and rate limiting.
 */
export async function loginAsAdmin(page: Page, password: string = ADMIN_PASSWORD): Promise<void> {
  const domain = getCookieDomain()
  const isSecure = BASE_URL.startsWith('https')

  // Set the admin_auth cookie directly to bypass rate limiting
  await page.context().addCookies([
    {
      name: 'admin_auth',
      value: password,
      domain: domain,
      path: '/',
      httpOnly: false,
      secure: isSecure,
      sameSite: 'Lax',
    }
  ])

  // Navigate to admin to verify auth works
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded', timeout: 60000 })

  // Wait for page to load and verify we're not redirected to login
  await page.waitForTimeout(2000)

  // If we're still on login page, the cookie didn't work - try form login as fallback
  if (page.url().includes('/login')) {
    // Wait for form to appear
    const passwordInput = page.locator('input[type="password"]')
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 })
    await passwordInput.fill(password)

    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Wait for redirect
    await page.waitForFunction(
      () => !window.location.pathname.includes('/login'),
      { timeout: 30000 }
    )
    await page.waitForTimeout(1000)
  }
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
  const domain = getCookieDomain()
  const isSecure = BASE_URL.startsWith('https')

  await page.context().addCookies([
    {
      name: 'admin_auth',
      value: password,
      domain: domain,
      path: '/',
      httpOnly: false,
      secure: isSecure,
      sameSite: 'Lax',
    }
  ])
}

