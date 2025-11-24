import { defineConfig, devices } from '@playwright/test'

/**
 * Production Playwright configuration for admin testing
 * Tests run against https://heiwahauz.netlify.app
 */
export default defineConfig({
  testDir: './e2e',
  /* Only run production admin tests */
  testMatch: '**/production-*.spec.ts',
  /* Run tests in files in parallel */
  fullyParallel: false, // Sequential for production to avoid rate limiting
  /* Global test timeout */
  timeout: 120000, // 2 minutes per test
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0, // No retries locally to see failures faster
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 1, // Single worker for production
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'test-results-production' }],
    ['json', { outputFile: 'test-results-production/results.json' }],
    ['list']
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'https://heiwahauz.netlify.app',
    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    /* Video on failure */
    video: 'retain-on-failure',
    /* Increased timeout for production */
    actionTimeout: 60000,
    navigationTimeout: 90000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Store auth state
        storageState: 'e2e/.auth/admin.json',
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        storageState: 'e2e/.auth/admin.json',
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        storageState: 'e2e/.auth/admin.json',
      },
    },
  ],

  /* Global setup for authentication */
  globalSetup: require.resolve('./e2e/fixtures/global-setup.ts'),
  
  /* Output directory for test artifacts */
  outputDir: 'test-results-production/',
})

