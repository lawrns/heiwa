#!/usr/bin/env node

/**
 * Comprehensive System Functionality Test
 * Tests all critical components after fixes deployment
 */

const https = require('https');
const { execSync } = require('child_process');

const BASE_URL = 'https://heiwa-house-portugal.netlify.app';

// Test configuration
const TESTS = {
  api: {
    homepage: '/api/admin/homepage',
    roomBookings: '/api/widget/room-bookings',
    bookings: '/api/bookings',
    rooms: '/api/rooms'
  },
  pages: {
    home: '/',
    rooms: '/rooms',
    admin: '/admin'
  }
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(`${BASE_URL}${url}`, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// Test API endpoints
async function testAPIEndpoints() {
  console.log('🔍 Testing API Endpoints...\n');
  
  const results = {};
  
  // Test Homepage API
  try {
    console.log('📋 Testing /api/admin/homepage...');
    const response = await makeRequest(TESTS.api.homepage);
    const data = JSON.parse(response.data);
    
    results.homepage = {
      status: response.statusCode,
      success: data.success,
      dataCount: data.data ? data.data.length : 0,
      error: data.error || null
    };
    
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Success: ${data.success}`);
    console.log(`   Sections: ${data.data ? data.data.length : 0}`);
    if (data.error) console.log(`   Error: ${data.error}`);
    
  } catch (error) {
    results.homepage = {
      status: 'ERROR',
      success: false,
      error: error.message
    };
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  console.log('');
  
  // Test Room Bookings API
  try {
    console.log('📋 Testing /api/widget/room-bookings...');
    const response = await makeRequest(TESTS.api.roomBookings);
    const data = JSON.parse(response.data);
    
    results.roomBookings = {
      status: response.statusCode,
      success: data.success,
      message: data.message || null,
      error: data.error || null
    };
    
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Success: ${data.success}`);
    console.log(`   Message: ${data.message || 'No message'}`);
    if (data.error) console.log(`   Error: ${data.error}`);
    
  } catch (error) {
    results.roomBookings = {
      status: 'ERROR',
      success: false,
      error: error.message
    };
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  console.log('');
  
  // Test Bookings API (GET)
  try {
    console.log('📋 Testing /api/bookings (GET)...');
    const response = await makeRequest(TESTS.api.bookings);
    const data = JSON.parse(response.data);
    
    results.bookings = {
      status: response.statusCode,
      success: data.success,
      dataCount: data.data ? data.data.length : 0,
      error: data.error || null
    };
    
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Success: ${data.success}`);
    console.log(`   Bookings: ${data.data ? data.data.length : 0}`);
    if (data.error) console.log(`   Error: ${data.error}`);
    
  } catch (error) {
    results.bookings = {
      status: 'ERROR',
      success: false,
      error: error.message
    };
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  console.log('');
  
  // Test Bookings API (POST) - Create test booking
  try {
    console.log('📋 Testing /api/bookings (POST)...');
    const testBooking = {
      booking_type: "room",
      room_id: "ac98fd46-5bd2-413c-98f3-17e71024e734",
      start_date: "2025-11-14",
      end_date: "2025-11-16",
      clientName: "Test Booking User",
      email: "test@heiwa.house",
      phone: "+351 912 345 678",
      participants: [{
        name: "Test Booking User",
        email: "test@heiwa.house",
        phone: "+351 912 345 678"
      }],
      guests: 1,
      message: "System functionality test"
    };
    
    const response = await makeRequest(TESTS.api.bookings, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testBooking)
    });
    
    const data = JSON.parse(response.data);
    
    results.createBooking = {
      status: response.statusCode,
      success: data.success,
      bookingId: data.data?.booking?.id || null,
      error: data.error || null
    };
    
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Success: ${data.success}`);
    console.log(`   Booking ID: ${data.data?.booking?.id || 'None'}`);
    if (data.error) console.log(`   Error: ${data.error}`);
    
  } catch (error) {
    results.createBooking = {
      status: 'ERROR',
      success: false,
      error: error.message
    };
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  console.log('');
  
  return results;
}

// Test page loads
async function testPages() {
  console.log('🔍 Testing Page Loads...\n');
  
  const results = {};
  
  for (const [name, path] of Object.entries(TESTS.pages)) {
    try {
      console.log(`📄 Testing ${path}...`);
      const response = await makeRequest(path);
      
      results[name] = {
        status: response.statusCode,
        contentLength: response.data.length,
        contentType: response.headers['content-type']
      };
      
      console.log(`   Status: ${response.statusCode}`);
      console.log(`   Content-Type: ${response.headers['content-type']}`);
      console.log(`   Size: ${response.data.length} bytes`);
      
    } catch (error) {
      results[name] = {
        status: 'ERROR',
        error: error.message
      };
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  return results;
}

// Test specific image URLs
async function testImages() {
  console.log('🔍 Testing Critical Images...\n');
  
  const images = [
    '/optimized/photography_010_dsc03491.webp',
    '/images/hh1.webp',
    '/images/hh2.webp',
    '/images/heiwalogo.webp'
  ];
  
  const results = {};
  
  for (const imagePath of images) {
    try {
      console.log(`🖼️ Testing ${imagePath}...`);
      const response = await makeRequest(imagePath);
      
      results[imagePath] = {
        status: response.statusCode,
        contentLength: response.data.length,
        contentType: response.headers['content-type']
      };
      
      console.log(`   Status: ${response.statusCode}`);
      console.log(`   Content-Type: ${response.headers['content-type']}`);
      console.log(`   Size: ${response.data.length} bytes`);
      
    } catch (error) {
      results[imagePath] = {
        status: 'ERROR',
        error: error.message
      };
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  return results;
}

// Main test runner
async function runFullTest() {
  console.log('🚀 Heiwa House - Full System Functionality Test');
  console.log('==================================================\n');
  
  const startTime = Date.now();
  
  // Run all tests
  const apiResults = await testAPIEndpoints();
  const pageResults = await testPages();
  const imageResults = await testImages();
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // Generate summary report
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('========================\n');
  
  // API Results
  console.log('🔌 API Endpoints:');
  for (const [test, result] of Object.entries(apiResults)) {
    const status = result.success ? '✅' : (result.status === 'ERROR' ? '❌' : '⚠️');
    console.log(`   ${status} ${test}: ${result.status} ${result.error || ''}`);
  }
  
  console.log('');
  
  // Page Results
  console.log('📄 Page Loads:');
  for (const [test, result] of Object.entries(pageResults)) {
    const status = result.status === 200 ? '✅' : (result.status === 'ERROR' ? '❌' : '⚠️');
    console.log(`   ${status} ${test}: ${result.status} ${result.error || ''}`);
  }
  
  console.log('');
  
  // Image Results
  console.log('🖼️ Images:');
  for (const [test, result] of Object.entries(imageResults)) {
    const status = result.status === 200 ? '✅' : (result.status === 'ERROR' ? '❌' : '⚠️');
    console.log(`   ${status} ${test}: ${result.status} ${result.error || ''}`);
  }
  
  console.log('');
  
  // Overall assessment
  const totalTests = Object.keys(apiResults).length + Object.keys(pageResults).length + Object.keys(imageResults).length;
  const passedTests = Object.values({...apiResults, ...pageResults, ...imageResults}).filter(r => 
    (r.success !== false && r.status !== 'ERROR') && (r.status === 200 || r.success === true)
  ).length;
  
  console.log('🎯 OVERALL ASSESSMENT');
  console.log('=====================');
  console.log(`Tests Run: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  console.log(`Duration: ${duration}ms`);
  
  const healthStatus = passedTests === totalTests ? '🟢 HEALTHY' : 
                      passedTests > totalTests * 0.8 ? '🟡 DEGRADED' : '🔴 CRITICAL';
  
  console.log(`System Health: ${healthStatus}`);
  
  // Critical issues
  const criticalIssues = [];
  
  if (!apiResults.homepage?.success) {
    criticalIssues.push('Homepage API failing');
  }
  
  if (!apiResults.createBooking?.success) {
    criticalIssues.push('Booking creation failing');
  }
  
  if (Object.values(imageResults).some(r => r.status === 'ERROR')) {
    criticalIssues.push('Missing image assets');
  }
  
  if (criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES:');
    criticalIssues.forEach(issue => console.log(`   - ${issue}`));
  }
  
  console.log('\n✅ Test completed!');
  
  return {
    api: apiResults,
    pages: pageResults,
    images: imageResults,
    summary: {
      total: totalTests,
      passed: passedTests,
      successRate: Math.round((passedTests / totalTests) * 100),
      health: healthStatus,
      criticalIssues
    }
  };
}

// Run tests if this script is executed directly
if (require.main === module) {
  runFullTest().catch(console.error);
}

module.exports = { runFullTest };
