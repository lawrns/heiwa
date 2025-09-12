const { test, expect } = require('@playwright/test');

test('verify admin dashboard is accessible', async ({ page }) => {
  await page.goto('/admin');
  await page.waitForLoadState('networkidle');
  
  console.log('Page URL:', page.url());
  console.log('Page title:', await page.title());
  
  expect(page.url()).toContain('/admin');
});
