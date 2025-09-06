const { execSync } = require('child_process');

console.log('🚀 Starting Playwright Test Suite...\n');

const testFiles = [
  'tests/client-portal.spec.ts',
  'tests/analytics.spec.ts', 
  'tests/compliance.spec.ts',
  'tests/booking-management.spec.ts'
];

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

for (const testFile of testFiles) {
  console.log(`\n📋 Running ${testFile}...`);
  
  try {
    const result = execSync(`npx playwright test ${testFile} --project=chromium --reporter=line`, {
      encoding: 'utf8',
      timeout: 60000
    });
    
    console.log(result);
    
    // Parse results (basic parsing)
    const lines = result.split('\n');
    const summaryLine = lines.find(line => line.includes('passed') || line.includes('failed'));
    
    if (summaryLine) {
      const passedMatch = summaryLine.match(/(\d+) passed/);
      const failedMatch = summaryLine.match(/(\d+) failed/);
      
      if (passedMatch) {
        const passed = parseInt(passedMatch[1]);
        passedTests += passed;
        totalTests += passed;
        console.log(`✅ ${passed} tests passed`);
      }
      
      if (failedMatch) {
        const failed = parseInt(failedMatch[1]);
        failedTests += failed;
        totalTests += failed;
        console.log(`❌ ${failed} tests failed`);
      }
    }
    
  } catch (error) {
    console.error(`❌ Error running ${testFile}:`, error.message);
    failedTests++;
    totalTests++;
  }
}

console.log('\n' + '='.repeat(50));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(50));
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests} ✅`);
console.log(`Failed: ${failedTests} ❌`);
console.log(`Success Rate: ${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0}%`);

if (failedTests === 0) {
  console.log('\n🎉 All tests passed! Great job!');
} else {
  console.log('\n⚠️  Some tests failed. Check the output above for details.');
}
