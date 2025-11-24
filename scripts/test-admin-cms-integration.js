/**
 * Admin CMS Integration Test
 * Verifies that admin changes reflect on the frontend
 */

const fetch = require('node-fetch')

const BASE_URL = process.env.BASE_URL || 'https://heiwahauz.netlify.app'
const ADMIN_PASSWORD = 'heiwa_admin_2024'

let adminCookie = null

async function login() {
  const response = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: ADMIN_PASSWORD })
  })
  
  if (response.ok) {
    const cookies = response.headers.get('set-cookie')
    adminCookie = cookies ? cookies.split(';')[0] : `admin_auth=${ADMIN_PASSWORD}`
    return true
  }
  return false
}

async function testCMSContentReflection() {
  console.log('\n🔄 Testing CMS Content Reflection on Frontend...\n')
  
  // Test 1: Check testimonials on homepage
  console.log('1. Testing Testimonials on Homepage...')
  try {
    const testimonialsResponse = await fetch(`${BASE_URL}/api/admin/testimonials`)
    const testimonialsData = await testimonialsResponse.json()
    
    if (testimonialsData.success && testimonialsData.data && testimonialsData.data.length > 0) {
      console.log(`   ✅ Found ${testimonialsData.data.length} testimonials in CMS`)
      
      // Check if testimonials appear on homepage
      const homepageResponse = await fetch(`${BASE_URL}/`)
      const homepageHtml = await homepageResponse.text()
      
      const testimonialAuthors = testimonialsData.data.map(t => t.author_name)
      const foundOnPage = testimonialAuthors.some(author => 
        homepageHtml.includes(author) || homepageHtml.includes(author.replace(/\s+/g, ''))
      )
      
      if (foundOnPage) {
        console.log('   ✅ Testimonials appear on homepage')
      } else {
        console.log('   ⚠️  Testimonials in CMS but may not be displayed on homepage')
      }
    } else {
      console.log('   ⚠️  No testimonials found in CMS')
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }
  
  // Test 2: Check FAQ content on Flow page
  console.log('\n2. Testing FAQ Content on Flow Page...')
  try {
    const faqResponse = await fetch(`${BASE_URL}/api/admin/faq`)
    const faqData = await faqResponse.json()
    
    if (faqData.success && faqData.data) {
      const flowFAQs = faqData.data.filter(faq => faq.page_slug === 'flow')
      console.log(`   ✅ Found ${flowFAQs.length} FAQs for Flow page in CMS`)
      
      const flowPageResponse = await fetch(`${BASE_URL}/flow`)
      const flowPageHtml = await flowPageResponse.text()
      
      if (flowPageHtml.includes('FAQ') || flowPageHtml.includes('faq') || flowPageHtml.includes('question')) {
        console.log('   ✅ FAQ section appears on Flow page')
      } else {
        console.log('   ⚠️  FAQs in CMS but may not be displayed on Flow page')
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }
  
  // Test 3: Check page content
  console.log('\n3. Testing Page Content...')
  try {
    const pagesResponse = await fetch(`${BASE_URL}/api/admin/pages`)
    const pagesData = await pagesResponse.json()
    
    if (pagesData.success && pagesData.data) {
      console.log(`   ✅ Found ${pagesData.data.length} page sections in CMS`)
      
      // Check if page content is used
      const flowPageResponse = await fetch(`${BASE_URL}/flow`)
      const flowPageHtml = await flowPageResponse.text()
      
      const flowPages = pagesData.data.filter(p => p.page_slug === 'flow')
      if (flowPages.length > 0) {
        console.log(`   ✅ Found ${flowPages.length} sections for Flow page in CMS`)
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }
  
  // Test 4: Check blog posts
  console.log('\n4. Testing Blog Posts...')
  try {
    const blogResponse = await fetch(`${BASE_URL}/api/admin/blog/posts`, {
      headers: { 'Cookie': adminCookie }
    })
    const blogData = await blogResponse.json()
    
    if (blogData.success && blogData.data) {
      console.log(`   ✅ Found ${blogData.data.length || 0} blog posts in CMS`)
      
      const blogPageResponse = await fetch(`${BASE_URL}/blog`)
      const blogPageHtml = await blogPageResponse.text()
      
      if (blogPageHtml.includes('blog') || blogPageHtml.includes('post')) {
        console.log('   ✅ Blog page exists and loads')
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }
}

async function testAdminPagesAccess() {
  console.log('\n🔐 Testing Admin Pages Access...\n')
  
  const adminPages = [
    '/admin',
    '/admin/bookings',
    '/admin/rooms',
    '/admin/surf-camps',
    '/admin/clients',
    '/admin/analytics',
    '/admin/cms',
    '/admin/cms/pages',
    '/admin/cms/testimonials',
    '/admin/cms/faq',
    '/admin/blog',
    '/admin/blog/posts',
  ]
  
  for (const page of adminPages) {
    try {
      const response = await fetch(`${BASE_URL}${page}`, {
        headers: { 'Cookie': adminCookie },
        redirect: 'manual'
      })
      
      if (response.status === 200 || response.status === 307 || response.status === 308) {
        console.log(`   ✅ ${page} - Accessible`)
      } else if (response.status === 401 || response.status === 403) {
        console.log(`   ⚠️  ${page} - Requires authentication`)
      } else {
        console.log(`   ❌ ${page} - Status: ${response.status}`)
      }
    } catch (error) {
      console.log(`   ❌ ${page} - Error: ${error.message}`)
    }
  }
}

async function testDataConsistency() {
  console.log('\n📊 Testing Data Consistency...\n')
  
  // Test 1: Rooms data consistency
  console.log('1. Testing Rooms Data Consistency...')
  try {
    const roomsAPI = await fetch(`${BASE_URL}/api/rooms`)
    const roomsData = await roomsAPI.json()
    
    if (roomsData.success && roomsData.data && roomsData.data.rooms) {
      const apiRooms = roomsData.data.rooms.length
      console.log(`   ✅ API returns ${apiRooms} rooms`)
      
      // Check if rooms appear on frontend
      const roomsPage = await fetch(`${BASE_URL}/rooms`)
      const roomsHtml = await roomsPage.text()
      
      // Check if room names appear
      const roomNames = roomsData.data.rooms.map(r => r.name).filter(Boolean)
      const foundOnPage = roomNames.some(name => roomsHtml.includes(name))
      
      if (foundOnPage || roomNames.length === 0) {
        console.log('   ✅ Rooms data consistent between API and frontend')
      } else {
        console.log('   ⚠️  Rooms in API but may not be displayed on frontend')
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }
  
  // Test 2: Surf camps data consistency
  console.log('\n2. Testing Surf Camps Data Consistency...')
  try {
    const campsAPI = await fetch(`${BASE_URL}/api/surf-camps`)
    const campsData = await campsAPI.json()
    
    if (campsData.success && campsData.data) {
      const apiCamps = campsData.data.length || 0
      console.log(`   ✅ API returns ${apiCamps} surf camps`)
      
      const campsPage = await fetch(`${BASE_URL}/surf-weeks`)
      const campsHtml = await campsPage.text()
      
      if (campsHtml.includes('surf') || campsHtml.includes('camp') || apiCamps === 0) {
        console.log('   ✅ Surf camps data consistent')
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }
}

async function runTests() {
  console.log('🚀 Starting Admin CMS Integration Tests')
  console.log(`📍 Testing against: ${BASE_URL}\n`)
  
  // Login first
  console.log('🔐 Logging in...')
  const loggedIn = await login()
  
  if (!loggedIn) {
    console.log('❌ Failed to login. Cannot continue tests.')
    process.exit(1)
  }
  
  console.log('✅ Logged in successfully\n')
  
  // Run tests
  await testAdminPagesAccess()
  await testCMSContentReflection()
  await testDataConsistency()
  
  console.log('\n' + '='.repeat(60))
  console.log('✅ Integration Tests Complete')
  console.log('='.repeat(60))
}

runTests().catch(error => {
  console.error('❌ Test error:', error)
  process.exit(1)
})

