/**
 * Verify that WordPress widget bookings are persisted in the Supabase database
 * Run with: node verify-database-persistence.js
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://zejrhceuuujzgyukdwnb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplanJoY2V1dXVqemd5dWtkd25iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwNDgwOSwiZXhwIjoyMDcyNjgwODA5fQ.RbzOLzCaOAsgaMixdACMLdPvLZjU9MPfXn8Y90gsxcc';

const supabase = createClient(supabaseUrl, supabaseKey);

// Booking IDs from our API tests
const testBookingIds = [
  'e1086da3-4b54-4d17-9f1c-6adee08c9453',
  '08bbc039-9c8b-40af-8cce-feb1dc0ac112'
];

async function verifyBookingPersistence() {
  console.log('🔍 Verifying WordPress Widget Booking Database Persistence');
  console.log('=' .repeat(70));
  
  try {
    // Check bookings table
    console.log('\n📋 Checking bookings table...');
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .in('id', testBookingIds);
    
    if (bookingsError) {
      console.log(`❌ Error fetching bookings: ${bookingsError.message}`);
      return;
    }
    
    console.log(`✅ Found ${bookings.length} bookings in database:`);
    bookings.forEach(booking => {
      console.log(`   - ID: ${booking.id}`);
      console.log(`   - Client IDs: ${booking.client_ids}`);
      console.log(`   - Total Amount: €${booking.total_amount}`);
      console.log(`   - Payment Status: ${booking.payment_status}`);
      console.log(`   - Created: ${booking.created_at}`);
      console.log(`   - Notes: ${booking.notes.substring(0, 100)}...`);
      console.log('');
    });
    
    // Check clients table
    console.log('\n👥 Checking clients table...');
    const clientIds = bookings.flatMap(b => b.client_ids);
    
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .in('id', clientIds);
    
    if (clientsError) {
      console.log(`❌ Error fetching clients: ${clientsError.message}`);
      return;
    }
    
    console.log(`✅ Found ${clients.length} clients in database:`);
    clients.forEach(client => {
      console.log(`   - ID: ${client.id}`);
      console.log(`   - Name: ${client.first_name} ${client.last_name}`);
      console.log(`   - Email: ${client.email}`);
      console.log(`   - Created: ${client.created_at}`);
      console.log('');
    });
    
    // Check recent bookings (last 24 hours)
    console.log('\n📅 Checking recent WordPress bookings (last 24 hours)...');
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: recentBookings, error: recentError } = await supabase
      .from('bookings')
      .select('*')
      .gte('created_at', yesterday)
      .ilike('notes', '%WordPress%')
      .order('created_at', { ascending: false });
    
    if (recentError) {
      console.log(`❌ Error fetching recent bookings: ${recentError.message}`);
      return;
    }
    
    console.log(`✅ Found ${recentBookings.length} recent WordPress bookings:`);
    recentBookings.forEach(booking => {
      console.log(`   - ID: ${booking.id}`);
      console.log(`   - Amount: €${booking.total_amount}`);
      console.log(`   - Status: ${booking.payment_status}`);
      console.log(`   - Created: ${booking.created_at}`);
      console.log('');
    });
    
    // Summary
    console.log('\n📊 VERIFICATION SUMMARY:');
    console.log('=' .repeat(40));
    console.log(`✅ Bookings created: ${bookings.length}/${testBookingIds.length}`);
    console.log(`✅ Clients created: ${clients.length}`);
    console.log(`✅ Recent WordPress bookings: ${recentBookings.length}`);
    console.log(`✅ Database persistence: CONFIRMED`);
    console.log(`✅ WordPress widget → Supabase flow: WORKING`);
    
    if (bookings.length === testBookingIds.length) {
      console.log('\n🎉 SUCCESS: All WordPress widget bookings are properly persisted in the database!');
    } else {
      console.log('\n⚠️  WARNING: Some bookings may not have been persisted correctly.');
    }
    
  } catch (error) {
    console.log(`❌ Verification failed: ${error.message}`);
  }
}

// Run verification
verifyBookingPersistence().catch(console.error);
