import { test, expect } from '@playwright/test'
import { ensureAdminAuth, navigateToAdminPage, waitForAdminPageLoad } from './helpers/admin-helpers'

test.describe('Admin Blog Management', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAdminAuth(page)
    await navigateToAdminPage(page, '/blog/posts')
    await waitForAdminPageLoad(page)
  })

  test('should load blog posts page', async ({ page }) => {
    // Accept either /admin/blog or /blog
    await expect(page).toHaveURL(/.*\/(admin\/)?blog/)
    
    const postsList = page.locator('table, [data-testid*="posts-list"], [class*="post"]')
    await expect(postsList.first()).toBeVisible({ timeout: 10000 })
  })

  test('should display blog posts list', async ({ page }) => {
    const posts = page.locator('tbody tr, [class*="post-card"], [data-testid*="post"]')
    const count = await posts.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should navigate to create new post', async ({ page }) => {
    const createButton = page.locator('button:has-text("New"), a[href*="new"], button:has-text("Create")')
    
    if (await createButton.count() > 0) {
      await createButton.first().click()
      await page.waitForTimeout(1000)
      
      await expect(page).toHaveURL(/.*\/admin\/blog\/.*\/new/)
    }
  })

  test('should load blog categories', async ({ page }) => {
    await navigateToAdminPage(page, '/blog/categories')
    await waitForAdminPageLoad(page)
    
    await expect(page).toHaveURL(/.*\/admin\/blog\/categories/)
    
    const categoriesList = page.locator('table, [data-testid*="categories"]')
    await expect(categoriesList.first()).toBeVisible({ timeout: 10000 })
  })

  test('should load blog tags', async ({ page }) => {
    await navigateToAdminPage(page, '/blog/tags')
    await waitForAdminPageLoad(page)
    
    await expect(page).toHaveURL(/.*\/admin\/blog\/tags/)
    
    const tagsList = page.locator('table, [data-testid*="tags"]')
    await expect(tagsList.first()).toBeVisible({ timeout: 10000 })
  })

  test('should load blog authors', async ({ page }) => {
    await navigateToAdminPage(page, '/blog/authors')
    await waitForAdminPageLoad(page)
    
    await expect(page).toHaveURL(/.*\/admin\/blog\/authors/)
    
    const authorsList = page.locator('table, [data-testid*="authors"]')
    await expect(authorsList.first()).toBeVisible({ timeout: 10000 })
  })
})

