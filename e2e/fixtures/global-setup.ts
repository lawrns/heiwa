import { chromium, FullConfig } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects?.[0]?.use?.baseURL || process.env.BASE_URL || 'https://heiwahauz.netlify.app'
  const adminPassword = process.env.ADMIN_PASSWORD || 'heiwa_admin_2024'
  
  // Create auth directory if it doesn't exist
  const authDir = path.join(process.cwd(), 'e2e', '.auth')
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true })
  }

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()
  
  try {
    console.log(`🔐 Attempting admin authentication at ${baseURL}/admin/login`)
    
    // Navigate to login page
    await page.goto(`${baseURL}/admin/login`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    
    // Wait for either password input or already redirected to admin
    try {
      await Promise.race([
        page.waitForSelector('input[type="password"]', { timeout: 15000 }),
        page.waitForURL('**/admin', { timeout: 15000 })
      ])
    } catch {
      // Continue anyway
    }
    
    // Check if already authenticated (redirected to admin)
    if (page.url().includes('/admin') && !page.url().includes('/login')) {
      console.log('✅ Already authenticated')
    } else {
      // Fill in password
      const passwordInput = page.locator('input[type="password"]')
      if (await passwordInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await passwordInput.fill(adminPassword)
        console.log('✅ Password entered')
        
        // Submit login form
        await page.locator('button[type="submit"]').click()
        console.log('✅ Login form submitted')
        
        // Wait for redirect to dashboard
        await page.waitForURL('**/admin', { timeout: 20000 }).catch(() => {})
        
        // Extra wait for client-side hydration
        await page.waitForTimeout(3000)
        
        // Force refresh to ensure cookies are properly set
        await page.reload({ waitUntil: 'domcontentloaded' })
        await page.waitForTimeout(2000)
      }
    }
    
    // Verify we're on admin page
    if (page.url().includes('/admin') && !page.url().includes('/login')) {
      console.log('✅ Redirected to admin dashboard:', page.url())
      
      // Save authentication state
      await context.storageState({ path: path.join(authDir, 'admin.json') })
      console.log('✅ Admin authentication successful - auth state saved')
    } else {
      throw new Error(`Still on login page: ${page.url()}`)
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ Failed to authenticate admin:', errorMessage)
    console.warn('⚠️ Continuing without global auth - tests will authenticate individually')
    
    // Create empty auth file so tests know to authenticate themselves
    fs.writeFileSync(
      path.join(authDir, 'admin.json'),
      JSON.stringify({ cookies: [], origins: [] }, null, 2)
    )
  } finally {
    await browser.close()
  }
}

export default globalSetup
