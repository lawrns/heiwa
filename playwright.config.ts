import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/unit/**', '**/utils/**'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 2,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 30000,
  outputDir: 'tests/results/',

  use: {
    baseURL: 'http://localhost:3009',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    headless: true,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        viewport: { width: 1280, height: 720 }, // Consistent viewport for visual regression
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        headless: true,
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        headless: true,
        viewport: { width: 1280, height: 720 },
      },
    },
    // Mobile testing for responsive visual regression
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        headless: true,
      },
    },
  ],

  expect: {
    // Visual regression testing configuration
    toMatchSnapshot: { threshold: 0.2 },
    toHaveScreenshot: {
      threshold: 0.2,
      animations: 'disabled',
      caret: 'hide',
    },
  },

  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3009',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 180 * 1000,
  // },
})

