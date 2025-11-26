import { test, expect, Page } from '@playwright/test'

const BASE_URL = 'https://heiwahauz.netlify.app'
const ADMIN_PASSWORD = 'heiwa_admin_2024'

interface AuditResult {
  page: string
  status: 'PASS' | 'FAIL' | 'PARTIAL'
  findings: string[]
  issues: string[]
}

const auditResults: AuditResult[] = []
const consoleErrors: string[] = []

// Helper to ensure we're logged in
async function ensureLoggedIn(page: Page): Promise<boolean> {
  // Check if already on admin page (not login)
  const currentUrl = page.url()
  if (currentUrl.includes('/admin') && !currentUrl.includes('/login')) {
    console.log('Already authenticated')
    return true
  }
  
  // Go to login page
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  
  // Wait for page to load
  await page.waitForTimeout(2000)
  
  // Check if we got redirected to admin (already authenticated)
  if (page.url().includes('/admin') && !page.url().includes('/login')) {
    console.log('Already authenticated')
    return true
  }
  
  // Check for password input
  const passwordInput = page.locator('input[type="password"]')
  const isPasswordVisible = await passwordInput.isVisible({ timeout: 5000 }).catch(() => false)
  
  if (isPasswordVisible) {
    await passwordInput.fill(ADMIN_PASSWORD)
    await page.locator('button[type="submit"]').click()
    
    // Wait for navigation to complete
    await page.waitForURL('**/admin', { timeout: 15000 }).catch(() => {})
    
    // Extra wait for client-side hydration
    await page.waitForTimeout(2000)
    
    // Force refresh to ensure cookies are applied
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1000)
  }
  
  return page.url().includes('/admin') && !page.url().includes('/login')
}

// Helper to navigate to admin page with auth
async function goToAdminPage(page: Page, path: string): Promise<void> {
  const fullPath = path.startsWith('/admin') ? path : `/admin${path}`
  await page.goto(`${BASE_URL}${fullPath}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  
  // Check if redirected to login
  if (page.url().includes('/login')) {
    await ensureLoggedIn(page)
    // Navigate again after login
    await page.goto(`${BASE_URL}${fullPath}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  }
  
  // Wait for page content to load
  await page.waitForTimeout(2000)
}

test.describe('Admin Panel Full Audit', () => {
  test.beforeEach(async ({ page }) => {
    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(`[${msg.location().url}] ${msg.text()}`)
      }
    })

    page.on('pageerror', error => {
      consoleErrors.push(`[PageError] ${error.message}`)
    })

    // Ensure logged in
    const loggedIn = await ensureLoggedIn(page)
    console.log('Login status:', loggedIn ? '✅ Logged in' : '❌ Not logged in')
  })

  test('1. Audit Dashboard', async ({ page }) => {
    await goToAdminPage(page, '/admin')
    
    console.log('\n=== DASHBOARD AUDIT ===')
    
    // Check for stat cards
    const statCards = await page.locator('[class*="stat"], [class*="card"]').count()
    console.log('Stat cards found:', statCards)
    
    // Check for sidebar
    const sidebar = await page.locator('aside, [class*="sidebar"]').count()
    console.log('Sidebar present:', sidebar > 0 ? '✅' : '❌')
    
    // Check for navigation links
    const navLinks = await page.locator('a[href*="/admin/"]').count()
    console.log('Admin nav links:', navLinks)
    
    await page.screenshot({ path: 'test-results-production/dashboard.png', fullPage: true })
  })

  test('2. Audit Rooms Management', async ({ page }) => {
    await goToAdminPage(page, '/admin/rooms')
    
    console.log('\n=== ROOMS PAGE AUDIT ===')
    
    // Check Add Room button
    const addButton = page.locator('text=Add Room')
    const hasAddButton = await addButton.isVisible().catch(() => false)
    console.log('Add Room button:', hasAddButton ? '✅' : '❌')
    
    // Check room cards
    const roomCards = await page.locator('.bg-white.rounded-lg, [class*="card"]').count()
    console.log('Room cards:', roomCards)
    
    // Check Edit buttons
    const editButtons = await page.locator('text=Edit').count()
    console.log('Edit buttons:', editButtons)
    
    // Check Delete buttons  
    const deleteButtons = await page.locator('button:has-text("Delete"), [class*="trash"], [class*="Trash"]').count()
    console.log('Delete elements:', deleteButtons)
    
    // Check for broken images
    const images = page.locator('img')
    const imageCount = await images.count()
    let brokenImages = 0
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth)
      if (naturalWidth === 0) {
        brokenImages++
        const src = await img.getAttribute('src')
        console.log('  ❌ Broken image:', src?.substring(0, 100))
      }
    }
    console.log('Broken images:', brokenImages)
    
    // Check pricing display
    const pageContent = await page.content()
    const hasNaN = pageContent.includes('NaN')
    console.log('Contains NaN:', hasNaN ? '❌ YES' : '✅ NO')
    
    await page.screenshot({ path: 'test-results-production/rooms.png', fullPage: true })
    
    // Test Edit button navigation
    if (editButtons > 0) {
      await page.locator('text=Edit').first().click()
      await page.waitForTimeout(2000)
      console.log('After Edit click URL:', page.url())
      await page.screenshot({ path: 'test-results-production/rooms-edit.png', fullPage: true })
    }
  })

  test('3. Audit Room Edit Page', async ({ page }) => {
    // First get a room ID
    await goToAdminPage(page, '/admin/rooms')
    
    const editLink = page.locator('a[href*="/admin/rooms/"][href*="/edit"]').first()
    if (await editLink.isVisible().catch(() => false)) {
      await editLink.click()
      await page.waitForTimeout(3000)
      
      console.log('\n=== ROOM EDIT PAGE AUDIT ===')
      console.log('URL:', page.url())
      
      // Check form fields
      const nameInput = await page.locator('input[type="text"]').first().isVisible().catch(() => false)
      console.log('Name input:', nameInput ? '✅' : '❌')
      
      const priceInputs = await page.locator('input[type="number"]').count()
      console.log('Number inputs (price/capacity):', priceInputs)
      
      const saveButton = await page.locator('button:has-text("Save")').isVisible().catch(() => false)
      console.log('Save button:', saveButton ? '✅' : '❌')
      
      const textareas = await page.locator('textarea').count()
      console.log('Textareas:', textareas)
      
      // Check pricing labels
      const labels = await page.locator('label').allTextContents()
      const pricingLabels = labels.filter(l => l.toLowerCase().includes('price') || l.toLowerCase().includes('rate') || l.toLowerCase().includes('season'))
      console.log('Pricing-related labels:', pricingLabels)
      
      // Check for image management
      const imageSection = await page.locator('text=Images, text=Image, [class*="image"]').count()
      console.log('Image management sections:', imageSection)
      
      await page.screenshot({ path: 'test-results-production/room-edit-form.png', fullPage: true })
    } else {
      console.log('❌ No edit link found on rooms page')
    }
  })

  test('4. Audit New Room Page', async ({ page }) => {
    await goToAdminPage(page, '/admin/rooms/new')
    
    console.log('\n=== NEW ROOM PAGE AUDIT ===')
    
    const formFields = await page.locator('input, textarea, select').count()
    console.log('Form fields:', formFields)
    
    const submitButton = await page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")').isVisible().catch(() => false)
    console.log('Submit button:', submitButton ? '✅' : '❌')
    
    const imageUpload = await page.locator('[class*="upload"], input[type="file"], [class*="dropzone"]').count()
    console.log('Image upload elements:', imageUpload)
    
    await page.screenshot({ path: 'test-results-production/room-new.png', fullPage: true })
  })

  test('5. Audit Surf Camps Page', async ({ page }) => {
    await goToAdminPage(page, '/admin/surf-camps')
    
    console.log('\n=== SURF CAMPS PAGE AUDIT ===')
    
    const pageContent = await page.content()
    const hasNaN = pageContent.includes('NaN')
    console.log('Contains NaN:', hasNaN ? '❌ YES - CRITICAL BUG' : '✅ NO')
    
    // Check availability display
    const availabilityElements = await page.locator('text=/\\d+.*available|enrolled.*\\d+/i').count()
    console.log('Availability elements:', availabilityElements)
    
    // Check CRUD buttons
    const addButton = await page.locator('text=Add, text=New, text=Create').first().isVisible().catch(() => false)
    console.log('Add button:', addButton ? '✅' : '❌')
    
    const editButtons = await page.locator('text=Edit').count()
    console.log('Edit buttons:', editButtons)
    
    await page.screenshot({ path: 'test-results-production/surf-camps.png', fullPage: true })
  })

  test('6. Audit Bookings Page', async ({ page }) => {
    await goToAdminPage(page, '/admin/bookings')
    
    console.log('\n=== BOOKINGS PAGE AUDIT ===')
    
    const table = await page.locator('table').isVisible().catch(() => false)
    console.log('Table present:', table ? '✅' : '❌')
    
    const pagination = await page.locator('[class*="pagination"], button:has-text("Next"), button:has-text("Previous")').count()
    console.log('Pagination elements:', pagination)
    
    const searchInput = await page.locator('input[placeholder*="Search"], input[type="search"]').isVisible().catch(() => false)
    console.log('Search input:', searchInput ? '✅' : '❌')
    
    const filters = await page.locator('select').count()
    console.log('Filter dropdowns:', filters)
    
    const createButton = await page.locator('text=Create, text=New Booking, text=Add').first().isVisible().catch(() => false)
    console.log('Create booking button:', createButton ? '✅' : '❌')
    
    await page.screenshot({ path: 'test-results-production/bookings.png', fullPage: true })
  })

  test('7. Audit Gallery Page', async ({ page }) => {
    await goToAdminPage(page, '/admin/gallery')
    
    console.log('\n=== GALLERY PAGE AUDIT ===')
    
    const uploadButton = await page.locator('button:has-text("Upload"), a:has-text("Upload"), [class*="upload"]').isVisible().catch(() => false)
    console.log('Upload button:', uploadButton ? '✅' : '❌')
    
    const images = await page.locator('img').count()
    console.log('Images displayed:', images)
    
    const deleteButtons = await page.locator('[class*="delete"], [class*="trash"], button:has-text("Delete")').count()
    console.log('Delete options:', deleteButtons)
    
    await page.screenshot({ path: 'test-results-production/gallery.png', fullPage: true })
  })

  test('8. Audit Activities Page', async ({ page }) => {
    await goToAdminPage(page, '/admin/activities')
    
    console.log('\n=== ACTIVITIES PAGE AUDIT ===')
    
    const addButton = await page.locator('button:has-text("Add"), a:has-text("Add"), a:has-text("New")').isVisible().catch(() => false)
    console.log('Add button:', addButton ? '✅' : '❌')
    
    const activityItems = await page.locator('tr, [class*="card"], [class*="activity"]').count()
    console.log('Activity items:', activityItems)
    
    const editButtons = await page.locator('text=Edit').count()
    console.log('Edit buttons:', editButtons)
    
    await page.screenshot({ path: 'test-results-production/activities.png', fullPage: true })
  })

  test('9. Audit Homepage CMS', async ({ page }) => {
    await goToAdminPage(page, '/admin/homepage')
    
    console.log('\n=== HOMEPAGE CMS AUDIT ===')
    
    const sections = await page.locator('[class*="section"], [class*="card"]').count()
    console.log('CMS sections:', sections)
    
    const editButtons = await page.locator('button:has-text("Edit"), [class*="edit"]').count()
    console.log('Edit buttons:', editButtons)
    
    const saveButton = await page.locator('button:has-text("Save")').isVisible().catch(() => false)
    console.log('Save button:', saveButton ? '✅' : '❌')
    
    await page.screenshot({ path: 'test-results-production/homepage-cms.png', fullPage: true })
  })

  test('10. Audit Clients Page', async ({ page }) => {
    await goToAdminPage(page, '/admin/clients')
    
    console.log('\n=== CLIENTS PAGE AUDIT ===')
    
    const table = await page.locator('table').isVisible().catch(() => false)
    console.log('Table present:', table ? '✅' : '❌')
    
    const searchInput = await page.locator('input[placeholder*="Search"], input[type="search"]').isVisible().catch(() => false)
    console.log('Search input:', searchInput ? '✅' : '❌')
    
    const clientRows = await page.locator('tbody tr').count()
    console.log('Client rows:', clientRows)
    
    await page.screenshot({ path: 'test-results-production/clients.png', fullPage: true })
  })

  test('11. Audit Payments Page', async ({ page }) => {
    await goToAdminPage(page, '/admin/payments')
    
    console.log('\n=== PAYMENTS PAGE AUDIT ===')
    
    const table = await page.locator('table').isVisible().catch(() => false)
    console.log('Table present:', table ? '✅' : '❌')
    
    const filters = await page.locator('select').count()
    console.log('Filter dropdowns:', filters)
    
    await page.screenshot({ path: 'test-results-production/payments.png', fullPage: true })
  })

  test('12. Audit Invoices Page', async ({ page }) => {
    await goToAdminPage(page, '/admin/invoices')
    
    console.log('\n=== INVOICES PAGE AUDIT ===')
    
    const table = await page.locator('table').isVisible().catch(() => false)
    console.log('Table present:', table ? '✅' : '❌')
    
    const createButton = await page.locator('button:has-text("Create"), a:has-text("New")').isVisible().catch(() => false)
    console.log('Create button:', createButton ? '✅' : '❌')
    
    await page.screenshot({ path: 'test-results-production/invoices.png', fullPage: true })
  })

  test('13. Console Errors Summary', async ({ page }) => {
    // Navigate through all pages to collect errors
    const pages = ['/admin', '/admin/rooms', '/admin/surf-camps', '/admin/bookings', '/admin/activities']
    
    for (const p of pages) {
      await goToAdminPage(page, p)
    }
    
    console.log('\n=== CONSOLE ERRORS ===')
    if (consoleErrors.length > 0) {
      consoleErrors.forEach((err, i) => console.log(`${i + 1}. ${err.substring(0, 200)}`))
    } else {
      console.log('No console errors detected')
    }
  })
})
