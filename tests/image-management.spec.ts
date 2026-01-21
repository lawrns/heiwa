import { test, expect } from '@playwright/test'

test.describe('CMS Image Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin login
    await page.goto('/admin')
    
    // Login
    await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD || 'heiwa_secure_admin_2025')
    await page.click('button[type="submit"]')
    
    // Wait for navigation to complete
    await page.waitForURL('/admin')
  })

  test('Carousel image reordering', async ({ page }) => {
    // Navigate to a page with carousel images
    await page.goto('/admin/cms/pages/flow')
    await page.waitForLoadState('networkidle')
    
    // Find an Experience Highlight section
    const experienceHighlight = page.locator('[data-section-type="experience-highlight"]').first()
    await expect(experienceHighlight).toBeVisible()
    
    // Click edit button
    await experienceHighlight.locator('button[aria-label*="Edit"]').click()
    await page.waitForTimeout(500)
    
    // Find carousel images
    const carouselImages = page.locator('[data-testid="carousel-image"]')
    const initialCount = await carouselImages.count()
    
    if (initialCount < 2) {
      test.skip()
      return
    }
    
    // Get first image text
    const firstImageUrl = await carouselImages.nth(0).locator('input[type="text"]').inputValue()
    const secondImageUrl = await carouselImages.nth(1).locator('input[type="text"]').inputValue()
    
    // Drag first image to second position
    const dragHandle = carouselImages.nth(0).locator('[data-testid="drag-handle"]')
    const dropTarget = carouselImages.nth(1)
    
    await dragHandle.dragTo(dropTarget)
    await page.waitForTimeout(500)
    
    // Verify images were reordered
    const newFirstImageUrl = await carouselImages.nth(0).locator('input[type="text"]').inputValue()
    const newSecondImageUrl = await carouselImages.nth(1).locator('input[type="text"]').inputValue()
    
    expect(newFirstImageUrl).toBe(secondImageUrl)
    expect(newSecondImageUrl).toBe(firstImageUrl)
  })

  test('Image editing and optimization', async ({ page }) => {
    // Navigate to a page with carousel images
    await page.goto('/admin/cms/pages/flow')
    await page.waitForLoadState('networkidle')
    
    // Find an Experience Highlight section
    const experienceHighlight = page.locator('[data-section-type="experience-highlight"]').first()
    await experienceHighlight.locator('button[aria-label*="Edit"]').click()
    await page.waitForTimeout(500)
    
    // Find first carousel image
    const firstImage = page.locator('[data-testid="carousel-image"]').first()
    await firstImage.locator('button[title*="Edit image"]').click()
    
    // Wait for image edit modal
    const modal = page.locator('[data-testid="image-edit-modal"]')
    await expect(modal).toBeVisible({ timeout: 5000 })
    
    // Update alt text
    const altTextInput = modal.locator('textarea[placeholder*="screen readers"]')
    await altTextInput.fill('Test alt text for accessibility')
    
    // Update optimization settings
    const brightnessSlider = modal.locator('input[type="range"][max="150"]').first()
    await brightnessSlider.fill('110')
    
    const contrastSlider = modal.locator('input[type="range"][max="150"]').nth(1)
    await contrastSlider.fill('105')
    
    const qualitySlider = modal.locator('input[type="range"][max="100"]')
    await qualitySlider.fill('90')
    
    // Save changes
    await modal.locator('button:has-text("Save Changes")').click()
    
    // Wait for modal to close
    await expect(modal).not.toBeVisible({ timeout: 3000 })
    
    // Verify alt text was updated
    const updatedAltText = await firstImage.locator('input[placeholder*="Alt text"]').inputValue()
    expect(updatedAltText).toBe('Test alt text for accessibility')
  })

  test('Image validation on upload', async ({ page }) => {
    await page.goto('/admin/cms/pages/flow')
    await page.waitForLoadState('networkidle')
    
    const experienceHighlight = page.locator('[data-section-type="experience-highlight"]').first()
    await experienceHighlight.locator('button[aria-label*="Edit"]').click()
    await page.waitForTimeout(500)
    
    // Add new image
    await page.locator('button:has-text("Add Image")').click()
    
    // Try to add invalid URL
    const urlInput = page.locator('[data-testid="carousel-image"]').last().locator('input[placeholder*="Image URL"]')
    await urlInput.fill('not-a-valid-url')
    await page.waitForTimeout(1000)
    
    // Verify error message appears
    const errorMessage = page.locator('text=/Invalid image URL/')
    await expect(errorMessage).toBeVisible({ timeout: 3000 })
    
    // Try valid URL
    await urlInput.fill('/images/rooms/room1.jpg')
    await page.waitForTimeout(1000)
    
    // Verify image loads successfully
    const imagePreview = page.locator('[data-testid="carousel-image"]').last().locator('img')
    await expect(imagePreview).toBeVisible({ timeout: 3000 })
  })

  test('Alt text requirement validation', async ({ page }) => {
    await page.goto('/admin/cms/pages/flow')
    await page.waitForLoadState('networkidle')
    
    const experienceHighlight = page.locator('[data-section-type="experience-highlight"]').first()
    await experienceHighlight.locator('button[aria-label*="Edit"]').click()
    await page.waitForTimeout(500)
    
    // Add new image with URL but no alt text
    await page.locator('button:has-text("Add Image")').click()
    const urlInput = page.locator('[data-testid="carousel-image"]').last().locator('input[placeholder*="Image URL"]')
    await urlInput.fill('/images/rooms/room1.jpg')
    await page.waitForTimeout(1000)
    
    // Verify alt text warning appears
    const altWarning = page.locator('[data-testid="carousel-image"]').last().locator('text=/Alt text required/')
    await expect(altWarning).toBeVisible({ timeout: 3000 })
    
    // Fill alt text
    const altInput = page.locator('[data-testid="carousel-image"]').last().locator('input[placeholder*="Alt text"]')
    await altInput.fill('Beautiful room with ocean view')
    await page.waitForTimeout(500)
    
    // Verify warning disappears
    await expect(altWarning).not.toBeVisible({ timeout: 2000 })
  })
})

test.describe('Responsive Images', () => {
  test('Responsive image loading on different devices', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const heroImage = page.locator('[data-testid="hero-image"] img').first()
    await expect(heroImage).toBeVisible()
    
    // Verify image loads
    const naturalWidth = await heroImage.evaluate(img => img.naturalWidth)
    expect(naturalWidth).toBeGreaterThan(0)
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await expect(heroImage).toBeVisible()
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await expect(heroImage).toBeVisible()
  })

  test('Image carousel with responsive images', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Find carousel
    const carousel = page.locator('[data-testid="image-carousel"]').first()
    if (await carousel.count() === 0) {
      test.skip()
      return
    }
    
    await expect(carousel).toBeVisible()
    
    // Check for responsive image attributes
    const images = carousel.locator('img')
    const imageCount = await images.count()
    
    if (imageCount > 0) {
      const firstImage = images.first()
      const srcset = await firstImage.getAttribute('srcset')
      const sizes = await firstImage.getAttribute('sizes')
      
      // At least one should have srcset or sizes for responsive loading
      expect(srcset || sizes).toBeTruthy()
    }
  })
})

test.describe('Image Optimization API', () => {
  test('Image optimization endpoint returns optimized image', async ({ request }) => {
    const response = await request.post('/api/images/optimize', {
      data: {
        imageUrl: '/images/rooms/room1.jpg',
        options: {
          width: 800,
          height: 600,
          quality: 85,
          format: 'webp'
        }
      }
    })
    
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.url).toBeTruthy()
    expect(data.metadata).toBeDefined()
    expect(data.metadata.width).toBe(800)
    expect(data.metadata.height).toBe(600)
  })

  test('Image optimization with GET endpoint', async ({ request }) => {
    const response = await request.get('/api/images/optimize', {
      params: {
        url: '/images/rooms/room1.jpg',
        width: '800',
        height: '600',
        quality: '85',
        format: 'webp'
      }
    })
    
    expect(response.ok()).toBeTruthy()
    expect(response.headers()['content-type']).toContain('image/')
  })
})

test.describe('Image Management UI', () => {
  test('Grid image editor displays correctly', async ({ page }) => {
    await page.goto('/admin')
    await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD || 'heiwa_secure_admin_2025')
    await page.click('button[type="submit"]')
    await page.waitForURL('/admin')
    
    // Navigate to rooms page
    await page.goto('/admin/rooms')
    await page.waitForLoadState('networkidle')
    
    // Find a room and edit
    const roomRow = page.locator('tbody tr').first()
    await roomRow.locator('button[aria-label*="Edit"]').click()
    await page.waitForTimeout(500)
    
    // Check for image gallery
    const imageGallery = page.locator('[data-testid="room-image-gallery"]')
    await expect(imageGallery).toBeVisible({ timeout: 5000 })
    
    // Verify grid view is available
    const gridView = imageGallery.locator('button[title*="Grid view"]')
    await expect(gridView).toBeVisible()
    
    // Verify list view is available
    const listView = imageGallery.locator('button[title*="List view"]')
    await expect(listView).toBeVisible()
  })

  test('Image upload component works', async ({ page }) => {
    await page.goto('/admin')
    await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD || 'heiwa_secure_admin_2025')
    await page.click('button[type="submit"]')
    await page.waitForURL('/admin')
    
    await page.goto('/admin/rooms')
    await page.waitForLoadState('networkidle')
    
    const roomRow = page.locator('tbody tr').first()
    await roomRow.locator('button[aria-label*="Edit"]').click()
    await page.waitForTimeout(500)
    
    // Find upload area
    const uploadArea = page.locator('[data-testid="image-upload"]')
    if (await uploadArea.count() === 0) {
      test.skip()
      return
    }
    
    await expect(uploadArea).toBeVisible()
    
    // Click upload area
    await uploadArea.click()
    
    // Verify file input is triggered
    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).toBeVisible()
  })
})
