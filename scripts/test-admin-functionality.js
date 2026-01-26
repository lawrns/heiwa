/**
 * Comprehensive Admin Functionality Test Script
 * Tests all admin endpoints and CMS functionality
 */

const fetch = require('node-fetch')

const BASE_URL = process.env.BASE_URL || 'https://heiwahauz.netlify.app'
const ADMIN_PASSWORD = 'heiwa_admin_2024'

const results = {
  passed: [],
  failed: [],
  warnings: []
}

async function testAdminLogin() {
  console.log('\n🔐 Testing Admin Login...')
  
  try {
    // Test POST login
    const loginResponse = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: ADMIN_PASSWORD })
    })
    
    const loginData = await loginResponse.json()
    
    if (loginResponse.ok && loginData.success) {
      const cookies = loginResponse.headers.get('set-cookie')
      if (cookies && cookies.includes('admin_auth')) {
        results.passed.push('Admin login POST - Success')
        console.log('✅ Admin login successful')
        return cookies
      } else {
        results.warnings.push('Admin login POST - Success but no cookie set')
        console.log('⚠️  Login successful but cookie not set')
        return null
      }
    } else {
      results.failed.push(`Admin login POST - Failed: ${loginData.message || 'Unknown error'}`)
      console.log('❌ Admin login failed:', loginData.message)
      return null
    }
  } catch (error) {
    results.failed.push(`Admin login POST - Error: ${error.message}`)
    console.log('❌ Admin login error:', error.message)
    return null
  }
}

async function testAdminEndpoints(cookies) {
  console.log('\n📊 Testing Admin Endpoints...')
  
  const cookieHeader = cookies ? cookies.split(';')[0] : `admin_auth=${ADMIN_PASSWORD}`
  
  const endpoints = [
    { name: 'Dashboard', url: '/admin', method: 'GET' },
    { name: 'Bookings', url: '/api/bookings', method: 'GET' },
    { name: 'Rooms', url: '/api/rooms', method: 'GET' },
    { name: 'Surf Camps', url: '/api/surf-camps', method: 'GET' },
    { name: 'Analytics', url: '/api/admin/analytics', method: 'GET' },
    { name: 'Homepage', url: '/api/admin/homepage', method: 'GET' },
  ]
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint.url}`, {
        method: endpoint.method,
        headers: {
          'Cookie': cookieHeader
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        results.passed.push(`${endpoint.name} API - Success`)
        console.log(`✅ ${endpoint.name} API working`)
      } else {
        results.failed.push(`${endpoint.name} API - Failed: ${response.status}`)
        console.log(`❌ ${endpoint.name} API failed: ${response.status}`)
      }
    } catch (error) {
      results.failed.push(`${endpoint.name} API - Error: ${error.message}`)
      console.log(`❌ ${endpoint.name} API error:`, error.message)
    }
  }
}

async function testCMSFunctionality(cookies) {
  console.log('\n📝 Testing CMS Functionality...')
  
  const cookieHeader = cookies ? cookies.split(';')[0] : `admin_auth=${ADMIN_PASSWORD}`
  
  const cmsEndpoints = [
    { name: 'CMS Stats', url: '/api/admin/cms/page-stats', method: 'GET' },
    { name: 'Testimonials', url: '/api/admin/testimonials', method: 'GET' },
    { name: 'FAQ', url: '/api/admin/faq', method: 'GET' },
    { name: 'Pages', url: '/api/admin/pages', method: 'GET' },
  ]
  
  for (const endpoint of cmsEndpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint.url}`, {
        method: endpoint.method,
        headers: {
          'Cookie': cookieHeader
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        results.passed.push(`${endpoint.name} CMS - Success`)
        console.log(`✅ ${endpoint.name} CMS working`)
        
        // Check if data is returned
        if (data.data || data.success) {
          console.log(`   Data available: ${JSON.stringify(data).substring(0, 100)}...`)
        }
      } else {
        results.failed.push(`${endpoint.name} CMS - Failed: ${response.status}`)
        console.log(`❌ ${endpoint.name} CMS failed: ${response.status}`)
      }
    } catch (error) {
      results.failed.push(`${endpoint.name} CMS - Error: ${error.message}`)
      console.log(`❌ ${endpoint.name} CMS error:`, error.message)
    }
  }
}

async function testFrontendContent() {
  console.log('\n🌐 Testing Frontend Content Pages...')
  
  const pages = [
    { name: 'Homepage', url: '/' },
    { name: 'Rooms', url: '/rooms' },
    { name: 'Surf Weeks', url: '/surf-weeks' },
    { name: 'Flow', url: '/flow' },
    { name: 'Play', url: '/play' },
    { name: 'Surf', url: '/surf' },
    { name: 'The Spot', url: '/the-spot' },
  ]
  
  for (const page of pages) {
    try {
      const response = await fetch(`${BASE_URL}${page.url}`)
      
      if (response.ok) {
        const html = await response.text()
        if (html.includes('<!DOCTYPE') || html.includes('<html')) {
          results.passed.push(`${page.name} Page - Loads`)
          console.log(`✅ ${page.name} page loads`)
        } else {
          results.warnings.push(`${page.name} Page - Loads but may be empty`)
          console.log(`⚠️  ${page.name} page loads but content may be empty`)
        }
      } else {
        results.failed.push(`${page.name} Page - Failed: ${response.status}`)
        console.log(`❌ ${page.name} page failed: ${response.status}`)
      }
    } catch (error) {
      results.failed.push(`${page.name} Page - Error: ${error.message}`)
      console.log(`❌ ${page.name} page error:`, error.message)
    }
  }
}

async function testBlogFunctionality(cookies) {
  console.log('\n📰 Testing Blog Functionality...')
  
  const cookieHeader = cookies ? cookies.split(';')[0] : `admin_auth=${ADMIN_PASSWORD}`
  
  const blogEndpoints = [
    { name: 'Blog Posts', url: '/api/admin/blog/posts', method: 'GET' },
    { name: 'Blog Categories', url: '/api/admin/blog/categories', method: 'GET' },
    { name: 'Blog Tags', url: '/api/admin/blog/tags', method: 'GET' },
    { name: 'Blog Authors', url: '/api/admin/blog/authors', method: 'GET' },
  ]
  
  for (const endpoint of blogEndpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint.url}`, {
        method: endpoint.method,
        headers: {
          'Cookie': cookieHeader
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        results.passed.push(`${endpoint.name} - Success`)
        console.log(`✅ ${endpoint.name} working`)
      } else {
        results.failed.push(`${endpoint.name} - Failed: ${response.status}`)
        console.log(`❌ ${endpoint.name} failed: ${response.status}`)
      }
    } catch (error) {
      results.failed.push(`${endpoint.name} - Error: ${error.message}`)
      console.log(`❌ ${endpoint.name} error:`, error.message)
    }
  }
}

async function runAllTests() {
  console.log('🚀 Starting Comprehensive Admin Functionality Tests')
  console.log(`📍 Testing against: ${BASE_URL}`)
  console.log(`🔑 Using password: ${ADMIN_PASSWORD}`)
  
  // Test login first
  const cookies = await testAdminLogin()
  
  // Test admin endpoints
  await testAdminEndpoints(cookies)
  
  // Test CMS functionality
  await testCMSFunctionality(cookies)
  
  // Test blog functionality
  await testBlogFunctionality(cookies)
  
  // Test frontend content
  await testFrontendContent()
  
  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Passed: ${results.passed.length}`)
  console.log(`❌ Failed: ${results.failed.length}`)
  console.log(`⚠️  Warnings: ${results.warnings.length}`)
  
  if (results.passed.length > 0) {
    console.log('\n✅ Passed Tests:')
    results.passed.forEach(test => console.log(`   - ${test}`))
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️  Warnings:')
    results.warnings.forEach(warning => console.log(`   - ${warning}`))
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed Tests:')
    results.failed.forEach(failure => console.log(`   - ${failure}`))
  }
  
  console.log('\n' + '='.repeat(60))
  
  // Exit with appropriate code
  process.exit(results.failed.length > 0 ? 1 : 0)
}

// Run tests
runAllTests().catch(error => {
  console.error('❌ Test runner error:', error)
  process.exit(1)
})

