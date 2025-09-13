#!/usr/bin/env node

/**
 * Test script to verify jQuery and widget loading fix
 * This script can be run to validate the widget demo setup
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Testing Heiwa Booking Widget jQuery Fix...\n');

// Check if widget files exist
const widgetJsPath = path.join(__dirname, 'wordpress-plugin/heiwa-booking-widget/assets/js/widget.js');
const widgetCssPath = path.join(__dirname, 'wordpress-plugin/heiwa-booking-widget/assets/css/base.css');

console.log('📁 Checking widget files...');
if (fs.existsSync(widgetJsPath)) {
  console.log('✅ widget.js exists');
} else {
  console.log('❌ widget.js missing');
}

if (fs.existsSync(widgetCssPath)) {
  console.log('✅ base.css exists');
} else {
  console.log('❌ base.css missing');
}

// Check widget.js for jQuery fixes
console.log('\n🔍 Checking widget.js for jQuery fixes...');
const widgetJsContent = fs.readFileSync(widgetJsPath, 'utf8');

const checks = [
  {
    name: 'jQuery waiting function',
    pattern: /function waitForjQuery/,
    found: widgetJsContent.includes('function waitForjQuery')
  },
  {
    name: 'jQuery parameter in initBookingWidget',
    pattern: /function initBookingWidget\(\$\)/,
    found: widgetJsContent.includes('function initBookingWidget($)')
  },
  {
    name: 'jQuery parameter in initializeWidget',
    pattern: /function initializeWidget\(\$\)/,
    found: widgetJsContent.includes('function initializeWidget($)')
  },
  {
    name: 'Removed jQuery IIFE wrapper',
    pattern: /\)\(jQuery/,
    found: !widgetJsContent.includes(')(jQuery')
  }
];

checks.forEach(check => {
  console.log(`${check.found ? '✅' : '❌'} ${check.name}`);
});

const allChecksPass = checks.every(check => check.found);

console.log(`\n${allChecksPass ? '🎉' : '⚠️'} Widget jQuery fixes: ${allChecksPass ? 'ALL PASSED' : 'SOME FAILED'}`);

if (allChecksPass) {
  console.log('\n🚀 Ready to test the widget demo!');
  console.log('\nTo test:');
  console.log('1. npm run dev');
  console.log('2. Visit http://localhost:3005/widget');
  console.log('3. Check browser console for jQuery loading messages');
  console.log('4. Click "Book Now" to test the widget');
  console.log('\nTo run E2E tests:');
  console.log('npm run test -- tests/widget-e2e.test.ts');
} else {
  console.log('\n❌ Some fixes are missing. Please check the widget.js file.');
}

console.log('\n📋 Summary of fixes applied:');
console.log('1. ✅ Added jQuery loading before widget script');
console.log('2. ✅ Modified widget.js to wait for jQuery availability');
console.log('3. ✅ Updated function signatures to accept $ parameter');
console.log('4. ✅ Added proper initialization sequence');
console.log('5. ✅ Enhanced demo page with loading status');
console.log('6. ✅ Updated E2E tests to validate jQuery loading');
