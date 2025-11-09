const { test, expect } = require('@playwright/test')

const BASE_URL = 'https://heiwa-house-portugal.netlify.app'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'heiwa_admin_2024'

async function login(page) {
  await page.goto(`${BASE_URL}/admin/login`)
  await page.fill('input#password', ADMIN_PASSWORD)
  await page.getByRole('button', { name: 'Sign In' }).click()
  await page.waitForURL('**/admin')
  await page.waitForLoadState('domcontentloaded')
}

async function saveChanges(page) {
  const [dialog] = await Promise.all([
    page.waitForEvent('dialog'),
    page.getByRole('button', { name: 'Save Changes' }).click(),
  ])
  await dialog.accept()
  await page.waitForTimeout(1500)
}

test('Admin CMS updates reflect on homepage', async ({ page }) => {
  expect(ADMIN_PASSWORD, 'Admin password must be provided').toBeTruthy()

  const newTitle = `Welcome to Heiwa House – Automated Test ${Date.now()}`
  let originalTitle = ''

  const updateHeroTitle = async (title) => {
    await page.goto(`${BASE_URL}/admin/homepage`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    // Find any input field and update it
    const firstInput = page.locator('input[type="text"]').first()
    await firstInput.waitFor({ state: 'visible' })

    if (!originalTitle) {
      originalTitle = await firstInput.inputValue()
      console.log(`Original title: "${originalTitle}"`)
    }

    await firstInput.clear()
    await firstInput.fill(title)
    console.log(`Updated title to: "${title}"`)
    
    await saveChanges(page)
  }

  try {
    await login(page)

    // Update hero title via CMS
    await updateHeroTitle(newTitle)

    // Verify change on homepage
    await page.goto(`${BASE_URL}/`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(5000)
    
    // Check if the title is visible anywhere on the page
    const titleLocator = page.getByText(newTitle, { exact: true })
    const isVisible = await titleLocator.isVisible().catch(() => false)
    
    if (!isVisible) {
      // Fallback: check if the title is in the page content
      const pageContent = await page.content()
      const hasTitle = pageContent.includes(newTitle)
      if (!hasTitle) {
        throw new Error(`Title "${newTitle}" not found on homepage after CMS update`)
      }
    }
    
    await expect(titleLocator).toBeVisible()
  } finally {
    if (originalTitle && originalTitle !== newTitle) {
      await login(page)
      await updateHeroTitle(originalTitle)
    }
  }
})
