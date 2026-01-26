import { test, expect, Page } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'https://heiwahauz.netlify.app'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'heiwa_secure_admin_2025'

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

test.describe('FINAL PRODUCTION VERIFICATION', () => {

  test('1. All Public Pages Load', async ({ page }) => {
    console.log('\n=== PUBLIC PAGES ===')
    
    const pages = [
      { path: '/', name: 'Homepage' },
      { path: '/rooms', name: 'Rooms' },
      { path: '/contact', name: 'Contact' },
      { path: '/blog', name: 'Blog' },
      { path: '/surf-weeks', name: 'Surf Weeks' },
      { path: '/the-spot', name: 'The Spot' },
      { path: '/gallery', name: 'Gallery' },
      { path: '/about', name: 'About (redirect)' },
    ]
    
    for (const p of pages) {
      await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
      await page.waitForTimeout(1000)
      const status = page.url().includes('404') || page.url().includes('error') ? '❌' : '✅'
      console.log(`${p.name}: ${status} (${page.url()})`)
    }
  })

  test('2. Homepage CMS Content Verification', async ({ page }) => {
    console.log('\n=== HOMEPAGE CMS VERIFICATION ===')
    
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(3000)
    
    // Check hero section (CMS content)
    const heroTitle = await page.locator('h1').first().textContent()
    console.log('Hero Title:', heroTitle?.substring(0, 60))
    
    // Check for CMS sections
    const sections = [
      { selector: 'text=Heiwa Surf', name: 'Surf Weeks Section' },
      { selector: 'text=What we are about', name: 'About Section' },
      { selector: 'text=Our Rooms', name: 'Rooms Section' },
      { selector: 'text=What Our Customers Say', name: 'Reviews Section' },
    ]
    
    for (const section of sections) {
      const found = await page.locator(section.selector).first().isVisible().catch(() => false)
      console.log(`${section.name}:`, found ? '✅' : '❌')
    }
    
    await page.screenshot({ path: 'test-results-production/final-homepage.png', fullPage: true })
  })

  test('3. Gallery Page Functionality', async ({ page }) => {
    console.log('\n=== GALLERY PAGE ===')
    
    await page.goto(`${BASE_URL}/gallery`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(2000)
    
    // Check page title
    const title = await page.locator('h1').first().textContent()
    console.log('Page title:', title)
    
    // Check for filter buttons
    const filterButtons = await page.locator('button').filter({ hasText: /All|property|surf|yoga/i }).count()
    console.log('Filter buttons:', filterButtons)
    
    // Check for images
    const images = await page.locator('img').count()
    console.log('Images displayed:', images)
    
    // Test lightbox (click first image)
    const firstImage = page.locator('.aspect-square').first()
    if (await firstImage.isVisible().catch(() => false)) {
      await firstImage.click()
      await page.waitForTimeout(500)
      
      const lightboxOpen = await page.locator('.fixed.inset-0').isVisible().catch(() => false)
      console.log('Lightbox opens:', lightboxOpen ? '✅' : '❌')
      
      // Close lightbox
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
    }
    
    await page.screenshot({ path: 'test-results-production/final-gallery.png', fullPage: true })
  })

  test('4. Blog Page and Posts', async ({ page }) => {
    console.log('\n=== BLOG PAGE ===')
    
    await page.goto(`${BASE_URL}/blog`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(2000)
    
    // Check page title
    const title = await page.locator('h1').first().textContent()
    console.log('Page title:', title)
    
    // Check for blog posts
    const posts = await page.locator('article, [class*="post"], a[href*="/blog/"]').count()
    console.log('Blog posts found:', posts)
    
    // Click on first post
    const firstPost = page.locator('a[href*="/blog/"]').first()
    if (await firstPost.isVisible().catch(() => false)) {
      await firstPost.click()
      await page.waitForTimeout(2000)
      
      const postTitle = await page.locator('h1').first().textContent()
      console.log('Post title:', postTitle?.substring(0, 50))
      
      // Check for post content
      const hasContent = await page.locator('article, [class*="content"], p').first().isVisible().catch(() => false)
      console.log('Post has content:', hasContent ? '✅' : '❌')
    }
    
    await page.screenshot({ path: 'test-results-production/final-blog.png', fullPage: true })
  })

  test('5. Admin CMS - Homepage Editor', async ({ page }) => {
    console.log('\n=== ADMIN CMS HOMEPAGE ===')
    
    await loginToAdmin(page)
    
    await page.goto(`${BASE_URL}/admin/homepage`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    // Check for CMS sections
    const sections = await page.locator('[class*="section"], [class*="card"]').count()
    console.log('CMS sections displayed:', sections)
    
    // Check for editable fields
    const inputs = await page.locator('input, textarea').count()
    console.log('Editable fields:', inputs)
    
    // Check for save button
    const saveButton = await page.locator('button:has-text("Save")').isVisible().catch(() => false)
    console.log('Save button:', saveButton ? '✅' : '❌')
    
    await page.screenshot({ path: 'test-results-production/final-admin-cms.png', fullPage: true })
  })

  test('6. Admin Bookings - Create New Booking', async ({ page }) => {
    console.log('\n=== ADMIN CREATE BOOKING ===')
    
    await loginToAdmin(page)
    
    await page.goto(`${BASE_URL}/admin/bookings/new`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    // Check page title
    const title = await page.locator('h1').first().textContent()
    console.log('Page title:', title)
    
    // Check form elements
    const bookingTypeRadio = await page.locator('text=Room Booking').isVisible().catch(() => false)
    const guestNameInput = await page.locator('input[placeholder*="John"]').isVisible().catch(() => false)
    const emailInput = await page.locator('input[type="email"]').isVisible().catch(() => false)
    const roomSelect = await page.locator('select').first().isVisible().catch(() => false)
    
    console.log('Booking type selection:', bookingTypeRadio ? '✅' : '❌')
    console.log('Guest name input:', guestNameInput ? '✅' : '❌')
    console.log('Email input:', emailInput ? '✅' : '❌')
    console.log('Room/Camp select:', roomSelect ? '✅' : '❌')
    
    await page.screenshot({ path: 'test-results-production/final-create-booking.png', fullPage: true })
  })

  test('7. Admin Rooms - New Room with Seasonal Pricing', async ({ page }) => {
    console.log('\n=== ADMIN NEW ROOM ===')
    
    await loginToAdmin(page)
    
    await page.goto(`${BASE_URL}/admin/rooms/new`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    // Check for seasonal pricing fields
    const peakSeason = await page.locator('text=Peak Season').isVisible().catch(() => false)
    const offSeason = await page.locator('text=Off-Season').isVisible().catch(() => false)
    
    console.log('Peak Season Rate field:', peakSeason ? '✅' : '❌')
    console.log('Off-Season Rate field:', offSeason ? '✅' : '❌')
    
    // Check other form fields
    const nameInput = await page.locator('input[placeholder*="Room"]').isVisible().catch(() => false)
    const capacityInput = await page.locator('input[type="number"]').first().isVisible().catch(() => false)
    
    console.log('Room name input:', nameInput ? '✅' : '❌')
    console.log('Capacity input:', capacityInput ? '✅' : '❌')
    
    await page.screenshot({ path: 'test-results-production/final-new-room.png', fullPage: true })
  })

  test('8. API Endpoints Verification', async ({ request }) => {
    console.log('\n=== API ENDPOINTS ===')
    
    const endpoints = [
      { name: 'Rooms API', url: `${BASE_URL}/api/rooms` },
      { name: 'Surf Camps API', url: `${BASE_URL}/api/surf-camps` },
      { name: 'Gallery API', url: `${BASE_URL}/api/gallery` },
      { name: 'Activities API', url: `${BASE_URL}/api/activities` },
      { name: 'Blog Posts API', url: `${BASE_URL}/api/blog/posts` },
      { name: 'Homepage CMS API', url: `${BASE_URL}/api/admin/homepage` },
    ]
    
    for (const endpoint of endpoints) {
      const response = await request.get(endpoint.url).catch(() => null)
      if (response) {
        const status = response.status()
        const ok = response.ok()
        console.log(`${endpoint.name}: ${status}`, ok ? '✅' : '❌')
        
        if (ok) {
          const data = await response.json().catch(() => null)
          if (data?.success !== undefined) {
            console.log(`  - Success: ${data.success}`)
          }
        }
      }
    }
  })

  test('9. Mobile Responsiveness', async ({ page }) => {
    console.log('\n=== MOBILE RESPONSIVENESS ===')
    
    await page.setViewportSize({ width: 375, height: 812 })
    
    const pages = [
      { path: '/', name: 'Homepage' },
      { path: '/gallery', name: 'Gallery' },
      { path: '/rooms', name: 'Rooms' },
    ]
    
    for (const p of pages) {
      await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
      await page.waitForTimeout(1000)
      
      // Check for horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth
      })
      
      console.log(`${p.name} mobile:`, !hasHorizontalScroll ? '✅ No overflow' : '❌ Has overflow')
    }
    
    await page.screenshot({ path: 'test-results-production/final-mobile.png', fullPage: true })
  })

  test('10. Console Errors Check', async ({ page }) => {
    console.log('\n=== CONSOLE ERRORS ===')
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    const pages = ['/', '/gallery', '/blog', '/rooms', '/contact']
    
    for (const path of pages) {
      await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
      await page.waitForTimeout(2000)
    }
    
    console.log('Total errors:', errors.length)
    if (errors.length > 0 && errors.length <= 5) {
      errors.forEach((e, i) => console.log(`  ${i + 1}. ${e.substring(0, 80)}`))
    } else if (errors.length > 5) {
      console.log('  (Too many errors to display)')
    } else {
      console.log('  ✅ No console errors!')
    }
  })
})
