import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 0,
  workers: undefined,
  reporter: 'list',
  use: {
    baseURL: 'https://heiwahauz.netlify.app',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
})
