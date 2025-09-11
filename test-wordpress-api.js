#!/usr/bin/env node

/**
 * WordPress API Integration Test Script
 * Tests all WordPress API endpoints to ensure they work correctly
 */

const https = require('https');
const http = require('http');

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const API_KEY = process.env.WORDPRESS_API_KEY || 'test-api-key-123';

// Test data
const testBookingData = {
  camp_id: 'test-camp-id',
  participants: [
    {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      surf_level: 'beginner'
    }
  ],
  special_requests: 'Test booking from WordPress API test',
  source_url: 'https://test-wordpress-site.com/booking',
  utm_source: 'test',
  utm_campaign: 'api_test'
};

/**
 * Make HTTP request
 */
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'https:' ? https : http;
    
    const req = protocol.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Test WordPress API endpoints
 */
async function testWordPressAPI() {
  console.log('🧪 Testing WordPress API Integration...\n');
  
  const baseUrl = new URL(API_BASE_URL);
  const commonHeaders = {
    'Content-Type': 'application/json',
    'X-Heiwa-API-Key': API_KEY,
    'User-Agent': 'HeiwaWordPressTest/1.0'
  };

  let allTestsPassed = true;

  // Test 1: Connection Test
  console.log('1️⃣ Testing API Connection...');
  try {
    const response = await makeRequest({
      hostname: baseUrl.hostname,
      port: baseUrl.port || (baseUrl.protocol === 'https:' ? 443 : 80),
      path: '/api/wordpress/test',
      method: 'GET',
      headers: commonHeaders,
      protocol: baseUrl.protocol
    });

    if (response.statusCode === 200 && response.body.success) {
      console.log('✅ Connection test passed');
      console.log(`   Backend: ${response.body.backend_info?.name}`);
      console.log(`   Version: ${response.body.backend_info?.version}`);
    } else {
      console.log('❌ Connection test failed');
      console.log(`   Status: ${response.statusCode}`);
      console.log(`   Response: ${JSON.stringify(response.body, null, 2)}`);
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ Connection test error:', error.message);
    allTestsPassed = false;
  }

  console.log('');

  // Test 2: Get Surf Camps
  console.log('2️⃣ Testing Surf Camps Endpoint...');
  try {
    const response = await makeRequest({
      hostname: baseUrl.hostname,
      port: baseUrl.port || (baseUrl.protocol === 'https:' ? 443 : 80),
      path: '/api/wordpress/surf-camps',
      method: 'GET',
      headers: commonHeaders,
      protocol: baseUrl.protocol
    });

    if (response.statusCode === 200 && response.body.success) {
      console.log('✅ Surf camps endpoint passed');
      console.log(`   Found ${response.body.camps?.length || 0} surf camps`);
    } else {
      console.log('❌ Surf camps endpoint failed');
      console.log(`   Status: ${response.statusCode}`);
      console.log(`   Response: ${JSON.stringify(response.body, null, 2)}`);
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ Surf camps endpoint error:', error.message);
    allTestsPassed = false;
  }

  console.log('');

  // Test 3: Check Availability
  console.log('3️⃣ Testing Availability Endpoint...');
  try {
    const queryParams = new URLSearchParams({
      camp_id: 'test-camp-id',
      start_date: '2024-07-01',
      end_date: '2024-07-07',
      participants: '2'
    });

    const response = await makeRequest({
      hostname: baseUrl.hostname,
      port: baseUrl.port || (baseUrl.protocol === 'https:' ? 443 : 80),
      path: `/api/wordpress/availability?${queryParams}`,
      method: 'GET',
      headers: commonHeaders,
      protocol: baseUrl.protocol
    });

    if (response.statusCode === 200) {
      console.log('✅ Availability endpoint passed');
      console.log(`   Available: ${response.body.available ? 'Yes' : 'No'}`);
    } else {
      console.log('❌ Availability endpoint failed');
      console.log(`   Status: ${response.statusCode}`);
      console.log(`   Response: ${JSON.stringify(response.body, null, 2)}`);
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ Availability endpoint error:', error.message);
    allTestsPassed = false;
  }

  console.log('');

  // Test 4: Create Booking (Note: This will create a test booking)
  console.log('4️⃣ Testing Booking Creation Endpoint...');
  try {
    const response = await makeRequest({
      hostname: baseUrl.hostname,
      port: baseUrl.port || (baseUrl.protocol === 'https:' ? 443 : 80),
      path: '/api/wordpress/bookings',
      method: 'POST',
      headers: commonHeaders,
      protocol: baseUrl.protocol
    }, testBookingData);

    if (response.statusCode === 201 && response.body.success) {
      console.log('✅ Booking creation endpoint passed');
      console.log(`   Booking ID: ${response.body.booking?.id}`);
      console.log(`   Total Amount: $${response.body.booking?.total_amount}`);
    } else {
      console.log('❌ Booking creation endpoint failed');
      console.log(`   Status: ${response.statusCode}`);
      console.log(`   Response: ${JSON.stringify(response.body, null, 2)}`);
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ Booking creation endpoint error:', error.message);
    allTestsPassed = false;
  }

  console.log('');

  // Summary
  console.log('📊 Test Summary:');
  if (allTestsPassed) {
    console.log('🎉 All WordPress API tests passed! Integration is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.');
  }

  return allTestsPassed;
}

// Run tests if this script is executed directly
if (require.main === module) {
  testWordPressAPI()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Test runner error:', error);
      process.exit(1);
    });
}

module.exports = { testWordPressAPI };
