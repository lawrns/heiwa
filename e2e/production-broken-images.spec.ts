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

interface BrokenImage {
  page: string
  src: string
  alt: string
  naturalWidth: number
  naturalHeight: number
}

test.describe('BROKEN IMAGES AUDIT', () => {

  test('Scan all pages for broken images', async ({ page }) => {
    console.log('\n=== BROKEN IMAGES AUDIT ===\n')
    
    const allBrokenImages: BrokenImage[] = []
    
    // Pages to scan
    const pagesToScan = [
      { path: '/', name: 'Homepage' },
      { path: '/rooms', name: 'Rooms List' },
      { path: '/gallery', name: 'Gallery' },
      { path: '/blog', name: 'Blog' },
      { path: '/surf-weeks', name: 'Surf Weeks' },
      { path: '/the-spot', name: 'The Spot' },
      { path: '/contact', name: 'Contact' },
    ]
    
    for (const p of pagesToScan) {
      await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForTimeout(2000)
      
      // Find all images and check if they loaded
      const brokenImages = await page.evaluate(() => {
        const images = document.querySelectorAll('img')
        const broken: { src: string; alt: string; naturalWidth: number; naturalHeight: number }[] = []
        
        images.forEach(img => {
          // Check if image failed to load (naturalWidth/Height = 0 means broken)
          if (img.naturalWidth === 0 && img.naturalHeight === 0 && img.src) {
            broken.push({
              src: img.src,
              alt: img.alt || '(no alt)',
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight
            })
          }
        })
        
        return broken
      })
      
      if (brokenImages.length > 0) {
        console.log(`\n${p.name} (${p.path}):`)
        brokenImages.forEach(img => {
          console.log(`  ❌ ${img.alt}: ${img.src.substring(0, 80)}...`)
          allBrokenImages.push({ page: p.path, ...img })
        })
      } else {
        console.log(`${p.name}: ✅ No broken images`)
      }
    }
    
    // Scan individual room pages
    console.log('\n--- Scanning Room Detail Pages ---')
    
    // Get room IDs from API
    const roomsResponse = await page.request.get(`${BASE_URL}/api/rooms`)
    const roomsData = await roomsResponse.json()
    const rooms = roomsData.data?.rooms || []
    
    for (const room of rooms.slice(0, 5)) { // Check first 5 rooms
      await page.goto(`${BASE_URL}/rooms/${room.id}`, { waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForTimeout(2000)
      
      const brokenImages = await page.evaluate(() => {
        const images = document.querySelectorAll('img')
        const broken: { src: string; alt: string; naturalWidth: number; naturalHeight: number }[] = []
        
        images.forEach(img => {
          if (img.naturalWidth === 0 && img.naturalHeight === 0 && img.src) {
            broken.push({
              src: img.src,
              alt: img.alt || '(no alt)',
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight
            })
          }
        })
        
        return broken
      })
      
      if (brokenImages.length > 0) {
        console.log(`\nRoom: ${room.name}:`)
        brokenImages.forEach(img => {
          console.log(`  ❌ ${img.alt}: ${img.src.substring(0, 80)}...`)
          allBrokenImages.push({ page: `/rooms/${room.id}`, ...img })
        })
      } else {
        console.log(`Room ${room.name}: ✅ No broken images`)
      }
    }
    
    // Scan admin pages
    console.log('\n--- Scanning Admin Pages ---')
    await loginToAdmin(page)
    
    const adminPages = [
      { path: '/admin', name: 'Dashboard' },
      { path: '/admin/rooms', name: 'Admin Rooms' },
      { path: '/admin/gallery', name: 'Admin Gallery' },
    ]
    
    for (const p of adminPages) {
      await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForTimeout(2000)
      
      const brokenImages = await page.evaluate(() => {
        const images = document.querySelectorAll('img')
        const broken: { src: string; alt: string; naturalWidth: number; naturalHeight: number }[] = []
        
        images.forEach(img => {
          if (img.naturalWidth === 0 && img.naturalHeight === 0 && img.src) {
            broken.push({
              src: img.src,
              alt: img.alt || '(no alt)',
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight
            })
          }
        })
        
        return broken
      })
      
      if (brokenImages.length > 0) {
        console.log(`\n${p.name}:`)
        brokenImages.forEach(img => {
          console.log(`  ❌ ${img.alt}: ${img.src.substring(0, 80)}...`)
          allBrokenImages.push({ page: p.path, ...img })
        })
      } else {
        console.log(`${p.name}: ✅ No broken images`)
      }
    }
    
    // Summary
    console.log('\n=== SUMMARY ===')
    console.log(`Total broken images found: ${allBrokenImages.length}`)
    
    // Group by domain
    const byDomain: Record<string, number> = {}
    allBrokenImages.forEach(img => {
      try {
        const url = new URL(img.src)
        const domain = url.hostname
        byDomain[domain] = (byDomain[domain] || 0) + 1
      } catch {
        byDomain['invalid-url'] = (byDomain['invalid-url'] || 0) + 1
      }
    })
    
    console.log('\nBroken images by domain:')
    Object.entries(byDomain).forEach(([domain, count]) => {
      console.log(`  ${domain}: ${count}`)
    })
    
    // Unique broken URLs
    const uniqueUrls = [...new Set(allBrokenImages.map(img => img.src))]
    console.log(`\nUnique broken URLs: ${uniqueUrls.length}`)
    uniqueUrls.forEach(url => {
      console.log(`  - ${url.substring(0, 100)}`)
    })
  })
})
