#!/usr/bin/env node

/**
 * Verify database connection with provided credentials
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://pguipwhrxdzzrndbluxb.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function verifyConnection() {
  console.log('🔍 Verifying database connection...\n');
  
  if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
    console.log('💡 Set it in .env.local or environment variables');
    process.exit(1);
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // Test connection by querying rooms table
    console.log('📊 Testing database connection...');
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('id, name')
      .limit(5);
    
    if (roomsError) {
      console.error('❌ Database query failed:', roomsError.message);
      process.exit(1);
    }
    
    console.log(`✅ Connected successfully! Found ${rooms.length} rooms`);
    
    // Test bookings table
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('count')
      .limit(1);
    
    if (bookingsError) {
      console.error('❌ Bookings table query failed:', bookingsError.message);
    } else {
      console.log('✅ Bookings table accessible');
    }
    
    // Test surf_camps table
    const { data: camps, error: campsError } = await supabase
      .from('surf_camps')
      .select('id, name')
      .limit(5);
    
    if (campsError) {
      console.error('❌ Surf camps table query failed:', campsError.message);
    } else {
      console.log(`✅ Surf camps table accessible (${camps.length} camps)`);
    }
    
    // Test page_content table (CMS)
    const { data: pages, error: pagesError } = await supabase
      .from('page_content')
      .select('id, page_slug, section_type')
      .limit(5);
    
    if (pagesError) {
      console.error('❌ Page content table query failed:', pagesError.message);
    } else {
      console.log(`✅ CMS page_content table accessible (${pages.length} sections)`);
    }
    
    console.log('\n✅ All database connections verified successfully!');
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
  }
}

verifyConnection();

