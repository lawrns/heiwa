/**
 * Test script to verify WordPress booking widget API endpoints
 * Run with: node test-api-endpoints.js
 */

const API_BASE = 'http://localhost:3005';
const API_KEY = 'heiwa_wp_test_key_2024_secure_deployment';

async function testEndpoint(endpoint, method = 'GET', data = null) {
  const url = `${API_BASE}${endpoint}`;
  console.log(`\n🧪 Testing ${method} ${endpoint}`);
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Heiwa-API-Key': API_KEY,
      'X-WP-Nonce': 'test_nonce_12345'
    }
  };
  
  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    const responseData = await response.text();
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);
    
    try {
      const jsonData = JSON.parse(responseData);
      console.log(`   Response: ${JSON.stringify(jsonData, null, 2)}`);
    } catch {
      console.log(`   Response (text): ${responseData.substring(0, 200)}${responseData.length > 200 ? '...' : ''}`);
    }
    
    return { success: response.ok, status: response.status, data: responseData };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Testing WordPress Booking Widget API Endpoints');
  console.log('=' .repeat(60));
  
  // Test 1: Surf camps endpoint
  await testEndpoint('/wp-json/heiwa/v1/surf-camps');
  
  // Test 2: Room availability endpoint
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  await testEndpoint(`/wp-json/heiwa/v1/rooms/availability?start_date=${today}&end_date=${tomorrow}&participants=2`);
  
  // Test 3: Booking creation endpoint with real surf camp ID
  const testBookingData = {
    booking_type: 'surf_camp',
    camp_id: 'bb8c0720-aa3b-4a3a-b424-02d875b4aac8', // Real camp ID from surf-camps response
    start_date: today,
    end_date: tomorrow,
    participants: [
      {
        name: 'Test User',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User'
      }
    ],
    special_requests: 'Test booking from API verification',
    total_price: 599,
    source_url: 'http://localhost:3005/widget-admin',
    widget_version: '1.0'
  };
  
  await testEndpoint('/wp-json/heiwa/v1/bookings', 'POST', testBookingData);
  
  // Test 4: Direct WordPress API endpoints
  console.log('\n📡 Testing Direct WordPress API Endpoints');
  console.log('-' .repeat(40));
  
  await testEndpoint('/api/wordpress/bookings', 'POST', testBookingData);
  
  console.log('\n✅ API endpoint testing complete!');
}

// Run the tests
runTests().catch(console.error);
