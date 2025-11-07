// Simple test script to verify activities API endpoints
// Run with: node test-activities-api.js

const baseUrl = 'http://localhost:3000';

async function testEndpoint(path, description) {
  try {
    console.log(`\n🧪 Testing: ${description}`);
    console.log(`📍 Endpoint: ${path}`);
    
    const response = await fetch(`${baseUrl}${path}`);
    const result = await response.json();
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Success: ${result.success}`);
    
    if (result.data) {
      console.log(`📦 Data count: ${Array.isArray(result.data) ? result.data.length : 'N/A'}`);
      if (Array.isArray(result.data) && result.data.length > 0) {
        console.log(`📝 Sample item:`, JSON.stringify(result.data[0], null, 2));
      }
    }
    
    return { success: true, data: result };
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting Activities API Tests...\n');
  
  const tests = [
    ['/api/activities', 'Get all activities'],
    ['/api/activities?category=play', 'Get play activities'],
    ['/api/activities?category=flow', 'Get flow activities'],
    ['/api/activities?category=surf', 'Get surf activities'],
    ['/api/activities?tier=always', 'Get always available activities'],
    ['/api/activities?tier=on-request', 'Get on-request activities'],
    ['/api/activity-categories', 'Get activity categories'],
  ];
  
  const results = [];
  
  for (const [path, description] of tests) {
    const result = await testEndpoint(path, description);
    results.push({ path, description, ...result });
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📋 Test Summary:');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${results.length}`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.description}: ${r.error}`);
    });
  }
  
  console.log('\n🎉 Testing complete!');
}

// Only run if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testEndpoint, runTests };
