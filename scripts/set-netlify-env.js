#!/usr/bin/env node

const { execSync } = require('child_process');

const siteId = '8cc7d7cd-e32d-4aa4-af5a-7694c0f4d7ad';

const envVars = {
  'NEXT_PUBLIC_SUPABASE_URL': 'https://zejrhceuuujzgyukdwnb.supabase.co',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplanJoY2V1dXVqemd5dWtkd25iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMDQ4MDksImV4cCI6MjA3MjY4MDgwOX0.yIqpTz-OTqcaL5h7GIzoBmRezoJD-MC2yPTpxvo-aNA',
  'SUPABASE_SERVICE_ROLE_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplanJoY2V1dXVqemd5dWtkd25iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwNDgwOSwiZXhwIjoyMDcyNjgwODA5fQ.RbzOLzCaOAsgaMixdACMLdPvLZjU9MPfXn8Y90gsxcc'
};

console.log('Setting Netlify environment variables...');

for (const [key, value] of Object.entries(envVars)) {
  try {
    console.log(`Setting ${key}...`);
    execSync(`netlify env:set "${key}" "${value}" --json`, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log(`✅ ${key} set successfully\n`);
  } catch (error) {
    console.error(`❌ Failed to set ${key}:`, error.message);
  }
}

console.log('Done! Triggering a new deployment...');
try {
  execSync('netlify deploy --build --prod', { stdio: 'inherit' });
} catch (error) {
  console.log('Note: You may need to trigger deployment manually from Netlify dashboard');
}

