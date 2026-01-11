import { test, expect } from '@playwright/test'

test.describe('Basic Smoke Tests', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    
    // Check page loaded successfully
    await expect(page).toHaveTitle(/Heiwa House/)
  })

  test('should load rooms page', async ({ page }) => {
    await page.goto('/rooms')
    await page.waitForLoadState('domcontentloaded')
    
    // Check page loaded
    const url = page.url()
    expect(url).toContain('/rooms')
  })

  test('should load surf weeks page', async ({ page }) => {
    await page.goto('/surf-weeks')
    await page.waitForLoadState('domcontentloaded')
    
    // Check page loaded
    const url = page.url()
    expect(url).toContain('/surf-weeks')
  })

  test('should return 200 for rooms API', async ({ request }) => {
    const response = await request.get('/api/rooms')
    expect(response.status()).toBe(200)
    
    const result = await response.json()
    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
  })

  test('should return 200 for surf camps API', async ({ request }) => {
    const response = await request.get('/api/surf-camps')
    expect(response.status()).toBe(200)
    
    const result = await response.json()
    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
  })
})
