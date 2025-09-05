import { chromium, Browser, Page } from 'playwright'

interface TestResult {
  userStory: string
  status: 'PASS' | 'FAIL' | 'SKIP'
  error?: string
  notes?: string
}

class UserStoryTester {
  private browser: Browser | null = null
  private page: Page | null = null
  private results: TestResult[] = []

  async initialize() {
    this.browser = await chromium.launch({ headless: false })
    this.page = await this.browser.newPage()
  }

  async cleanup() {
    if (this.page) await this.page.close()
    if (this.browser) await this.browser.close()
  }

  private async addResult(result: TestResult) {
    this.results.push(result)
    const status = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️'
    console.log(`${status} ${result.userStory}`)
    if (result.error) console.log(`   Error: ${result.error}`)
    if (result.notes) console.log(`   Notes: ${result.notes}`)
  }

  async testAdminLogin() {
    if (!this.page) return

    try {
      await this.page.goto('http://localhost:3000/admin/login')

      // Check if login page loads
      await this.page.waitForSelector('h1', { timeout: 5000 })
      const title = await this.page.textContent('h1')

      if (title?.includes('Admin Login')) {
        await this.addResult({
          userStory: 'Admin Login - Page loads correctly',
          status: 'PASS'
        })
      } else {
        await this.addResult({
          userStory: 'Admin Login - Page loads correctly',
          status: 'FAIL',
          error: 'Login page title not found'
        })
      }

      // Test navigation elements
      const loginForm = await this.page.locator('form').count()
      if (loginForm > 0) {
        await this.addResult({
          userStory: 'Admin Login - Form elements present',
          status: 'PASS'
        })
      } else {
        await this.addResult({
          userStory: 'Admin Login - Form elements present',
          status: 'FAIL',
          error: 'Login form not found'
        })
      }

    } catch (error) {
      await this.addResult({
        userStory: 'Admin Login - Basic functionality',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  async testAdminDashboard() {
    if (!this.page) return

    try {
      await this.page.goto('http://localhost:3000/admin')

      // Check if dashboard loads
      await this.page.waitForSelector('h1', { timeout: 5000 })
      const title = await this.page.textContent('h1')

      if (title?.includes('Admin Dashboard')) {
        await this.addResult({
          userStory: 'Admin Dashboard - Loads correctly',
          status: 'PASS'
        })
      } else {
        await this.addResult({
          userStory: 'Admin Dashboard - Loads correctly',
          status: 'FAIL',
          error: 'Dashboard title not found'
        })
      }

      // Check navigation sidebar
      const sidebar = await this.page.locator('[aria-label="Navigation menu"]').count()
      if (sidebar > 0) {
        await this.addResult({
          userStory: 'Admin Dashboard - Navigation sidebar present',
          status: 'PASS'
        })
      } else {
        await this.addResult({
          userStory: 'Admin Dashboard - Navigation sidebar present',
          status: 'FAIL',
          error: 'Navigation sidebar not found'
        })
      }

      // Check dashboard cards
      const cards = await this.page.locator('[class*="border-gray-200"]').count()
      if (cards >= 6) {
        await this.addResult({
          userStory: 'Admin Dashboard - Dashboard cards present',
          status: 'PASS'
        })
      } else {
        await this.addResult({
          userStory: 'Admin Dashboard - Dashboard cards present',
          status: 'FAIL',
          error: `Only found ${cards} cards, expected at least 6`
        })
      }

    } catch (error) {
      await this.addResult({
        userStory: 'Admin Dashboard - Basic functionality',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  async testAnalyticsDashboard() {
    if (!this.page) return

    try {
      await this.page.goto('http://localhost:3000/admin/analytics')

      // Check if analytics page loads
      await this.page.waitForSelector('h1', { timeout: 5000 })
      const title = await this.page.textContent('h1')

      if (title?.includes('Analytics Dashboard')) {
        await this.addResult({
          userStory: 'Analytics Dashboard - Loads correctly',
          status: 'PASS'
        })
      } else {
        await this.addResult({
          userStory: 'Analytics Dashboard - Loads correctly',
          status: 'FAIL',
          error: 'Analytics title not found'
        })
      }

      // Check key metrics cards
      const metrics = await this.page.locator('[class*="bg-gradient-to-br"]').count()
      if (metrics >= 4) {
        await this.addResult({
          userStory: 'Analytics Dashboard - Key metrics displayed',
          status: 'PASS'
        })
      } else {
        await this.addResult({
          userStory: 'Analytics Dashboard - Key metrics displayed',
          status: 'FAIL',
          error: `Only found ${metrics} metrics cards, expected at least 4`
        })
      }

    } catch (error) {
      await this.addResult({
        userStory: 'Analytics Dashboard - Basic functionality',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  async testComplianceFeatures() {
    if (!this.page) return

    try {
      await this.page.goto('http://localhost:3000/admin/compliance')

      // Check if compliance page loads
      await this.page.waitForSelector('h1', { timeout: 5000 })
      const title = await this.page.textContent('h1')

      if (title?.includes('GDPR Compliance')) {
        await this.addResult({
          userStory: 'GDPR Compliance - Page loads correctly',
          status: 'PASS'
        })
      } else {
        await this.addResult({
          userStory: 'GDPR Compliance - Page loads correctly',
          status: 'FAIL',
          error: 'Compliance title not found'
        })
      }

      // Check tab navigation
      const tabs = await this.page.locator('[role="tab"]').count()
      if (tabs >= 4) {
        await this.addResult({
          userStory: 'GDPR Compliance - Tab navigation present',
          status: 'PASS'
        })
      } else {
        await this.addResult({
          userStory: 'GDPR Compliance - Tab navigation present',
          status: 'FAIL',
          error: `Only found ${tabs} tabs, expected at least 4`
        })
      }

    } catch (error) {
      await this.addResult({
        userStory: 'GDPR Compliance - Basic functionality',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  async testSystemAdministration() {
    if (!this.page) return

    try {
      await this.page.goto('http://localhost:3000/admin/system')

      // Check if system page loads
      await this.page.waitForSelector('h1', { timeout: 5000 })
      const title = await this.page.textContent('h1')

      if (title?.includes('System Administration')) {
        await this.addResult({
          userStory: 'System Administration - Page loads correctly',
          status: 'PASS'
        })
      } else {
        await this.addResult({
          userStory: 'System Administration - Page loads correctly',
          status: 'FAIL',
          error: 'System admin title not found'
        })
      }

      // Check overview metrics
      const metrics = await this.page.locator('[class*="bg-gradient-to-br"]').count()
      if (metrics >= 4) {
        await this.addResult({
          userStory: 'System Administration - Overview metrics present',
          status: 'PASS'
        })
      } else {
        await this.addResult({
          userStory: 'System Administration - Overview metrics present',
          status: 'FAIL',
          error: `Only found ${metrics} metrics cards, expected at least 4`
        })
      }

    } catch (error) {
      await this.addResult({
        userStory: 'System Administration - Basic functionality',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  async testClientPortal() {
    if (!this.page) return

    try {
      await this.page.goto('http://localhost:3000/client/auth')

      // Check if client auth page loads
      await this.page.waitForSelector('h1', { timeout: 5000 })
      const title = await this.page.textContent('h1')

      if (title?.includes('Welcome to Heiwa House')) {
        await this.addResult({
          userStory: 'Client Portal - Authentication page loads',
          status: 'PASS'
        })
      } else {
        await this.addResult({
          userStory: 'Client Portal - Authentication page loads',
          status: 'FAIL',
          error: 'Client auth title not found'
        })
      }

      // Check login/register tabs
      const tabs = await this.page.locator('[role="tab"]').count()
      if (tabs >= 2) {
        await this.addResult({
          userStory: 'Client Portal - Login/Register tabs present',
          status: 'PASS'
        })
      } else {
        await this.addResult({
          userStory: 'Client Portal - Login/Register tabs present',
          status: 'FAIL',
          error: `Only found ${tabs} tabs, expected at least 2`
        })
      }

    } catch (error) {
      await this.addResult({
        userStory: 'Client Portal - Basic functionality',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  async runAllTests() {
    console.log('🚀 Starting comprehensive user story testing...\n')

    await this.initialize()

    try {
      await this.testAdminLogin()
      await this.testAdminDashboard()
      await this.testAnalyticsDashboard()
      await this.testComplianceFeatures()
      await this.testSystemAdministration()
      await this.testClientPortal()

      // Summary
      const passed = this.results.filter(r => r.status === 'PASS').length
      const failed = this.results.filter(r => r.status === 'FAIL').length
      const skipped = this.results.filter(r => r.status === 'SKIP').length

      console.log('\n📊 Test Summary:')
      console.log(`✅ Passed: ${passed}`)
      console.log(`❌ Failed: ${failed}`)
      console.log(`⏭️ Skipped: ${skipped}`)
      console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`)

      if (failed > 0) {
        console.log('\n❌ Failed Tests:')
        this.results.filter(r => r.status === 'FAIL').forEach(result => {
          console.log(`   • ${result.userStory}: ${result.error}`)
        })
      }

      return {
        passed,
        failed,
        skipped,
        total: passed + failed + skipped,
        results: this.results
      }

    } finally {
      await this.cleanup()
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new UserStoryTester()
  tester.runAllTests().then((summary) => {
    process.exit(summary.failed > 0 ? 1 : 0)
  }).catch((error) => {
    console.error('Test runner failed:', error)
    process.exit(1)
  })
}

export { UserStoryTester }

