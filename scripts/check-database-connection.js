#!/usr/bin/env node
/**
 * Database Connection Check Script
 * Verifies Supabase database connection and basic queries
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pguipwhrxdzzrndbluxb.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ Error: Supabase key not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseConnection() {
  console.log('\n🗄️  Database Connection Check\n');
  console.log('='.repeat(60));
  console.log(`URL: ${supabaseUrl}`);
  console.log(`Key: ${supabaseKey.substring(0, 20)}...`);
  console.log('='.repeat(60) + '\n');
  
  const checks = [
    { name: 'Bookings Table', table: 'bookings' },
    { name: 'Rooms Table', table: 'rooms' },
    { name: 'Surf Camps Table', table: 'surf_camps' },
    { name: 'Clients Table', table: 'clients' },
    { name: 'Homepage Content', table: 'homepage_content' },
    { name: 'Page Content', table: 'page_content' },
  ];
  
  const results = [];
  
  for (const check of checks) {
    try {
      const start = Date.now();
      const { data, error, count } = await supabase
        .from(check.table)
        .select('*', { count: 'exact', head: true })
        .limit(1);
      
      const duration = Date.now() - start;
      
      if (error) {
        console.log(`❌ ${check.name} - Error: ${error.message}`);
        results.push({ name: check.name, success: false, error: error.message });
      } else {
        console.log(`✅ ${check.name} - Connected (${count || 0} rows, ${duration}ms)`);
        results.push({ name: check.name, success: true, count, duration });
      }
    } catch (error) {
      console.log(`❌ ${check.name} - Exception: ${error.message}`);
      results.push({ name: check.name, success: false, error: error.message });
    }
    
    // Small delay between checks
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`\n📊 Summary: ${successful}/${total} tables accessible`);
  
  if (successful === total) {
    console.log('✅ Database connection is healthy!');
    process.exit(0);
  } else {
    console.log('⚠️  Some tables are not accessible. Check database schema and permissions.');
    process.exit(1);
  }
}

checkDatabaseConnection().catch(error => {
  console.error('\n❌ Database check failed:', error.message);
  process.exit(1);
});

