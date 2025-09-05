const http = require('http');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function testUserStories() {
  console.log('🔍 Verifying Heiwa House Admin Dashboard User Stories...\n');

  const baseUrl = 'http://localhost:3000';
  const results = [];

  // Test 1: Admin Dashboard Page
  try {
    console.log('1. Testing Admin Dashboard...');
    const response = await makeRequest(`${baseUrl}/admin`);
    const hasTitle = response.data.includes('Heiwa House Admin Dashboard');
    const hasNavigation = response.data.includes('Dashboard') && response.data.includes('Clients');
    const hasCards = response.data.includes('Total Clients') || response.data.includes('Total Bookings');

    results.push({
      story: 'Admin Dashboard',
      status: hasTitle && hasNavigation ? '✅ PASS' : '❌ FAIL',
      details: `Title: ${hasTitle}, Navigation: ${hasNavigation}, Cards: ${hasCards}`
    });
  } catch (error) {
    results.push({
      story: 'Admin Dashboard',
      status: '❌ FAIL',
      details: `Error: ${error.message}`
    });
  }

  // Test 2: Analytics Dashboard
  try {
    console.log('2. Testing Analytics Dashboard...');
    const response = await makeRequest(`${baseUrl}/admin/analytics`);
    const hasTitle = response.data.includes('Analytics Dashboard');
    const hasCharts = response.data.includes('Revenue') || response.data.includes('Occupancy');

    results.push({
      story: 'Analytics Dashboard',
      status: hasTitle ? '✅ PASS' : '❌ FAIL',
      details: `Title: ${hasTitle}, Charts: ${hasCharts}`
    });
  } catch (error) {
    results.push({
      story: 'Analytics Dashboard',
      status: '❌ FAIL',
      details: `Error: ${error.message}`
    });
  }

  // Test 3: GDPR Compliance
  try {
    console.log('3. Testing GDPR Compliance...');
    const response = await makeRequest(`${baseUrl}/admin/compliance`);
    const hasTitle = response.data.includes('GDPR') || response.data.includes('Compliance');
    const hasTabs = response.data.includes('Audit Trail') || response.data.includes('Data Export');

    results.push({
      story: 'GDPR Compliance',
      status: hasTitle ? '✅ PASS' : '❌ FAIL',
      details: `Title: ${hasTitle}, Tabs: ${hasTabs}`
    });
  } catch (error) {
    results.push({
      story: 'GDPR Compliance',
      status: '❌ FAIL',
      details: `Error: ${error.message}`
    });
  }

  // Test 4: System Administration
  try {
    console.log('4. Testing System Administration...');
    const response = await makeRequest(`${baseUrl}/admin/system`);
    const hasTitle = response.data.includes('System') || response.data.includes('Administration');
    const hasMetrics = response.data.includes('Health') || response.data.includes('Backup');

    results.push({
      story: 'System Administration',
      status: hasTitle ? '✅ PASS' : '❌ FAIL',
      details: `Title: ${hasTitle}, Metrics: ${hasMetrics}`
    });
  } catch (error) {
    results.push({
      story: 'System Administration',
      status: '❌ FAIL',
      details: `Error: ${error.message}`
    });
  }

  // Test 5: Client Portal
  try {
    console.log('5. Testing Client Portal...');
    const response = await makeRequest(`${baseUrl}/client/auth`);
    const hasTitle = response.data.includes('Welcome') || response.data.includes('Heiwa House');
    const hasForms = response.data.includes('Login') || response.data.includes('Register');

    results.push({
      story: 'Client Portal',
      status: hasTitle ? '✅ PASS' : '❌ FAIL',
      details: `Title: ${hasTitle}, Forms: ${hasForms}`
    });
  } catch (error) {
    results.push({
      story: 'Client Portal',
      status: '❌ FAIL',
      details: `Error: ${error.message}`
    });
  }

  // Test 6: Admin Login Page
  try {
    console.log('6. Testing Admin Login...');
    const response = await makeRequest(`${baseUrl}/admin/login`);
    const hasTitle = response.data.includes('Sign In') || response.data.includes('Login');
    const hasForm = response.data.includes('email') && response.data.includes('password');

    results.push({
      story: 'Admin Login',
      status: hasTitle && hasForm ? '✅ PASS' : '❌ FAIL',
      details: `Title: ${hasTitle}, Form: ${hasForm}`
    });
  } catch (error) {
    results.push({
      story: 'Admin Login',
      status: '❌ FAIL',
      details: `Error: ${error.message}`
    });
  }

  // Test 7: Clients Page
  try {
    console.log('7. Testing Clients Management...');
    const response = await makeRequest(`${baseUrl}/admin/clients`);
    const hasTitle = response.data.includes('Clients') || response.data.includes('Customers');
    const hasTable = response.data.includes('table') || response.data.includes('Name');

    results.push({
      story: 'Clients Management',
      status: hasTitle ? '✅ PASS' : '❌ FAIL',
      details: `Title: ${hasTitle}, Table: ${hasTable}`
    });
  } catch (error) {
    results.push({
      story: 'Clients Management',
      status: '❌ FAIL',
      details: `Error: ${error.message}`
    });
  }

  // Test 8: Bookings Page
  try {
    console.log('8. Testing Bookings Management...');
    const response = await makeRequest(`${baseUrl}/admin/bookings`);
    const hasTitle = response.data.includes('Bookings') || response.data.includes('Reservations');
    const hasFilters = response.data.includes('filter') || response.data.includes('search');

    results.push({
      story: 'Bookings Management',
      status: hasTitle ? '✅ PASS' : '❌ FAIL',
      details: `Title: ${hasTitle}, Filters: ${hasFilters}`
    });
  } catch (error) {
    results.push({
      story: 'Bookings Management',
      status: '❌ FAIL',
      details: `Error: ${error.message}`
    });
  }

  // Summary
  console.log('\n📊 User Story Verification Results:\n');
  results.forEach(result => {
    console.log(`${result.status} ${result.story}`);
    console.log(`   ${result.details}\n`);
  });

  const passed = results.filter(r => r.status.includes('PASS')).length;
  const total = results.length;
  const successRate = ((passed / total) * 100).toFixed(1);

  console.log(`📈 Overall Success Rate: ${passed}/${total} (${successRate}%)`);

  if (passed >= total * 0.8) {
    console.log('🎉 Excellent! Most user stories are working correctly.');
  } else if (passed >= total * 0.6) {
    console.log('👍 Good! Most core functionality is working.');
  } else {
    console.log('⚠️  Some issues detected. Core functionality may need attention.');
  }

  return results;
}

// Run the tests
testUserStories().catch(console.error);
