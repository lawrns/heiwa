/**
 * Site Speed Measurement Script
 * Measures performance across all major pages
 */

const fetch = require('node-fetch')
const { performance } = require('perf_hooks')

const BASE_URL = process.env.BASE_URL || 'https://heiwahauz.netlify.app'

const pages = [
  { name: 'Homepage', url: '/' },
  { name: 'Rooms', url: '/rooms' },
  { name: 'Surf Weeks', url: '/surf-weeks' },
  { name: 'Flow', url: '/flow' },
  { name: 'Play', url: '/play' },
  { name: 'Surf', url: '/surf' },
  { name: 'The Spot', url: '/the-spot' },
  { name: 'Blog', url: '/blog' },
]

const apiEndpoints = [
  { name: 'Bookings API', url: '/api/bookings' },
  { name: 'Rooms API', url: '/api/rooms' },
  { name: 'Surf Camps API', url: '/api/surf-camps' },
  { name: 'Homepage API', url: '/api/admin/homepage' },
  { name: 'Testimonials API', url: '/api/admin/testimonials' },
  { name: 'FAQ API', url: '/api/admin/faq' },
]

async function measurePageSpeed(url, name) {
  const startTime = performance.now()
  
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    })
    
    const endTime = performance.now()
    const responseTime = endTime - startTime
    
    const html = await response.text()
    const htmlSize = Buffer.byteLength(html, 'utf8')
    
    // Count resources (images, scripts, stylesheets)
    const imageCount = (html.match(/<img[^>]+>/gi) || []).length
    const scriptCount = (html.match(/<script[^>]+>/gi) || []).length
    const linkCount = (html.match(/<link[^>]+>/gi) || []).length
    
    // Check for common performance indicators
    const hasLazyLoading = html.includes('loading="lazy"')
    const hasNextImage = html.includes('next/image')
    const hasPreload = html.includes('rel="preload"')
    const hasPrefetch = html.includes('rel="prefetch"')
    
    return {
      name,
      url,
      status: response.status,
      responseTime: Math.round(responseTime),
      htmlSize: Math.round(htmlSize / 1024), // KB
      imageCount,
      scriptCount,
      linkCount,
      hasLazyLoading,
      hasNextImage,
      hasPreload,
      hasPrefetch,
      performance: responseTime < 1000 ? 'excellent' : responseTime < 2000 ? 'good' : responseTime < 3000 ? 'fair' : 'poor'
    }
  } catch (error) {
    return {
      name,
      url,
      error: error.message,
      performance: 'error'
    }
  }
}

async function measureAPISpeed(url, name) {
  const startTime = performance.now()
  
  try {
    const response = await fetch(`${BASE_URL}${url}`)
    const endTime = performance.now()
    const responseTime = endTime - startTime
    
    const data = await response.json()
    const jsonSize = Buffer.byteLength(JSON.stringify(data), 'utf8')
    
    return {
      name,
      url,
      status: response.status,
      responseTime: Math.round(responseTime),
      jsonSize: Math.round(jsonSize / 1024), // KB
      performance: responseTime < 500 ? 'excellent' : responseTime < 1000 ? 'good' : responseTime < 2000 ? 'fair' : 'poor'
    }
  } catch (error) {
    return {
      name,
      url,
      error: error.message,
      performance: 'error'
    }
  }
}

async function runSpeedTests() {
  console.log('🚀 Starting Site Speed Measurement')
  console.log(`📍 Testing: ${BASE_URL}\n`)
  
  const results = {
    pages: [],
    apis: [],
    summary: {
      totalPages: 0,
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0,
      errors: 0,
      avgResponseTime: 0,
      totalAPIs: 0,
      avgAPITime: 0
    }
  }
  
  // Measure pages
  console.log('📄 Measuring Page Load Times...\n')
  for (const page of pages) {
    process.stdout.write(`   Testing ${page.name}... `)
    const result = await measurePageSpeed(page.url, page.name)
    results.pages.push(result)
    
    if (result.error) {
      console.log(`❌ Error: ${result.error}`)
      results.summary.errors++
    } else {
      const perfEmoji = result.performance === 'excellent' ? '✅' : result.performance === 'good' ? '⚡' : result.performance === 'fair' ? '⚠️' : '❌'
      console.log(`${perfEmoji} ${result.responseTime}ms (${result.performance})`)
      results.summary[result.performance]++
    }
    results.summary.totalPages++
  }
  
  // Measure APIs
  console.log('\n🔌 Measuring API Response Times...\n')
  for (const api of apiEndpoints) {
    process.stdout.write(`   Testing ${api.name}... `)
    const result = await measureAPISpeed(api.url, api.name)
    results.apis.push(result)
    
    if (result.error) {
      console.log(`❌ Error: ${result.error}`)
    } else {
      const perfEmoji = result.performance === 'excellent' ? '✅' : result.performance === 'good' ? '⚡' : result.performance === 'fair' ? '⚠️' : '❌'
      console.log(`${perfEmoji} ${result.responseTime}ms (${result.performance})`)
    }
    results.summary.totalAPIs++
  }
  
  // Calculate averages
  const pageTimes = results.pages.filter(p => p.responseTime).map(p => p.responseTime)
  const apiTimes = results.apis.filter(a => a.responseTime).map(a => a.responseTime)
  
  results.summary.avgResponseTime = pageTimes.length > 0 
    ? Math.round(pageTimes.reduce((a, b) => a + b, 0) / pageTimes.length)
    : 0
  results.summary.avgAPITime = apiTimes.length > 0
    ? Math.round(apiTimes.reduce((a, b) => a + b, 0) / apiTimes.length)
    : 0
  
  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 PERFORMANCE SUMMARY')
  console.log('='.repeat(60))
  console.log(`\nPages:`)
  console.log(`   Total: ${results.summary.totalPages}`)
  console.log(`   ✅ Excellent (<1s): ${results.summary.excellent}`)
  console.log(`   ⚡ Good (1-2s): ${results.summary.good}`)
  console.log(`   ⚠️  Fair (2-3s): ${results.summary.fair}`)
  console.log(`   ❌ Poor (>3s): ${results.summary.poor}`)
  console.log(`   Average Response Time: ${results.summary.avgResponseTime}ms`)
  console.log(`\nAPIs:`)
  console.log(`   Total: ${results.summary.totalAPIs}`)
  console.log(`   Average Response Time: ${results.summary.avgAPITime}ms`)
  
  // Detailed results
  console.log('\n' + '='.repeat(60))
  console.log('📄 PAGE DETAILS')
  console.log('='.repeat(60))
  results.pages.forEach(page => {
    if (!page.error) {
      console.log(`\n${page.name} (${page.url}):`)
      console.log(`   Response Time: ${page.responseTime}ms (${page.performance})`)
      console.log(`   HTML Size: ${page.htmlSize}KB`)
      console.log(`   Images: ${page.imageCount}`)
      console.log(`   Scripts: ${page.scriptCount}`)
      console.log(`   Stylesheets: ${page.linkCount}`)
      console.log(`   Lazy Loading: ${page.hasLazyLoading ? '✅' : '❌'}`)
      console.log(`   Next Image: ${page.hasNextImage ? '✅' : '❌'}`)
      console.log(`   Preload: ${page.hasPreload ? '✅' : '❌'}`)
      console.log(`   Prefetch: ${page.hasPrefetch ? '✅' : '❌'}`)
    }
  })
  
  console.log('\n' + '='.repeat(60))
  console.log('🔌 API DETAILS')
  console.log('='.repeat(60))
  results.apis.forEach(api => {
    if (!api.error) {
      console.log(`\n${api.name} (${api.url}):`)
      console.log(`   Response Time: ${api.responseTime}ms (${api.performance})`)
      console.log(`   JSON Size: ${api.jsonSize}KB`)
    }
  })
  
  return results
}

// Run tests
runSpeedTests()
  .then(results => {
    // Save results to file
    const fs = require('fs')
    fs.writeFileSync(
      'site-speed-results.json',
      JSON.stringify(results, null, 2)
    )
    console.log('\n✅ Results saved to site-speed-results.json')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })



