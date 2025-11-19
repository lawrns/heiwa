const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars (simulate)
const SUPABASE_URL = 'https://zejrhceuuujzgyukdwnb.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runMigration() {
  console.log('🔄 Running cms_settings migration...');
  
  const migrationFile = path.join(__dirname, '..', 'migrations', '20250121_create_cms_settings.sql');
  const sql = fs.readFileSync(migrationFile, 'utf8');

  // Supabase JS client doesn't support direct SQL execution via API usually without pg driver
  // But we can try via rpc if setup, or just use the postgres connection string
  // Since we don't have direct postgres access easily in this environment without the password in clear text
  // We will try to use the "postgres" library if available, or fallback to printing instructions.
  
  // Check if table exists first
  const { data, error } = await supabase.from('cms_settings').select('count').single();
  
  if (!error) {
    console.log('✅ cms_settings table already exists.');
    return;
  }

  console.log('⚠️ Table check failed (expected if table missing):', error.message);
  console.log('🚀 Attempting to create table...');

  // Since we can't easily execute raw SQL via Supabase JS client without a helper function
  // We will output the SQL to be run manually in Supabase Dashboard
  
  console.log('\n📝 Please run the following SQL in your Supabase Dashboard SQL Editor:');
  console.log('---------------------------------------------------------------------');
  console.log(sql);
  console.log('---------------------------------------------------------------------');
}

runMigration();

