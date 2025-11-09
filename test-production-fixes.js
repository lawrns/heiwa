#!/usr/bin/env node

// Test script to verify all production fixes are working
const https = require('https');

const BASE_URL = 'https://heiwa-fr.netlify.app';

async function testEndpoint(path, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'heiwa-fr.netlify.app',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Heiwa-Production-Test/1.0'
      }
    };

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            success: parsed.success || false,
            data: parsed,
            error: null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            success: false,
            data: data,
            error: 'JSON Parse Error'
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        status: 500,
        success: false,
        data: null,
        error: error.message
      });
    });

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Heiwa Front Production Fix Verification');
  console.log('='.repeat(50));

  const tests = [
    {
      name: 'Homepage API',
      path: '/api/admin/homepage',
      expected: 200
    },
    {
      name: 'Room Bookings API (GET)',
      path: '/api/widget/room-bookings',
      expected: 200
    },
    {
      name: 'Room Bookings API (POST)',
      path: '/api/widget/room-bookings',
      method: 'POST',
      body: JSON.stringify({
        room_id: "ac98fd46-5bd2-413c-98f3-17e71024e734",
        start_date: "2025-11-14",
        end_date: "2025-11-16",
        participants: [{
          name: "Production Test",
          email: "test@heiwa.house",
          phone: "+351 912 345 678"
        }],
        guests: 1,
        pricing: {
          basePrice: 100,
          total: 200
        }
      }),
      expected: 200
    },
    {
      name: 'Bookings API (GET)',
      path: '/api/bookings',
      expected: 200
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    console.log(`\n📋 Testing ${test.name}...`);
    
    const result = await testEndpoint(
      test.path, 
      test.method || 'GET', 
      test.body || null
    );

    if (result.status === test.expected && result.success) {
      console.log(`   ✅ PASS - Status: ${result.status}, Success: ${result.success}`);
      if (test.name.includes('POST') && result.data.data?.booking?.id) {
        console.log(`   🎫 Booking Created: ${result.data.data.booking.booking_number}`);
      }
      passed++;
    } else {
      console.log(`   ❌ FAIL - Status: ${result.status}, Expected: ${test.expected}`);
      if (result.error) {
        console.log(`   🚨 Error: ${result.error}`);
      }
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    console.log('\n🎉 ALL PRODUCTION FIXES VERIFIED SUCCESSFULLY!');
    console.log('🌐 Site is fully operational at: https://heiwa-fr.netlify.app');
  } else {
    console.log('\n⚠️ Some issues remain - check the failed tests above');
  }
}

runTests().catch(console.error);
