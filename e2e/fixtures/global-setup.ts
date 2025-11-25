import { chromium, FullConfig } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects?.[0]?.use?.baseURL || process.env.BASE_URL || 'https://heiwahauz.netlify.app'
  const adminPassword = process.env.ADMIN_PASSWORD || 'heiwa_admin_2024'
  
  // Create auth directory if it doesn't exist
  // Use process.cwd() for compatibility
  const authDir = path.join(process.cwd(), 'e2e', '.auth')
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true })
  }

  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    console.log(`🔐 Attempting admin authentication at ${baseURL}/admin/login`)
    
    // Navigate to login page with longer timeout
    await page.goto(`${baseURL}/admin/login`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    
    // Wait for password input to be visible (more reliable than networkidle)
    await page.waitForSelector('input[type="password"]', { timeout: 30000 })
    console.log('✅ Login page loaded')
    
    // Fill in password
    await page.fill('input[type="password"]', adminPassword)
    
    // Submit login form
    await page.click('button[type="submit"]')
    console.log('✅ Login form submitted')
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/admin', { timeout: 15000 })
    console.log('✅ Redirected to admin dashboard')
    
    // Wait a bit for page to fully load
    await page.waitForTimeout(2000)
    
    // Save authentication state
    await page.context().storageState({ path: path.join(authDir, 'admin.json') })
    
    console.log('✅ Admin authentication successful - auth state saved')
  } catch (error: any) {
    console.error('❌ Failed to authenticate admin:', error.message)
    // Don't throw - let tests handle auth individually if global setup fails
    // Some tests have their own auth logic
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
