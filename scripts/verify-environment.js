#!/usr/bin/env node
/**
 * Environment Variables Verification Script
 * Checks that all required environment variables are set
 */

const requiredVars = {
  production: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ],
  optional: [
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'GOOGLE_PLACES_API_KEY',
    'RESEND_API_KEY',
    'NEXT_PUBLIC_API_URL',
  ],
};

function checkEnvVars() {
  console.log('\n🔍 Environment Variables Check\n');
  console.log('='.repeat(60));
  
  const missing = [];
  const present = [];
  const optionalMissing = [];
  
  // Check required variables
  console.log('\n📋 Required Variables:');
  requiredVars.production.forEach(varName => {
    const value = process.env[varName];
    if (!value || value === 'YOUR_KEY_HERE' || value.includes('placeholder')) {
      missing.push(varName);
      console.log(`  ❌ ${varName} - MISSING or INVALID`);
    } else {
      present.push(varName);
      const masked = value.length > 20 ? `${value.substring(0, 10)}...${value.substring(value.length - 4)}` : '***';
      console.log(`  ✅ ${varName} - Set (${masked})`);
    }
  });
  
  // Check optional variables
  console.log('\n📋 Optional Variables:');
  requiredVars.optional.forEach(varName => {
    const value = process.env[varName];
    if (!value || value === 'YOUR_KEY_HERE' || value.includes('placeholder')) {
      optionalMissing.push(varName);
      console.log(`  ⚠️  ${varName} - Not set (optional)`);
    } else {
      const masked = value.length > 20 ? `${value.substring(0, 10)}...${value.substring(value.length - 4)}` : '***';
      console.log(`  ✅ ${varName} - Set (${masked})`);
    }
  });
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:');
  console.log(`  Required: ${present.length}/${requiredVars.production.length} set`);
  console.log(`  Optional: ${requiredVars.optional.length - optionalMissing.length}/${requiredVars.optional.length} set`);
  
  if (missing.length > 0) {
    console.log('\n❌ Missing Required Variables:');
    missing.forEach(v => console.log(`  - ${v}`));
    console.log('\n⚠️  Production site may not work correctly without these variables!');
    process.exit(1);
  } else {
    console.log('\n✅ All required environment variables are set!');
    process.exit(0);
  }
}

checkEnvVars();

