import { test, expect, Page } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'https://heiwahauz.netlify.app'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'heiwa_secure_admin_2025'

// Helper to login to admin
async function loginToAdmin(page: Page): Promise<boolean> {
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(2000)
  
  if (page.url().includes('/admin') && !page.url().includes('/login')) {
    return true
  }
  
  const passwordInput = page.locator('input[type="password"]')
  if (await passwordInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await passwordInput.fill(ADMIN_PASSWORD)
    await page.locator('button[type="submit"]').click()
    await page.waitForURL('**/admin', { timeout: 15000 }).catch(() => {})
    await page.waitForTimeout(2000)
    await page.reload({ waitUntil: 'domcontentloaded' })
  }
  
  return page.url().includes('/admin') && !page.url().includes('/login')
}

test.describe('PUBLIC SITE - User Journeys', () => {
  
  test('1. Homepage - Full Content Check', async ({ page }) => {
    console.log('\n=== HOMEPAGE FULL CHECK ===')
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(3000)
    
    // Hero Section
    const heroTitle = await page.locator('h1').first().textContent()
    console.log('Hero title:', heroTitle ? '✅' : '❌', heroTitle?.substring(0, 50))
    
    // Navigation
    const navLinks = await page.locator('nav a, header a').count()
    console.log('Navigation links:', navLinks)
    
    // Sections check
    const sections = ['Surf', 'Room', 'About', 'Host', 'Review', 'Facilit']
    for (const section of sections) {
      const found = await page.locator(`text=${section}`).first().isVisible().catch(() => false)
      console.log(`Section "${section}":`, found ? '✅' : '❌')
    }
    
    // Images loading
    const images = await page.locator('img').count()
    const brokenImages = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img')
      let broken = 0
      imgs.forEach(img => {
        if (!img.complete || img.naturalWidth === 0) broken++
      })
      return broken
    })
    console.log(`Images: ${images} total, ${brokenImages} broken`)
    
    // CTA buttons
    const ctaButtons = await page.locator('a[href*="book"], button:has-text("Book")').count()
    console.log('Booking CTAs:', ctaButtons)
    
    await page.screenshot({ path: 'test-results-production/homepage-full.png', fullPage: true })
    expect(heroTitle).toBeTruthy()
  })

  test('2. Rooms Page - Browse & Details', async ({ page }) => {
    console.log('\n=== ROOMS PAGE CHECK ===')
    await page.goto(`${BASE_URL}/rooms`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(2000)
    
    const pageTitle = await page.locator('h1').first().textContent()
    console.log('Page title:', pageTitle)
    
    // Room cards
    const roomCards = await page.locator('[class*="card"], [class*="room"]').count()
    console.log('Room cards found:', roomCards)
    
    // Pricing visible
    const priceElements = await page.locator('text=/€\\d+/').count()
    console.log('Price elements:', priceElements)
    
    // Click first room for details
    const firstRoomLink = page.locator('a[href*="/rooms/"]').first()
    if (await firstRoomLink.isVisible().catch(() => false)) {
      await firstRoomLink.click()
      await page.waitForTimeout(2000)
      
      const roomName = await page.locator('h1').first().textContent()
      console.log('Room detail page:', roomName)
      
      // Check for booking form or CTA
      const bookingForm = await page.locator('form, [class*="booking"], button:has-text("Book")').count()
      console.log('Booking elements:', bookingForm)
      
      await page.screenshot({ path: 'test-results-production/room-detail.png', fullPage: true })
    }
    
    expect(roomCards).toBeGreaterThan(0)
  })

  test('3. Surf Camps/Weeks Page', async ({ page }) => {
    console.log('\n=== SURF CAMPS PAGE CHECK ===')
    
    // Try different possible URLs
    const urls = [`${BASE_URL}/surf-camps`, `${BASE_URL}/surf-weeks`, `${BASE_URL}/surfcamp`]
    let found = false
    
    for (const url of urls) {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {})
      if (!page.url().includes('404') && !page.url().includes('error')) {
        found = true
        console.log('Surf page URL:', url)
        break
      }
    }
    
    if (found) {
      await page.waitForTimeout(2000)
      
      const pageTitle = await page.locator('h1').first().textContent()
      console.log('Page title:', pageTitle)
      
      // Surf week cards
      const surfCards = await page.locator('[class*="card"], [class*="surf"], [class*="week"]').count()
      console.log('Surf cards found:', surfCards)
      
      // Dates visible
      const dateElements = await page.locator('text=/\\d{1,2}.*\\d{4}|\\d{4}/').count()
      console.log('Date elements:', dateElements)
      
      await page.screenshot({ path: 'test-results-production/surf-camps.png', fullPage: true })
    } else {
      console.log('No surf camps page found - checking homepage for surf section')
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
      const surfSection = await page.locator('text=/Surf Week|Surf Camp/i').first().isVisible().catch(() => false)
      console.log('Surf section on homepage:', surfSection ? '✅' : '❌')
    }
  })

  test('4. Contact Page', async ({ page }) => {
    console.log('\n=== CONTACT PAGE CHECK ===')
    await page.goto(`${BASE_URL}/contact`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(2000)
    
    const pageTitle = await page.locator('h1').first().textContent()
    console.log('Page title:', pageTitle)
    
    // Contact form
    const formInputs = await page.locator('input, textarea').count()
    console.log('Form inputs:', formInputs)
    
    // Contact info
    const emailVisible = await page.locator('text=@').first().isVisible().catch(() => false)
    const phoneVisible = await page.locator('text=/\\+|phone|tel/i').first().isVisible().catch(() => false)
    console.log('Email visible:', emailVisible ? '✅' : '❌')
    console.log('Phone visible:', phoneVisible ? '✅' : '❌')
    
    await page.screenshot({ path: 'test-results-production/contact.png', fullPage: true })
  })

  test('5. About Page', async ({ page }) => {
    console.log('\n=== ABOUT PAGE CHECK ===')
    await page.goto(`${BASE_URL}/about`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(2000)
    
    const pageTitle = await page.locator('h1').first().textContent()
    console.log('Page title:', pageTitle)
    
    // Content check
    const paragraphs = await page.locator('p').count()
    console.log('Paragraphs:', paragraphs)
    
    await page.screenshot({ path: 'test-results-production/about.png', fullPage: true })
  })

  test('6. Gallery Page', async ({ page }) => {
    console.log('\n=== GALLERY PAGE CHECK ===')
    await page.goto(`${BASE_URL}/gallery`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(2000)
    
    const pageTitle = await page.locator('h1').first().textContent()
    console.log('Page title:', pageTitle)
    
    // Images
    const images = await page.locator('img').count()
    console.log('Gallery images:', images)
    
    await page.screenshot({ path: 'test-results-production/gallery.png', fullPage: true })
  })

  test('7. Blog Page', async ({ page }) => {
    console.log('\n=== BLOG PAGE CHECK ===')
    await page.goto(`${BASE_URL}/blog`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(2000)
    
    const pageTitle = await page.locator('h1').first().textContent()
    console.log('Page title:', pageTitle)
    
    // Blog posts
    const blogPosts = await page.locator('article, [class*="post"], [class*="blog"]').count()
    console.log('Blog posts:', blogPosts)
    
    await page.screenshot({ path: 'test-results-production/blog.png', fullPage: true })
  })

  test('8. Booking Flow - Room', async ({ page }) => {
    console.log('\n=== ROOM BOOKING FLOW ===')
    await page.goto(`${BASE_URL}/rooms`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(2000)
    
    // Click on first room
    const roomLink = page.locator('a[href*="/rooms/"]').first()
    if (await roomLink.isVisible().catch(() => false)) {
      await roomLink.click()
      await page.waitForTimeout(2000)
      
      // Look for booking button/form
      const bookButton = page.locator('button:has-text("Book"), a:has-text("Book"), [class*="book"]').first()
      if (await bookButton.isVisible().catch(() => false)) {
        console.log('Book button found: ✅')
        await bookButton.click().catch(() => {})
        await page.waitForTimeout(2000)
        
        // Check if booking form/modal appeared
        const bookingForm = await page.locator('form, [class*="modal"], [class*="booking"]').count()
        console.log('Booking form elements:', bookingForm)
        
        await page.screenshot({ path: 'test-results-production/booking-flow.png', fullPage: true })
      } else {
        console.log('Book button not found on room page')
      }
    }
  })

  test('9. Mobile Responsiveness', async ({ page }) => {
    console.log('\n=== MOBILE RESPONSIVENESS ===')
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(2000)
    
    // Check for mobile menu
    const mobileMenu = await page.locator('[class*="hamburger"], [class*="menu-toggle"], button[aria-label*="menu"], svg').first().isVisible().catch(() => false)
    console.log('Mobile menu icon:', mobileMenu ? '✅' : '❌')
    
    // Check layout
    const horizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })
    console.log('Horizontal scroll (should be false):', !horizontalScroll ? '✅' : '❌')
    
    await page.screenshot({ path: 'test-results-production/mobile-home.png', fullPage: true })
    
    // Test mobile navigation
    await page.goto(`${BASE_URL}/rooms`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'test-results-production/mobile-rooms.png', fullPage: true })
  })

  test('10. SEO & Meta Tags', async ({ page }) => {
    console.log('\n=== SEO & META TAGS ===')
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
    
    const title = await page.title()
    console.log('Page title:', title)
    
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content')
    console.log('Meta description:', metaDescription ? '✅' : '❌', metaDescription?.substring(0, 50))
    
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
    console.log('OG title:', ogTitle ? '✅' : '❌')
    
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content')
    console.log('OG image:', ogImage ? '✅' : '❌')
    
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    console.log('Canonical URL:', canonical ? '✅' : '❌')
  })

  test('11. Performance - Page Load Times', async ({ page }) => {
    console.log('\n=== PERFORMANCE CHECK ===')
    
    const pages = [
      { name: 'Homepage', url: BASE_URL },
      { name: 'Rooms', url: `${BASE_URL}/rooms` },
      { name: 'Contact', url: `${BASE_URL}/contact` },
    ]
    
    for (const p of pages) {
      const start = Date.now()
      await page.goto(p.url, { waitUntil: 'domcontentloaded', timeout: 30000 })
      const loadTime = Date.now() - start
      console.log(`${p.name} load time: ${loadTime}ms`, loadTime < 5000 ? '✅' : '⚠️')
    }
  })

  test('12. Console Errors Check', async ({ page }) => {
    console.log('\n=== CONSOLE ERRORS CHECK ===')
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    const pages = [BASE_URL, `${BASE_URL}/rooms`, `${BASE_URL}/contact`, `${BASE_URL}/about`]
    
    for (const url of pages) {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
      await page.waitForTimeout(2000)
    }
    
    console.log('Total console errors:', errors.length)
    if (errors.length > 0) {
      errors.slice(0, 10).forEach((e, i) => console.log(`  ${i + 1}. ${e.substring(0, 100)}`))
    }
  })
})

test.describe('ADMIN PANEL - Full Functionality', () => {
  
  test('13. Admin Login', async ({ page }) => {
    console.log('\n=== ADMIN LOGIN ===')
    const loggedIn = await loginToAdmin(page)
    console.log('Login successful:', loggedIn ? '✅' : '❌')
    
    await page.screenshot({ path: 'test-results-production/admin-dashboard.png', fullPage: true })
    expect(loggedIn).toBe(true)
  })

  test('14. Admin Dashboard - Stats & Navigation', async ({ page }) => {
    console.log('\n=== ADMIN DASHBOARD ===')
    await loginToAdmin(page)
    
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    // Stats cards
    const statCards = await page.locator('[class*="stat"], [class*="card"]').count()
    console.log('Stat cards:', statCards)
    
    // Navigation items
    const navItems = await page.locator('nav a, aside a, [class*="sidebar"] a').count()
    console.log('Navigation items:', navItems)
    
    // Quick actions
    const actionButtons = await page.locator('button, a[href*="/admin/"]').count()
    console.log('Action buttons:', actionButtons)
    
    await page.screenshot({ path: 'test-results-production/admin-dashboard-full.png', fullPage: true })
  })

  test('15. Admin Rooms - List, Add, Edit', async ({ page }) => {
    console.log('\n=== ADMIN ROOMS MANAGEMENT ===')
    await loginToAdmin(page)
    
    // List rooms
    await page.goto(`${BASE_URL}/admin/rooms`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    const roomRows = await page.locator('tr, [class*="room-item"], [class*="card"]').count()
    console.log('Room items:', roomRows)
    
    // Add Room button
    const addButton = await page.locator('a[href*="/rooms/new"], button:has-text("Add")').first().isVisible().catch(() => false)
    console.log('Add Room button:', addButton ? '✅' : '❌')
    
    await page.screenshot({ path: 'test-results-production/admin-rooms-list.png', fullPage: true })
    
    // Test New Room page
    await page.goto(`${BASE_URL}/admin/rooms/new`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    const formFields = await page.locator('input, textarea, select').count()
    console.log('New room form fields:', formFields)
    
    // Check for seasonal pricing
    const peakSeason = await page.locator('text=/Peak Season|Standard Rate/i').first().isVisible().catch(() => false)
    const offSeason = await page.locator('text=/Off.?Season/i').first().isVisible().catch(() => false)
    console.log('Peak season pricing:', peakSeason ? '✅' : '❌')
    console.log('Off-season pricing:', offSeason ? '✅' : '❌')
    
    await page.screenshot({ path: 'test-results-production/admin-rooms-new.png', fullPage: true })
    
    // Test Edit Room page
    await page.goto(`${BASE_URL}/admin/rooms`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    const editLink = page.locator('a[href*="/rooms/"][href*="/edit"]').first()
    if (await editLink.isVisible().catch(() => false)) {
      await editLink.click()
      await page.waitForTimeout(2000)
      
      const editFormFields = await page.locator('input, textarea, select').count()
      console.log('Edit room form fields:', editFormFields)
      
      // Check image section
      const imageSection = await page.locator('text=/Images|Gallery/i').first().isVisible().catch(() => false)
      console.log('Image section:', imageSection ? '✅' : '❌')
      
      await page.screenshot({ path: 'test-results-production/admin-rooms-edit.png', fullPage: true })
    }
  })

  test('16. Admin Bookings - List, Create, View', async ({ page }) => {
    console.log('\n=== ADMIN BOOKINGS MANAGEMENT ===')
    await loginToAdmin(page)
    
    // List bookings
    await page.goto(`${BASE_URL}/admin/bookings`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    const bookingRows = await page.locator('tr, [class*="booking-item"]').count()
    console.log('Booking items:', bookingRows)
    
    // Search functionality
    const searchInput = await page.locator('input[type="search"], input[placeholder*="Search"]').first().isVisible().catch(() => false)
    console.log('Search input:', searchInput ? '✅' : '❌')
    
    // Filters
    const filters = await page.locator('select, [class*="filter"]').count()
    console.log('Filter elements:', filters)
    
    // Create Booking button
    const createButton = await page.locator('a[href*="/bookings/new"], button:has-text("Create")').first().isVisible().catch(() => false)
    console.log('Create Booking button:', createButton ? '✅' : '❌')
    
    await page.screenshot({ path: 'test-results-production/admin-bookings-list.png', fullPage: true })
    
    // Test New Booking page
    await page.goto(`${BASE_URL}/admin/bookings/new`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    const newBookingTitle = await page.locator('h1').first().textContent()
    console.log('New booking page title:', newBookingTitle)
    
    const bookingFormFields = await page.locator('input, textarea, select').count()
    console.log('New booking form fields:', bookingFormFields)
    
    // Check for room/surf camp selection
    const typeSelection = await page.locator('text=/Room Booking|Surf.*Booking/i').first().isVisible().catch(() => false)
    console.log('Booking type selection:', typeSelection ? '✅' : '❌')
    
    await page.screenshot({ path: 'test-results-production/admin-bookings-new.png', fullPage: true })
  })

  test('17. Admin Surf Camps - List & Manage', async ({ page }) => {
    console.log('\n=== ADMIN SURF CAMPS MANAGEMENT ===')
    await loginToAdmin(page)
    
    await page.goto(`${BASE_URL}/admin/surf-camps`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    const surfCampRows = await page.locator('tr, [class*="surf"], [class*="card"]').count()
    console.log('Surf camp items:', surfCampRows)
    
    // Add button
    const addButton = await page.locator('a[href*="/surf-camps/new"], button:has-text("Add")').first().isVisible().catch(() => false)
    console.log('Add Surf Week button:', addButton ? '✅' : '❌')
    
    // Check for NaN values (bug check)
    const pageContent = await page.content()
    const hasNaN = pageContent.includes('NaN')
    console.log('Contains NaN (bug):', hasNaN ? '❌ BUG' : '✅ OK')
    
    await page.screenshot({ path: 'test-results-production/admin-surf-camps.png', fullPage: true })
  })

  test('18. Admin Clients - List & Search', async ({ page }) => {
    console.log('\n=== ADMIN CLIENTS MANAGEMENT ===')
    await loginToAdmin(page)
    
    await page.goto(`${BASE_URL}/admin/clients`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    const clientRows = await page.locator('tr, [class*="client"]').count()
    console.log('Client items:', clientRows)
    
    // Search
    const searchInput = await page.locator('input[type="search"], input[placeholder*="Search"]').first().isVisible().catch(() => false)
    console.log('Search input:', searchInput ? '✅' : '❌')
    
    await page.screenshot({ path: 'test-results-production/admin-clients.png', fullPage: true })
  })

  test('19. Admin Payments & Invoices', async ({ page }) => {
    console.log('\n=== ADMIN PAYMENTS & INVOICES ===')
    await loginToAdmin(page)
    
    // Payments
    await page.goto(`${BASE_URL}/admin/payments`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    const paymentRows = await page.locator('tr, [class*="payment"]').count()
    console.log('Payment items:', paymentRows)
    
    await page.screenshot({ path: 'test-results-production/admin-payments.png', fullPage: true })
    
    // Invoices
    await page.goto(`${BASE_URL}/admin/invoices`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    const invoiceRows = await page.locator('tr, [class*="invoice"]').count()
    console.log('Invoice items:', invoiceRows)
    
    // Create Invoice button
    const createInvoice = await page.locator('a[href*="/invoices/new"], button:has-text("Create")').first().isVisible().catch(() => false)
    console.log('Create Invoice button:', createInvoice ? '✅' : '❌')
    
    await page.screenshot({ path: 'test-results-production/admin-invoices.png', fullPage: true })
  })

  test('20. Admin Gallery Management', async ({ page }) => {
    console.log('\n=== ADMIN GALLERY MANAGEMENT ===')
    await loginToAdmin(page)
    
    await page.goto(`${BASE_URL}/admin/gallery`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    const images = await page.locator('img').count()
    console.log('Gallery images:', images)
    
    // Upload button
    const uploadButton = await page.locator('button:has-text("Upload"), input[type="file"]').first().isVisible().catch(() => false)
    console.log('Upload button:', uploadButton ? '✅' : '❌')
    
    await page.screenshot({ path: 'test-results-production/admin-gallery.png', fullPage: true })
  })

  test('21. Admin Homepage CMS', async ({ page }) => {
    console.log('\n=== ADMIN HOMEPAGE CMS ===')
    await loginToAdmin(page)
    
    await page.goto(`${BASE_URL}/admin/homepage`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    const sections = await page.locator('[class*="section"], [class*="card"]').count()
    console.log('CMS sections:', sections)
    
    // Edit buttons
    const editButtons = await page.locator('button:has-text("Edit"), a:has-text("Edit")').count()
    console.log('Edit buttons:', editButtons)
    
    // Save button
    const saveButton = await page.locator('button:has-text("Save")').first().isVisible().catch(() => false)
    console.log('Save button:', saveButton ? '✅' : '❌')
    
    await page.screenshot({ path: 'test-results-production/admin-homepage-cms.png', fullPage: true })
  })

  test('22. Admin Activities Management', async ({ page }) => {
    console.log('\n=== ADMIN ACTIVITIES MANAGEMENT ===')
    await loginToAdmin(page)
    
    await page.goto(`${BASE_URL}/admin/activities`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    const activityItems = await page.locator('tr, [class*="activity"]').count()
    console.log('Activity items:', activityItems)
    
    // Add button
    const addButton = await page.locator('a[href*="/activities/new"], button:has-text("Add")').first().isVisible().catch(() => false)
    console.log('Add Activity button:', addButton ? '✅' : '❌')
    
    await page.screenshot({ path: 'test-results-production/admin-activities.png', fullPage: true })
  })

  test('23. Admin Calendar View', async ({ page }) => {
    console.log('\n=== ADMIN CALENDAR VIEW ===')
    await loginToAdmin(page)
    
    await page.goto(`${BASE_URL}/admin/calendar`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    const calendarElement = await page.locator('[class*="calendar"], [class*="fc-"]').first().isVisible().catch(() => false)
    console.log('Calendar visible:', calendarElement ? '✅' : '❌')
    
    await page.screenshot({ path: 'test-results-production/admin-calendar.png', fullPage: true })
  })

  test('24. Admin Analytics', async ({ page }) => {
    console.log('\n=== ADMIN ANALYTICS ===')
    await loginToAdmin(page)
    
    await page.goto(`${BASE_URL}/admin/analytics`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    const charts = await page.locator('[class*="chart"], canvas, svg').count()
    console.log('Chart elements:', charts)
    
    const stats = await page.locator('[class*="stat"], [class*="metric"]').count()
    console.log('Stat elements:', stats)
    
    await page.screenshot({ path: 'test-results-production/admin-analytics.png', fullPage: true })
  })
})

test.describe('API ENDPOINTS - Verification', () => {
  
  test('25. Public API Endpoints', async ({ request }) => {
    console.log('\n=== PUBLIC API ENDPOINTS ===')
    
    const endpoints = [
      { name: 'Rooms', url: `${BASE_URL}/api/rooms` },
      { name: 'Surf Camps', url: `${BASE_URL}/api/surf-camps` },
      { name: 'Gallery', url: `${BASE_URL}/api/gallery` },
      { name: 'Activities', url: `${BASE_URL}/api/activities` },
    ]
    
    for (const endpoint of endpoints) {
      const response = await request.get(endpoint.url).catch(() => null)
      if (response) {
        console.log(`${endpoint.name}: ${response.status()}`, response.ok() ? '✅' : '❌')
        if (response.ok()) {
          const data = await response.json().catch(() => null)
          if (data) {
            console.log(`  Data: ${JSON.stringify(data).substring(0, 100)}...`)
          }
        }
      } else {
        console.log(`${endpoint.name}: Failed to fetch ❌`)
      }
    }
  })

  test('26. Admin API Endpoints', async ({ request }) => {
    console.log('\n=== ADMIN API ENDPOINTS ===')
    
    const endpoints = [
      { name: 'Admin Rooms', url: `${BASE_URL}/api/admin/rooms` },
      { name: 'Admin Bookings', url: `${BASE_URL}/api/admin/bookings` },
      { name: 'Admin Clients', url: `${BASE_URL}/api/admin/clients` },
      { name: 'Admin Homepage', url: `${BASE_URL}/api/admin/homepage` },
    ]
    
    for (const endpoint of endpoints) {
      const response = await request.get(endpoint.url).catch(() => null)
      if (response) {
        console.log(`${endpoint.name}: ${response.status()}`, response.status() === 401 ? '🔒 Auth required' : (response.ok() ? '✅' : '❌'))
      } else {
        console.log(`${endpoint.name}: Failed to fetch ❌`)
      }
    }
  })
})

test.describe('FORM SUBMISSIONS - Validation', () => {
  
  test('27. Contact Form Validation', async ({ page }) => {
    console.log('\n=== CONTACT FORM VALIDATION ===')
    await page.goto(`${BASE_URL}/contact`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"], input[type="submit"]').first()
    if (await submitButton.isVisible().catch(() => false)) {
      await submitButton.click()
      await page.waitForTimeout(1000)
      
      // Check for validation errors
      const validationErrors = await page.locator('[class*="error"], [class*="invalid"], :invalid').count()
      console.log('Validation errors shown:', validationErrors > 0 ? '✅' : '❌')
    }
    
    // Fill form with test data
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first()
    const emailInput = page.locator('input[name="email"], input[type="email"]').first()
    const messageInput = page.locator('textarea').first()
    
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill('Test User')
      console.log('Name field filled: ✅')
    }
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill('test@example.com')
      console.log('Email field filled: ✅')
    }
    if (await messageInput.isVisible().catch(() => false)) {
      await messageInput.fill('This is a test message from automated testing.')
      console.log('Message field filled: ✅')
    }
    
    await page.screenshot({ path: 'test-results-production/contact-form-filled.png', fullPage: true })
  })

  test('28. Admin Room Form Validation', async ({ page }) => {
    console.log('\n=== ADMIN ROOM FORM VALIDATION ===')
    await loginToAdmin(page)
    
    await page.goto(`${BASE_URL}/admin/rooms/new`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")').first()
    if (await submitButton.isVisible().catch(() => false)) {
      await submitButton.click()
      await page.waitForTimeout(1000)
      
      // Check for validation
      const validationErrors = await page.locator('[class*="error"], [class*="invalid"], :invalid').count()
      console.log('Validation errors shown:', validationErrors > 0 ? '✅' : '❌')
    }
    
    // Fill required fields
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first()
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill('Test Room')
      console.log('Room name filled: ✅')
    }
    
    await page.screenshot({ path: 'test-results-production/admin-room-form-validation.png', fullPage: true })
  })

  test('29. Admin Booking Form Validation', async ({ page }) => {
    console.log('\n=== ADMIN BOOKING FORM VALIDATION ===')
    await loginToAdmin(page)
    
    await page.goto(`${BASE_URL}/admin/bookings/new`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    // Check form structure
    const guestNameInput = await page.locator('input[placeholder*="John"], input[name*="name"]').first().isVisible().catch(() => false)
    const emailInput = await page.locator('input[type="email"]').first().isVisible().catch(() => false)
    const roomSelect = await page.locator('select').first().isVisible().catch(() => false)
    
    console.log('Guest name input:', guestNameInput ? '✅' : '❌')
    console.log('Email input:', emailInput ? '✅' : '❌')
    console.log('Room/Camp select:', roomSelect ? '✅' : '❌')
    
    await page.screenshot({ path: 'test-results-production/admin-booking-form.png', fullPage: true })
  })
})

test.describe('EDGE CASES & ERROR HANDLING', () => {
  
  test('30. 404 Page', async ({ page }) => {
    console.log('\n=== 404 PAGE ===')
    await page.goto(`${BASE_URL}/nonexistent-page-12345`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    const pageContent = await page.content()
    const has404 = pageContent.includes('404') || pageContent.includes('not found') || pageContent.includes('Not Found')
    console.log('404 page shown:', has404 ? '✅' : '❌')
    
    // Check for home link
    const homeLink = await page.locator('a[href="/"], a:has-text("Home")').first().isVisible().catch(() => false)
    console.log('Home link on 404:', homeLink ? '✅' : '❌')
    
    await page.screenshot({ path: 'test-results-production/404-page.png', fullPage: true })
  })

  test('31. Invalid Room ID', async ({ page }) => {
    console.log('\n=== INVALID ROOM ID ===')
    await page.goto(`${BASE_URL}/rooms/invalid-room-id-12345`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    const pageContent = await page.content()
    const hasError = pageContent.includes('not found') || pageContent.includes('Not Found') || pageContent.includes('404') || pageContent.includes('error')
    console.log('Error handling for invalid room:', hasError ? '✅' : '❌')
    
    await page.screenshot({ path: 'test-results-production/invalid-room.png', fullPage: true })
  })

  test('32. Admin Without Auth', async ({ page }) => {
    console.log('\n=== ADMIN WITHOUT AUTH ===')
    
    // Clear cookies
    await page.context().clearCookies()
    
    await page.goto(`${BASE_URL}/admin/rooms`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    const redirectedToLogin = page.url().includes('/login')
    console.log('Redirected to login:', redirectedToLogin ? '✅' : '❌')
    
    await page.screenshot({ path: 'test-results-production/admin-no-auth.png', fullPage: true })
  })
})
